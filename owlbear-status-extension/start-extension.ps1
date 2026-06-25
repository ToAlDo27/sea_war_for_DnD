$ErrorActionPreference = "Stop"
$port = 5173
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "Owlbear extension URL:" -ForegroundColor Cyan
Write-Host "http://localhost:$port/manifest.json" -ForegroundColor Yellow
Write-Host "http://127.0.0.1:$port/manifest.json" -ForegroundColor Yellow
Write-Host ""
Write-Host "Keep this window open while using the Owlbear extension." -ForegroundColor DarkGray
Write-Host "Press Ctrl+C to stop the local server." -ForegroundColor DarkGray
Write-Host ""

Add-Type -AssemblyName System.Net

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")

function Get-ContentType([string]$path) {
  switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8"; break }
    ".json" { "application/json; charset=utf-8"; break }
    ".svg" { "image/svg+xml; charset=utf-8"; break }
    ".css" { "text/css; charset=utf-8"; break }
    ".js" { "application/javascript; charset=utf-8"; break }
    ".png" { "image/png"; break }
    ".jpg" { "image/jpeg"; break }
    ".jpeg" { "image/jpeg"; break }
    default { "application/octet-stream" }
  }
}

function Send-Text($response, [int]$status, [string]$text) {
  $response.StatusCode = $status
  $response.ContentType = "text/plain; charset=utf-8"
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
  $response.ContentLength64 = $bytes.Length
  $response.OutputStream.Write($bytes, 0, $bytes.Length)
}

try {
  $listener.Start()
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $response.Headers.Set("Access-Control-Allow-Origin", "*")
    $response.Headers.Set("Access-Control-Allow-Methods", "GET, OPTIONS")
    $response.Headers.Set("Access-Control-Allow-Headers", "Content-Type")
    $response.Headers.Set("Cache-Control", "no-store")

    if ($request.HttpMethod -eq "OPTIONS") {
      $response.StatusCode = 204
      $response.Close()
      continue
    }

    $relative = [Uri]::UnescapeDataString($request.Url.AbsolutePath.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($relative)) {
      $relative = "index.html"
    }
    $relative = $relative -replace "/", [System.IO.Path]::DirectorySeparatorChar
    $candidate = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $relative))

    if (-not $candidate.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
      Send-Text $response 403 "Forbidden"
      $response.Close()
      continue
    }

    if (-not [System.IO.File]::Exists($candidate)) {
      Send-Text $response 404 "Not found"
      $response.Close()
      continue
    }

    $bytes = [System.IO.File]::ReadAllBytes($candidate)
    $response.StatusCode = 200
    $response.ContentType = Get-ContentType $candidate
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
    $response.Close()
  }
} finally {
  if ($listener.IsListening) {
    $listener.Stop()
  }
  $listener.Close()
}
