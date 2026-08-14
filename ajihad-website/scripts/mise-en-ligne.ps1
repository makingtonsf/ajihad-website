# Pilotage de la mise en ligne temporaire (serveur de production + tunnel).
#
#   .\scripts\mise-en-ligne.ps1 statut     état des deux processus et URL courante
#   .\scripts\mise-en-ligne.ps1 demarrer   relance ce qui est arrêté
#   .\scripts\mise-en-ligne.ps1 arreter    coupe tout
#
# À savoir : le tunnel « quick » de Cloudflare tire une NOUVELLE adresse à
# chaque démarrage. Après un redémarrage, relisez l'URL avec « statut ».

param([Parameter(Position = 0)][ValidateSet("statut", "demarrer", "arreter")][string]$action = "statut")

$racine = Split-Path -Parent $PSScriptRoot
$journaux = Join-Path $racine ".logs"
$cloudflared = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
if (-not (Test-Path $journaux)) { New-Item -ItemType Directory -Force $journaux | Out-Null }

function Get-Serveur {
  Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like "*dist*index.js*" }
}
function Get-Tunnel {
  Get-CimInstance Win32_Process -Filter "Name='cloudflared.exe'" -ErrorAction SilentlyContinue
}
function Get-Url {
  $fichiers = @("$journaux\tunnel.err", "$journaux\tunnel.log") | Where-Object { Test-Path $_ }
  if (-not $fichiers) { return $null }
  $m = Get-Content $fichiers -ErrorAction SilentlyContinue |
       Select-String -Pattern "https://[a-z0-9-]+\.trycloudflare\.com"
  if ($m) { return $m[-1].Matches[0].Value }
  return $null
}

switch ($action) {
  "arreter" {
    Get-Serveur | ForEach-Object { Write-Host "  arrêt serveur PID $($_.ProcessId)"; Stop-Process -Id $_.ProcessId -Force }
    Get-Tunnel  | ForEach-Object { Write-Host "  arrêt tunnel  PID $($_.ProcessId)"; Stop-Process -Id $_.ProcessId -Force }
    Write-Host "  tout est arrêté."
  }

  "demarrer" {
    if (-not (Get-Serveur)) {
      $env:NODE_ENV = "production"; $env:PORT = "3000"
      Start-Process -FilePath "node" -ArgumentList "dist/index.js" -WorkingDirectory $racine `
        -WindowStyle Hidden -RedirectStandardOutput "$journaux\serveur.log" -RedirectStandardError "$journaux\serveur.err"
      Write-Host "  serveur relancé"
      Start-Sleep -Seconds 4
    } else { Write-Host "  serveur déjà actif" }

    if (-not (Get-Tunnel)) {
      # On repart d'un journal vide, sinon on relit l'ancienne adresse.
      Remove-Item "$journaux\tunnel.err", "$journaux\tunnel.log" -ErrorAction SilentlyContinue
      Start-Process -FilePath $cloudflared -ArgumentList "tunnel", "--url", "http://localhost:3000", "--no-autoupdate" `
        -WindowStyle Hidden -RedirectStandardOutput "$journaux\tunnel.log" -RedirectStandardError "$journaux\tunnel.err"
      Write-Host "  tunnel relancé (nouvelle adresse)"
      Start-Sleep -Seconds 12
    } else { Write-Host "  tunnel déjà actif" }

    $url = Get-Url
    if ($url) { Write-Host "`n  URL PUBLIQUE : $url" } else { Write-Host "`n  adresse pas encore émise, relancez « statut » dans quelques secondes" }
  }

  "statut" {
    $s = Get-Serveur; $t = Get-Tunnel; $url = Get-Url
    Write-Host "  serveur  : $(if ($s) { "actif (PID $($s.ProcessId))" } else { 'ARRÊTÉ' })"
    Write-Host "  tunnel   : $(if ($t) { "actif (PID $($t.ProcessId))" } else { 'ARRÊTÉ' })"
    if ($url) { Write-Host "  URL      : $url" }

    if ($s -and $url) {
      try {
        $r = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 15 -UseBasicParsing
        Write-Host "  réponse  : HTTP $($r.StatusCode)"
        $robots = $r.Headers["X-Robots-Tag"]
        Write-Host "  indexation : $(if ($robots) { "bloquée ($robots)" } else { 'AUTORISÉE — vérifiez le domaine' })"
      } catch {
        Write-Host "  réponse  : injoignable — $($_.Exception.Message)"
      }
    }
  }
}
