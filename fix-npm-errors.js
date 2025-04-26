const fs = require("fs");
const glob = require("glob");

const patterns = [
  "node_modules/tempo-devtools",
  "node_modules/.tempo-devtools-*",
];

patterns.forEach((pattern) => {
  const matches = glob.sync(pattern);
  matches.forEach((match) => {
    try {
      fs.rmSync(match, { recursive: true, force: true });
      console.log(`Removed: ${match}`);
    } catch (err) {
      console.log(`Failed to remove ${match}: ${err.message}`);
    }
  });
});
