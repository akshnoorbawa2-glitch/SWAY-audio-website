# Sway

A lightweight Windows background utility that automatically ducks your background music when another app plays sound, then fades it back in when it's done.

---

## What It Does

If you listen to Spotify or Apple Music while working, you've probably run into this: you open a YouTube link, join a quick Slack huddle, or watch a Twitter clip, and you have to manually pause your music or fumble with volume sliders.

Sway automates this entirely:

- When sound starts playing from a browser tab, video, or call, Sway smoothly lowers your music to 40% volume.
- Once that audio finishes, it waits a brief moment (1.5s) and fades your music back to full volume.
- Only media players get ducked. Voice chat in Discord, game audio, and system alerts are untouched.

No virtual audio cables, no third-party audio drivers, and no microphone access required.

---

## How It Was Made

Windows already has a built-in per-application volume mixer, but it doesn't offer dynamic audio ducking between arbitrary apps. 

Sway was built using:

- **C# & WASAPI (Windows Audio Session API)**: Instead of routing audio through virtual devices (which introduces latency and setup hassle), Sway hooks directly into Windows Core Audio sessions via WASAPI COM interfaces.
- **Continuous Meter Polling**: An event-driven loop samples peak audio meters across active render endpoints every 50ms.
- **Interpolated Gain Envelope**: Volume transitions use linear interpolation over a configurable millisecond window (default: 1000ms fade down, 1000ms fade up) so there are no sudden clicks or harsh volume jumps.
- **Zero Overhead Architecture**: Designed to stay out of the way — it sits silently in the system tray, uses under 15 MB of RAM, and sits at 0.0% CPU usage when idle.

---

## Installation

### Option 1: Download Pre-built Binary (Recommended)

1. Head over to the [Releases](https://github.com/akshnoorbawa2-glitch/Sway-Audio/releases) page.
2. Download `Sway.exe`.
3. Move it anywhere you like (e.g. `C:\Tools\Sway` or your user folder) and run it. 

*No installer needed — it runs as a single portable executable on Windows 10 and 11 (64-bit).*

### Option 2: Build from Source

You'll need the [.NET 8 SDK](https://dotnet.microsoft.com/download) installed.

```bash
git clone https://github.com/akshnoorbawa2-glitch/Sway-Audio.git
cd Sway-Audio
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
```

The output binary will be generated under `bin/Release/net8.0-windows/win-x64/publish/Sway.exe`.

---

## How to Use It

### Basic Workflow

1. Start `Sway.exe`. It will minimize to your system tray.
2. Play some music in Spotify, Apple Music, or VLC.
3. Open YouTube in Chrome or Edge and start playing a video. Sway will detect the audio and automatically fade down your music.
4. Pause or close the video. After a short 1.5-second buffer, your music smoothly ramps back to 100%.

### Hotkey & Quick HUD

Press **`Alt + Space`** at any time to pull up the quick HUD overlay. From here you can:
- Toggle ducking on/off temporarily.
- View live audio levels of currently playing apps.
- Adjust fade durations or exit the app.

### Custom Configuration

When you first launch Sway, it generates a `config.json` file in the same folder:

```json
{
  "hotkey": "Alt+Space",
  "duckTargetVolume": 0.40,
  "fadeDownDurationMs": 1000,
  "restoreDelayMs": 1500,
  "fadeUpDurationMs": 1000,
  "targetProcesses": [
    "spotify.exe",
    "AppleMusic.exe",
    "vlc.exe",
    "tidal.exe"
  ],
  "ignoredProcesses": [
    "discord.exe",
    "steam.exe"
  ],
  "runOnStartup": false
}
```

- **`targetProcesses`**: Add the `.exe` names of media players you want Sway to duck.
- **`ignoredProcesses`**: Apps that should never trigger ducking or be ducked (like Discord or games).
- **`fadeDownDurationMs` / `fadeUpDurationMs`**: Adjust how fast or gradual the volume fades feel.

---

## License

[MIT](LICENSE) &copy; 2026 Akshnoor Bawa
