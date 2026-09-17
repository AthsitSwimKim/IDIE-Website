param([Parameter(Mandatory)][string]$Source,[Parameter(Mandatory)][string]$Output)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$Source=(Resolve-Path -LiteralPath $Source).Path
$Output=(Resolve-Path -LiteralPath $Output).Path
$groups=@(
  @{Name='01-php-api.zip';Files=@(Get-ChildItem -LiteralPath (Join-Path $Source 'api') -Recurse -File)+@(Get-ChildItem -LiteralPath (Join-Path $Source 'uploads') -Filter web.config -Recurse -File)},
  @{Name='02-assets.zip';Files=@(Get-ChildItem -LiteralPath (Join-Path $Source 'assets') -Recurse -File)},
  @{Name='03-root-files.zip';Files=@(Get-ChildItem -LiteralPath $Source -File)}
)
$results=foreach($group in $groups) {
  $archivePath=Join-Path $Output $group.Name
  if(Test-Path -LiteralPath $archivePath) { Remove-Item -LiteralPath $archivePath }
  $archive=[IO.Compression.ZipFile]::Open($archivePath,[IO.Compression.ZipArchiveMode]::Create)
  try {
    foreach($file in $group.Files) {
      $entryName=[IO.Path]::GetRelativePath($Source,$file.FullName).Replace('\','/')
      [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,$file.FullName,$entryName,[IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
  } finally { $archive.Dispose() }
  if((Get-Item -LiteralPath $archivePath).Length -ge 4000000) { throw "Archive exceeds 4MB: $archivePath" }
  $archive=[IO.Compression.ZipFile]::OpenRead($archivePath)
  try {
    if($archive.Entries.Count -ne $group.Files.Count) { throw 'Entry count mismatch' }
    foreach($file in $group.Files) {
      $entryName=[IO.Path]::GetRelativePath($Source,$file.FullName).Replace('\','/')
      $entry=$archive.GetEntry($entryName)
      if($null -eq $entry) { throw "Missing entry: $entryName" }
      $stream=$entry.Open(); $hash=[Security.Cryptography.SHA256]::Create()
      try { $actual=[Convert]::ToHexString($hash.ComputeHash($stream)) } finally { $stream.Dispose();$hash.Dispose() }
      if($actual -ne (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash) { throw "Hash mismatch: $entryName" }
    }
  } finally { $archive.Dispose() }
  @{Archive=$group.Name;Bytes=(Get-Item -LiteralPath $archivePath).Length;Files=$group.Files.Count;Verified=$true;SHA256=(Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash}
}
$results | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $Output 'archive-summary.json') -Encoding utf8
$results | ConvertTo-Json
