// Press data shared by /press and the artist press kits.
//
// These entries get edited whenever a claim is checked or a citation rots, so
// they live in one place rather than inline in a page: two copies would drift
// the first time a station came off one list and not the other.

export type Quote = {
  quote: string;
  source: string;
  date: string;
  release: string;
  releasePath?: string;
  url?: string;
};

export type Play = {
  date: string;
  host?: string;
  artist: string;
  track?: string;
  note?: string;
  url?: string;
};

export type Station = {
  name: string;
  location: string;
  sourcePath?: string;
  plays: Play[];
};

export type DJSupportPlay = {
  date: string;
  track: string;
  artist: string;
  note?: string;
  releasePath?: string;
  url?: string;
};

export type DJSupportEntry = {
  dj: string;
  venue: string;
  plays: DJSupportPlay[];
};

export type Listing = {
  label: string;
  url: string;
};

export const PRESS_QUOTES: Quote[] = [
  {
    quote:
      "A heady trip into the deepest and warmest electronic bliss-core. Rykard has created a record of sublime electronic exploration.",
    source: "I Heart Noise",
    date: "February 2020",
    release: "Explorers Vol. 2",
    releasePath: "/catalog/hmb005b-explorers-vol-2",
    url: "https://ihrtn.net/review-rykard-explorers-vol-2/",
  },
  {
    quote:
      "Signature vibration combining hip-hop instrumental rhythms with atmospheric melodies.",
    source: "Pirate!Pirate!",
    date: "Artist feature",
    release: "Rykard artist profile",
    url: "https://piratepirate.com/rykard/",
  },
  {
    quote:
      "Rykard is back with a new form of electronic bliss on The Explorers Vol. 1.",
    source: "Fourculture Magazine",
    date: "July 2019",
    release: "Explorers Vol. 1",
    releasePath: "/catalog/hmb005a-explorers-vol-1",
    url: "https://fourculture.com/rykard-is-back-with-a-new-form-of-electronic-bliss-on-the-explorers-vol-1/",
  },
  {
    quote:
      "Recommended: Rykard, Hell Bent (dedpop).",
    source: "Darkfloor",
    date: "2009",
    release: "Pre-HMR Dedpop release",
    url: "https://darkfloor.co.uk/recommended-rykard-hell-bent-dedpop/",
  },
];

export const STATIONS: Station[] = [
  {
    name: "BBC Radio 6 Music",
    location: "UK, national",
    sourcePath:
      "/news/2010/rykard-featured-on-bbc-radio-6-with-tom-robinson",
    plays: [
      {
        date: "Apr 14, 2010",
        host: "Tom Robinson",
        artist: "Rykard",
        track: "North Cormorant Obscurity",
        url: "https://www.youtube.com/watch?v=WPjQrGViQk4",
      },
    ],
  },
  {
    name: "89.9 FM KCRW",
    location: "Los Angeles / Santa Monica, CA",
    sourcePath:
      "/news/2010/anne-litt-kcrw-hammers-rykard-down-with-ginny-on-air",
    plays: [
      {
        date: "Apr 24, 2010",
        host: "Anne Litt",
        artist: "Rykard",
        track: "Down with Ginny",
        url: "http://newmedia.kcrw.com/tracklists/index.php?channel=Live&date_from=2010-04-24&host=Anne%20Litt&search_type=2",
      },
      {
        date: "May 22, 2010",
        host: "Anne Litt",
        artist: "Rykard",
        track: "Down with Ginny",
        url: "http://newmedia.kcrw.com/tracklists/index.php?channel=Live&date_from=2010-05-22&host=Anne%20Litt&search_type=2",
      },
      {
        date: "May 23, 2010",
        host: "Anne Litt",
        artist: "Rykard",
        track: "Monolithic",
        url: "http://newmedia.kcrw.org/tracklists/?channel=Live&host=Anne%20Litt&date_from=2010-05-23",
      },
      {
        date: "May 27, 2010",
        host: "Morning Becomes Eclectic",
        artist: "Rykard",
        track: "Down with Ginny",
        url: "http://newmedia.kcrw.org/tracklists/?channel=Live&host=Morning%20Becomes%20Eclectic&date_from=2010-05-27",
      },
      {
        date: "Jun 5, 2010",
        host: "Anne Litt",
        artist: "Rykard",
        track: "Down with Ginny",
        url: "http://newmedia.kcrw.com/tracklists/index.php?channel=Live&date_from=2010-06-05&host=Anne%20Litt&search_type=2",
      },
      {
        date: "Aug 7, 2010",
        host: "Anne Litt",
        artist: "Rykard",
        track: "Down with Ginny",
        url: "http://newmedia.kcrw.com/tracklists/index.php?channel=Live&host=Anne%20Litt&date_from=2010-08-07",
      },
    ],
  },
  {
    name: "KEXP",
    location: "Seattle, USA",
    sourcePath: "/news/2010/rykard-accepted-into-pandora-radio",
    plays: [
      {
        date: "2010",
        artist: "Rykard",
        note: "Arrive the Radio Beacon release window",
      },
    ],
  },
  {
    name: "90.7 FM KALX",
    location: "Berkeley, USA",
    sourcePath:
      "/news/2010/rykard-featured-on-kalx-90-7-berkeley-california-usa",
    plays: [
      {
        date: "Jul 12, 2010",
        artist: "Rykard",
        track: "North Cormorant Obscurity",
      },
      {
        date: "Jul 12, 2010",
        artist: "Rykard",
        track: "The Rock Hewn",
      },
    ],
  },
  {
    name: "BBC Radio Bristol",
    location: "Bristol, UK",
    sourcePath: "/news/2010/rykard-featured-on-bbc-radio-bristol",
    plays: [
      {
        date: "2010",
        artist: "Rykard",
        track: "The Rock Hewn",
        url: "https://www.youtube.com/watch?v=fkKHBO-gUeA",
      },
    ],
  },
  {
    name: "CBC Radio 2",
    location: "Canada, national music channel",
    sourcePath: "/news/2010/rykard-accepted-into-pandora-radio",
    plays: [
      {
        date: "2010",
        artist: "Rykard",
        note: "Arrive the Radio Beacon release window",
      },
    ],
  },
  {
    name: "BBC Radio Norfolk",
    location: "Norfolk, UK",
    sourcePath:
      "/news/2011/catnip-claws-featured-on-legendary-bbc-radio-norfolk",
    plays: [
      {
        date: "Jul 22, 2011",
        artist: "Catnip & Claws",
        track: "Old Shoes",
        url: "https://www.youtube.com/watch?v=-GeMZ9N09us",
      },
    ],
  },
  {
    name: "Fourculture Radio",
    location: "UK / online",
    plays: [
      {
        date: "Oct 25, 2018",
        host: "The Jupiter Room Transmissions",
        artist: "Rykard",
        track: "Guest mix + interview",
        note: "60-minute slot with unreleased Rykard material",
        url: "https://fourculture.com/the-jupiter-room-transmissions-october-2018-rykard/",
      },
    ],
  },
];

export const DJ_SUPPORT: DJSupportEntry[] = [
  {
    dj: "John Digweed",
    venue: "Kiss 100, London",
    plays: [
      {
        date: "2003",
        artist: "Evan Marcus",
        track: "Ten Feet From Heaven",
        note: "White-label era, ahead of the official HMR003 release",
        releasePath: "/catalog/hmr003-ten-feet-from-heaven",
      },
      {
        date: "Jul 31, 2005",
        artist: "Darius Kohanim",
        track: "Revitalized (Habersham Remix)",
        note: "Habersham guest hour, track 10 of the set (HMR005 remix)",
        releasePath: "/catalog/hmr005-revitalized-ep",
        url: "https://www.buenosaliens.com/foros/mensajes.cfm/id.20432.t.transitions-by-john-digweed-ii.htm",
      },
    ],
  },
  {
    dj: "Sasha",
    venue: "Warung Beach Club, Brazil",
    plays: [
      {
        date: "Feb 28, 2006",
        artist: "Habersham & Darius Kohanim",
        track: "Dune In Erf Minor",
        releasePath: "/catalog/hmdigital004-dune-in-erf-minor",
        url: "https://www.1001tracklists.com/tracklist/dvlb69/sasha-warung-beach-club-brazil-2006-02-28.html",
      },
    ],
  },
];

export const LISTINGS: Listing[] = [
  { label: "Resident Advisor artist", url: "https://ra.co/dj/rykard" },
  { label: "Resident Advisor label", url: "https://ra.co/labels/385" },
  {
    label: "AllMusic, Arrive the Radio Beacon",
    url: "https://www.allmusic.com/album/release/arrive-the-radio-beacon-mr0004948967",
  },
  {
    label: "AllMusic, Luminosity",
    url: "https://www.allmusic.com/album/luminosity-mw0003211182",
  },
  {
    label: "AllMusic, HMR label",
    url: "https://www.allmusic.com/artist/hunya-munya-mn0002854507",
  },
  { label: "Last.fm", url: "https://www.last.fm/music/RYKARD" },
  { label: "Rate Your Music", url: "https://rateyourmusic.com/artist/rykard" },
];

export const PRESS_EMAIL = "contact@hunyamunyarecords.com";
