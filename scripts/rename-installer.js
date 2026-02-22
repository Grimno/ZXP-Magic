const fs = require("fs");
const path = require("path");

const bundleDir = path.join(__dirname, "..", "src-tauri", "target", "release", "bundle", "nsis");

if (!fs.existsSync(bundleDir)) {
  console.log("NSIS bundle dir not found, skipping rename.");
  process.exit(0);
}

const files = fs.readdirSync(bundleDir);
for (const file of files) {
  if (file.endsWith("-setup.exe") || file.endsWith(".exe")) {
    const oldPath = path.join(bundleDir, file);
    const newPath = path.join(bundleDir, "ZXP Magic Setup.exe");
    if (oldPath !== newPath) {
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed: ${file} → ZXP Magic Setup.exe`);
    }
  }
}
