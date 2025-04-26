const fs = require("fs");
const path = require("path");

// Directories to clean up
const dirsToClean = ["node_modules/semver", "node_modules/.semver-*"];

console.log("Cleaning up problematic npm directories...");

// Clean up specific directories
dirsToClean.forEach((dirPattern) => {
  if (dirPattern.includes("*")) {
    // Handle wildcard patterns
    const baseDir = path.dirname(dirPattern);
    const pattern = path.basename(dirPattern);
    const regex = new RegExp(pattern.replace("*", ".*"));

    try {
      const files = fs.readdirSync(baseDir);
      files.forEach((file) => {
        if (regex.test(file)) {
          const fullPath = path.join(baseDir, file);
          try {
            fs.rmSync(fullPath, { recursive: true, force: true });
            console.log(`Removed ${fullPath}`);
          } catch (err) {
            console.log(`Failed to remove ${fullPath}: ${err.message}`);
          }
        }
      });
    } catch (err) {
      console.log(`Error reading directory ${baseDir}: ${err.message}`);
    }
  } else {
    // Handle direct paths
    try {
      if (fs.existsSync(dirPattern)) {
        fs.rmSync(dirPattern, { recursive: true, force: true });
        console.log(`Removed ${dirPattern}`);
      }
    } catch (err) {
      console.log(`Failed to remove ${dirPattern}: ${err.message}`);
    }
  }
});

console.log("Cleanup complete.");
