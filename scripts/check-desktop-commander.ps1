<#
.SYNOPSIS
    Diagnostics for Desktop Commander Remote and Local MCP on Lap-tec.
.DESCRIPTION
    Safely verifies installation, process status, persistence, MCP config, and connectivity without exposing secrets.
#>

$ErrorActionPreference = "Continue"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "      DESKTOP COMMANDER HEALTH & DIAGNOSTIC REPORT         " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Timestamp : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
Write-Host "Machine   : $env:COMPUTERNAME (User: $env:USERNAME)"

# 1. Installation Status
Write-Host "`n[1/6] GLOBAL INSTALLATION CHECK" -ForegroundColor Yellow
$npmBin = "$env:APPDATA\npm\desktop-commander.cmd"
$npmPkgJson = "$env:APPDATA\npm\node_modules\@wonderwhy-er\desktop-commander\package.json"

if (Test-Path $npmBin) {
    Write-Host "  [OK] Canonical executable found: $npmBin" -ForegroundColor Green
    if (Test-Path $npmPkgJson) {
        $pkg = Get-Content $npmPkgJson -Raw | ConvertFrom-Json
        Write-Host "  [OK] Package: $($pkg.name) (Version: $($pkg.version))" -ForegroundColor Green
    }
} else {
    Write-Host "  [FAIL] Global desktop-commander not found at $npmBin" -ForegroundColor Red
}

$npmDir = "$env:APPDATA\npm"
if ($env:Path -notmatch [regex]::Escape($npmDir)) {
    $env:Path = "$npmDir;$env:Path"
}
$whereCmd = where.exe desktop-commander 2>$null
if ($whereCmd) {
    Write-Host "  [OK] Resolves in PATH via where.exe:" -ForegroundColor Green
    $whereCmd | ForEach-Object { Write-Host "       $_" }
} else {
    Write-Host "  [WARN] Not found in PATH environment variable" -ForegroundColor Yellow
}

# 2. Configuration & Authentication Status
Write-Host "`n[2/6] CONFIGURATION & DEVICE REGISTRATION" -ForegroundColor Yellow
$deviceDir = "$HOME\.desktop-commander-device"
$deviceJsonPath = "$deviceDir\device.json"

if (Test-Path $deviceJsonPath) {
    Write-Host "  [OK] Device config exists: $deviceJsonPath" -ForegroundColor Green
    try {
        $devData = Get-Content $deviceJsonPath -Raw | ConvertFrom-Json
        Write-Host "  [OK] Device ID: $($devData.deviceId)" -ForegroundColor Green
        $hasRefresh = [string]::IsNullOrEmpty($devData.session.refresh_token) -eq $false
        Write-Host "  [OK] Persisted Auth Session Present: $hasRefresh (Tokens redacted)" -ForegroundColor Green
    } catch {
        Write-Host "  [WARN] Failed to parse device.json: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [FAIL] Missing device.json at $deviceJsonPath" -ForegroundColor Red
}

# 3. Running Process Check
Write-Host "`n[3/6] RUNNING PROCESSES" -ForegroundColor Yellow
$procs = Get-CimInstance Win32_Process | Where-Object { 
    $_.CommandLine -match "desktop-commander" -or 
    $_.CommandLine -match "run-desktop-commander"
}

if ($procs) {
    Write-Host "  [OK] Active Desktop Commander processes found ($($procs.Count) process(es)):" -ForegroundColor Green
    foreach ($p in $procs) {
        $summary = $p.CommandLine
        if ($summary.Length -gt 120) { $summary = $summary.Substring(0, 117) + "..." }
        Write-Host "       PID $($p.ProcessId) ($($p.Name)) -> $summary"
    }
} else {
    Write-Host "  [FAIL] No Desktop Commander processes currently running!" -ForegroundColor Red
}

# 4. Persistence / Autostart Mechanisms
Write-Host "`n[4/6] STARTUP & PERSISTENCE MECHANISM" -ForegroundColor Yellow
$startupLnk = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\Desktop Commander Remote.lnk"
if (Test-Path $startupLnk) {
    Write-Host "  [OK] Windows Startup shortcut: PRESENT" -ForegroundColor Green
    Write-Host "       $startupLnk"
} else {
    Write-Host "  [WARN] Windows Startup shortcut: MISSING" -ForegroundColor Yellow
}

$runKey = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "DesktopCommanderRemote" -ErrorAction SilentlyContinue
if ($runKey -and $runKey.DesktopCommanderRemote) {
    Write-Host "  [OK] HKCU Registry Run Key: PRESENT" -ForegroundColor Green
    Write-Host "       Command: $($runKey.DesktopCommanderRemote)"
} else {
    Write-Host "  [WARN] HKCU Registry Run Key: MISSING" -ForegroundColor Yellow
}

# 5. Antigravity MCP Configuration
Write-Host "`n[5/6] ANTIGRAVITY MCP REGISTRATION" -ForegroundColor Yellow
$configs = @(
    "$HOME\.gemini\config\mcp_config.json",
    "$HOME\.gemini\antigravity-ide\mcp_config.json"
)

foreach ($cfg in $configs) {
    if (Test-Path $cfg) {
        $cfgJson = Get-Content $cfg -Raw | ConvertFrom-Json
        if ($cfgJson.mcpServers."desktop-commander") {
            Write-Host "  [OK] desktop-commander registered in: $cfg" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] desktop-commander missing in: $cfg" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [INFO] Config path not found: $cfg"
    }
}

# 6. Remote Service Reachability & Recent Logs
Write-Host "`n[6/6] CONNECTIVITY & LOG STATUS" -ForegroundColor Yellow
try {
    $info = Invoke-RestMethod -Uri "https://mcp.desktopcommander.app/api/mcp-info" -Method Get -TimeoutSec 5
    Write-Host "  [OK] Remote MCP endpoint reachable (mcp.desktopcommander.app)" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Failed to query mcp.desktopcommander.app: $_" -ForegroundColor Yellow
}

$logPath = "$deviceDir\desktop-commander.log"
if (Test-Path $logPath) {
    Write-Host "`n  Recent log entries (last 6 lines):" -ForegroundColor Cyan
    Get-Content $logPath -Tail 6 | ForEach-Object { Write-Host "    $_" }
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "                  DIAGNOSTIC COMPLETE                       " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
