const path = require('path');
const JavaScriptObfuscator = require('webpack-obfuscator');
const CopyPlugin = require('copy-webpack-plugin');
const glob = require('glob');

// Scan all JS files in src and keep original directory structure
const files = glob.sync('./src/**/*.js');
const entries = {};

files.forEach(file => {
  const relPath = path.relative('./src', file);
  const entryKey = relPath.replace(/\.js$/, '');
  
  if (!entryKey.startsWith('assets')) {
    entries[entryKey] = './' + file;
  }
});

module.exports = {
  mode: 'production',
  context: __dirname,
  entry: entries,
  output: {
    path: path.resolve(__dirname, 'dist/src'),
    filename: '[name].js', // Mantain original filename
    clean: true,
  },
  plugins: [
    new JavaScriptObfuscator({
      compact: true,
      
      // 1. Control Flow Pathological Transformation
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      
      // 2. Maximum Dead Code Bloat (Double the noise)
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 1, 
      
      // 3. String Array - Extreme Layering (MV3 Safe)
      stringArray: true,
      stringArrayEncoding: ['base64'], // Base64 is stable for MV3
      stringArrayThreshold: 1,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayIndexShift: true,
      
      // Extreme String Wrapping (15 layers)
      stringArrayWrappersCount: 15,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersParametersMaxCount: 15,
      stringArrayWrappersType: 'function',
      
      // 4. Expression & Identifier Obfuscation
      splitStrings: true,
      splitStringsChunkLength: 2, // Cut every 2 chars
      unicodeEscapeSequence: true,
      numbersToExpressions: true,
      transformObjectKeys: true,
      identifierNamesGenerator: 'hexadecimal',
      
      // 5. MV3 Policy Compliance
      debugProtection: false, // Must be FALSE (uses eval)
      selfDefending: false,    // Must be FALSE (uses eval)
      disableConsoleOutput: true,
      simplify: false,
    }, []),
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: path.resolve(__dirname, 'dist/manifest.json') },
        { from: 'src/assets', to: path.resolve(__dirname, 'dist/src/assets') },
        { from: 'src/popup/popup.html', to: path.resolve(__dirname, 'dist/src/popup/popup.html') },
      ],
    }),
  ],
  optimization: {
    minimize: false, // Obfuscator handles code compression
  },
};
