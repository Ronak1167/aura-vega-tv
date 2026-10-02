# Desktop Commander Remote & Local MCP Setup Guide

**Machine:** `Lap-tec` (Windows 11)  
**User:** `Ronak Jain`  
**Date of Verification:** October 2, 2026  
**Status:** Online & Fully Operational  

---

## 1. Executive Summary & Root Cause Analysis

### What Was Wrong
Remote Desktop Commander previously reported `Lap-tec` as **OFFLINE**, with the last-seen timestamp many hours old. ChatGPT was unable to remotely access or control this machine.

### Root Cause
1. **Interactive Process Lifetime:** The previous connection had been initiated via an ad-hoc console command (`npx @wonderwhy-er/desktop-commander@latest remote`). When that interactive PowerShell session was closed or the machine was restarted, the Node.js process terminated. Because there was no Windows service, scheduled task, or background daemon configured, the process stayed dead.
2. **Missing System Persistence:** Desktop Commander Remote was neither registered in the Windows Startup directory nor in the Windows Registry Run keys.
3. **Fragile NPX Cache:** Desktop Commander was being invoked from an ephemeral npx cache path (`C:\Users\Ronak Jain\AppData\Local\npm-cache\_npx\4b4c857f6efdfb61\...`).
4. **PATH Environment Gap:** `C:\Users\Ronak Jain\AppData\Roaming\npm` was missing from the User and System `PATH` environment variable. As a result, Windows `where.exe desktop-commander` failed and commands could not resolve the executable by name.
5. **Missing Antigravity MCP Registration:** `desktop-commander` was not registered in Antigravity's global `mcp_config.json`, meaning local sessions could not invoke its stdio MCP server.

---

## 2. Architecture & Canonical Installation

| Component | Canonical Location |
| :--- | :--- |
| **Package** | `@wonderwhy-er/desktop-commander@0.2.52` (Installed globally via npm) |
| **Global Executable** | `C:\Users\Ronak Jain\AppData\Roaming\npm\desktop-commander.cmd` |
| **Device Config & Auth** | `C:\Users\Ronak Jain\.desktop-commander-device\device.json` |
| **Config Backup** | `C:\Users\Ronak Jain\.desktop-commander-device\device.json.bak` |
| **Supervisor Script** | `C:\Users\Ronak Jain\.desktop-commander-device\run-desktop-commander.ps1` |
| **Silent Launcher** | `C:\Users\Ronak Jain\.desktop-commander-device\start-desktop-commander-silent.vbs` |
| **Stop Script** | `C:\Users\Ronak Jain\.desktop-commander-device\stop-desktop-commander.ps1` |
| **Live Log File** | `C:\Users\Ronak Jain\.desktop-commander-device\desktop-commander.log` |
| **Startup Shortcut** | `C:\Users\Ronak Jain\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\Desktop Commander Remote.lnk` |
| **Registry Run Key** | `HKCU:\Software\Microsoft\Windows\CurrentVersion\Run\DesktopCommanderRemote` |
| **Antigravity MCP Config** | `C:\Users\Ronak Jain\.gemini\config\mcp_config.json` & `~/.gemini/antigravity-ide/mcp_config.json` |

---

## 3. Persistence & Supervision Mechanism

Desktop Commander Remote requires an active user session because it interacts with the user's desktop, windows, and display surface. LocalSystem Windows Services (Session 0) are incapable of desktop interaction.

To achieve robust persistence without popup windows:
1. **Silent VBS Launcher (`start-desktop-commander-silent.vbs`):** Runs the PowerShell supervisor using `WScript.Shell.Run` with window style `0` (completely hidden).
2. **Supervisor Script (`run-desktop-commander.ps1`):**
   - Implements duplicate-process prevention (checks running command lines via `Win32_Process` before starting).
   - Launches `desktop-commander remote` with real-time redirected logging to `desktop-commander.log`.
   - Rotates logs automatically when exceeding 10MB.
   - Monitors the child process: if terminated or crashed, automatically restarts it after a 5-second backoff.
   - Listens for a clean shutdown signal (`stop.signal`).
3. **Dual Autostart Redundancy:**
   - **Windows Startup Folder:** `Desktop Commander Remote.lnk` executes upon user login.
   - **Registry Run Key:** `HKCU:\Software\Microsoft\Windows\CurrentVersion\Run\DesktopCommanderRemote` provides secondary boot persistence.

---

## 4. Antigravity MCP Configuration

Desktop Commander is registered in both global Antigravity MCP files:
- `C:\Users\Ronak Jain\.gemini\config\mcp_config.json`
- `C:\Users\Ronak Jain\.gemini\antigravity-ide\mcp_config.json`

```json
{
  "mcpServers": {
    "desktop-commander": {
      "command": "C:\\Users\\Ronak Jain\\AppData\\Roaming\\npm\\desktop-commander.cmd",
      "args": [],
      "env": {}
    }
  }
}
```

*Note: The local stdio MCP server for Antigravity runs independently of the background Remote Device supervisor without port or channel conflict.*

---

## 5. Diagnostic & Management Commands

### Run System Health Check
Run the automated diagnostic script:
```powershell
pwsh -File "c:\Users\Ronak Jain\aura-vega-tv\scripts\check-desktop-commander.ps1"
```

### Inspect Live Connection Logs
```powershell
Get-Content "$HOME\.desktop-commander-device\desktop-commander.log" -Tail 30
```

### Cleanly Restart Background Service
```powershell
# Stop existing service
pwsh -File "$HOME\.desktop-commander-device\stop-desktop-commander.ps1"

# Start background service
wscript.exe "$HOME\.desktop-commander-device\start-desktop-commander-silent.vbs"
```

---

## 6. Safety Warning: Commands NOT to Run

> [!CAUTION]
> **DO NOT RUN BLIND KILL COMMANDS:**
> - `Stop-Process -Name node -Force`
> - `taskkill /F /IM node.exe`
> - `taskkill /F /IM powershell.exe`
> 
> Running blanket kill commands will terminate Antigravity IDE, language servers, build watchers, and the project dev servers.
> 
> **Safe Process Management:**
> Always filter by command line using `Win32_Process` or use the dedicated stop script:
> ```powershell
> pwsh -File "$HOME\.desktop-commander-device\stop-desktop-commander.ps1"
> ```

---

## 7. How ChatGPT and Antigravity Use Desktop Commander

1. **ChatGPT Remote Control:**
   - ChatGPT communicates through the Remote MCP endpoint at `https://mcp.desktopcommander.app`.
   - The persistent background supervisor on `Lap-tec` maintains a secure Supabase Realtime channel (`user:a98bb703-532d-44ea-8c11-bf4dc42a83e3`).
   - When ChatGPT dispatches desktop commands (file inspection, command execution, UI interaction), they are received via the subscribed channel, executed by the local Desktop Commander MCP instance, and results are returned immediately.
2. **Antigravity IDE Pairing:**
   - Antigravity can invoke `desktop-commander` as a local MCP server over stdio across any workspace.
   - Both agents can collaborate on the codebase with full machine parity.
