const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve(__dirname, 'dist');
const MANIFEST_PATH = path.join(DIST_DIR, 'manifest.json');

console.log("🚀 Starting MAXIMUM-LAYER Build Verification (No Rename Mode)...");

if (fs.existsSync(MANIFEST_PATH)) {
    console.log("✅ Manifest verified in dist folder.");
} else {
    console.error("❌ Error: Manifest not found in dist!");
    process.exit(1);
}

// Verification: Check if some key files exist in dist with original names
const checkFiles = [
    'src/content/content.js',
    'src/content/apiKeyManager.js',
    'src/popup/popup.html'
];

checkFiles.forEach(f => {
    if (fs.existsSync(path.join(DIST_DIR, f))) {
        console.log(`✅ File verified: ${f}`);
    } else {
        console.warn(`⚠️  Warning: Expected file not found: ${f}`);
    }
});

console.log("🏁 Build Completed Successfully.");
