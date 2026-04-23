$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\HM site dev.lnk")
$Shortcut.TargetPath = "C:\projects\hunyamunya\dev-site.bat"
$Shortcut.WorkingDirectory = "C:\projects\hunyamunya"
$Shortcut.Description = "Start Hunya Munya site dev server (localhost:3000)"
if (Test-Path "C:\Users\rippe\Desktop\HM-Logo.jpg") {
  # .ico preferred, but .jpg works as fallback display source via Shell32 only for some icons; skip icon if no .ico available.
}
$Shortcut.Save()
Write-Host "Shortcut created: $env:USERPROFILE\Desktop\HM site dev.lnk"
