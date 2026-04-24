#!/usr/bin/env node
/*
 * stats-cron.js
 *
 * Parses Nginx access logs and writes a JSON snapshot matching the
 * WebTraffic Tracker custom source spec (see traffic-tracker/CLAUDE.md).
 * Designed to run from cron every minute.
 *
 * Env vars:
 *   STATS_LOG_PATH    - path to access log. Default: /var/log/nginx/access.log
 *   STATS_OUTPUT_PATH - where to write the JSON atomically.
 *                       Default: /var/www/hunyamunya/api/stats.json
 *
 * Writes are atomic: output is first written to <path>.tmp then renamed.
 * Exits 0 on success, non-zero on failure (so cron MAILTO can alert).
 */

const fs = require("fs/promises");
const path = require("path");
const zlib = require("zlib");
const { promisify } = require("util");

const gunzip = promisify(zlib.gunzip);

const ACCESS_LOG_PATH = process.env.STATS_LOG_PATH || "/var/log/nginx/access.log";
const OUTPUT_PATH = process.env.STATS_OUTPUT_PATH || "/var/www/hunyamunya/api/stats.json";

const LOG_LINE_REGEX =
  /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+) [^"]*" (\d+) (\d+)/;
const NGINX_DATE_REGEX =
  /^(\d+)\/(\w+)\/(\d+):(\d+):(\d+):(\d+) ([+-]\d+)$/;
const MONTH_MAP = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04",
  May: "05", Jun: "06", Jul: "07", Aug: "08",
  Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

function parseNginxDate(dateStr) {
  const m = dateStr.match(NGINX_DATE_REGEX);
  if (!m) return 0;
  const [, day, monthName, year, hour, min, sec, tz] = m;
  const month = MONTH_MAP[monthName] || "01";
  const iso = `${year}-${month}-${day.padStart(2, "0")}T${hour}:${min}:${sec}${tz}`;
  return new Date(iso).getTime();
}

function parseLogLine(line) {
  const match = line.match(LOG_LINE_REGEX);
  if (!match) return null;
  const [, ip, dateStr, method, reqPath, statusStr, bytesStr] = match;
  const timestamp = parseNginxDate(dateStr);
  if (!timestamp) return null;
  return {
    timestamp,
    ip,
    method,
    path: reqPath,
    status: parseInt(statusStr, 10),
    bytes: parseInt(bytesStr, 10) || 0,
  };
}

async function readLogFile(filePath, cutoff) {
  const entries = [];
  try {
    const content = await fs.readFile(filePath, "utf-8");
    for (const line of content.split("\n")) {
      if (!line) continue;
      const entry = parseLogLine(line);
      if (entry && entry.timestamp >= cutoff) entries.push(entry);
    }
  } catch {
    // Missing or unreadable file is fine: log rotation may remove rotated files.
  }
  return entries;
}

async function readGzLogFile(filePath, cutoff) {
  const entries = [];
  try {
    const compressed = await fs.readFile(filePath);
    const content = (await gunzip(compressed)).toString("utf-8");
    for (const line of content.split("\n")) {
      if (!line) continue;
      const entry = parseLogLine(line);
      if (entry && entry.timestamp >= cutoff) entries.push(entry);
    }
  } catch {
    // Same as above.
  }
  return entries;
}

async function readAllLogs() {
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const [current, rotated, rotatedGz] = await Promise.all([
    readLogFile(ACCESS_LOG_PATH, cutoff),
    readLogFile(ACCESS_LOG_PATH + ".1", cutoff),
    readGzLogFile(ACCESS_LOG_PATH + ".2.gz", cutoff),
  ]);
  return [...current, ...rotated, ...rotatedGz];
}

function aggregate(entries) {
  const now = Date.now();
  const t5m = now - 5 * 60 * 1000;
  const t1h = now - 60 * 60 * 1000;
  const t24h = now - 24 * 60 * 60 * 1000;
  const t48h = now - 48 * 60 * 60 * 1000;

  let requests5m = 0;
  let requests1h = 0;
  let requests24h = 0;
  let requests24hPrev = 0;
  let bandwidth24h = 0;
  let status2xx = 0;
  let status3xx = 0;
  let status4xx = 0;
  let status5xx = 0;

  const uniqueIps = new Set();
  const pathCounts = Object.create(null);
  const hourly = new Array(24).fill(0);

  for (const e of entries) {
    if (e.timestamp < t48h) continue;
    if (e.timestamp < t24h) {
      requests24hPrev++;
      continue;
    }
    requests24h++;
    bandwidth24h += e.bytes;
    uniqueIps.add(e.ip);

    if (e.status >= 200 && e.status < 300) status2xx++;
    else if (e.status >= 300 && e.status < 400) status3xx++;
    else if (e.status >= 400 && e.status < 500) status4xx++;
    else if (e.status >= 500) status5xx++;

    pathCounts[e.path] = (pathCounts[e.path] || 0) + 1;

    const hoursAgo = Math.floor((now - e.timestamp) / (60 * 60 * 1000));
    const index = 23 - hoursAgo;
    if (index >= 0 && index < 24) hourly[index]++;

    if (e.timestamp >= t1h) requests1h++;
    if (e.timestamp >= t5m) requests5m++;
  }

  let topPath = "/";
  let topPathCount = 0;
  for (const [p, count] of Object.entries(pathCounts)) {
    if (count > topPathCount) {
      topPath = p;
      topPathCount = count;
    }
  }

  return {
    version: "1.0",
    fetchedAt: now,
    requests5m,
    requests1h,
    requests24h,
    uniqueVisitors24h: uniqueIps.size,
    bandwidth24h,
    requests24hPrev,
    status2xx,
    status3xx,
    status4xx,
    status5xx,
    cacheHitRatio: 0,
    topPath,
    topCountry: "unknown",
    hourly,
  };
}

async function writeAtomic(outputPath, json) {
  const dir = path.dirname(outputPath);
  await fs.mkdir(dir, { recursive: true });
  const tmp = outputPath + ".tmp";
  await fs.writeFile(tmp, json, { encoding: "utf-8", mode: 0o644 });
  await fs.rename(tmp, outputPath);
}

async function main() {
  const entries = await readAllLogs();
  const payload = aggregate(entries);
  await writeAtomic(OUTPUT_PATH, JSON.stringify(payload));
}

main().catch((err) => {
  console.error("[stats-cron] failed:", err && err.stack ? err.stack : err);
  process.exit(1);
});
