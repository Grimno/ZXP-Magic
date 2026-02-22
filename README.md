# ZXP Magic

A lightweight Adobe CEP extension manager built with Tauri + React.

**Install, manage, and uninstall `.zxp` / `.zxpinstall` files** without needing ZXPInstaller or ExManCmd.

![ZXP Magic screenshot](public/screenshot.png)

## Features

- Drag & drop or file picker to install extensions
- Lists all installed CEP extensions with metadata
- One-click uninstall
- CEP Debug Mode toggle (PlayerDebugMode registry / plist)
- Works on **Windows** and **macOS**

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) 18+
- [Tauri CLI prerequisites](https://tauri.app/start/prerequisites/)

### Development

```bash
npm install
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

The installer/binary will be in `src-tauri/target/release/bundle/`.

## How It Works

ZXP files are ZIP archives containing a `CSXS/manifest.xml`. ZXP Magic:
1. Reads the manifest to extract extension metadata (ID, name, version, compatible apps)
2. Extracts the archive into the system CEP extensions folder
3. Skips `META-INF/` (ZXP signature files) — not needed for local installs

**Extensions folder locations:**
- Windows: `%PROGRAMFILES(X86)%\Common Files\Adobe\CEP\extensions\`
- macOS: `/Library/Application Support/Adobe/CEP/extensions/`

## Tech Stack

- [Tauri 2](https://tauri.app/) — native desktop shell
- [React 19](https://react.dev/) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide React](https://lucide.dev/)

## License

MIT
