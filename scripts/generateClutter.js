//scripts/generateClutter.js
const fs = require('fs');
const path = require('path');

const clutterDir = path.join(__dirname, '../public/all-user-data/clutter');
const outputFile = path.join(__dirname, '../src/import/clutter.js');

// Read files, filter for .png, and sort alphabetically
const files = fs.readdirSync(clutterDir)
  .filter(file => file.endsWith('.png'))
  .sort(); // Ensures consistent order

// Map files to numeric keys (0, 1, 2, ...)
const clutterImages = files.reduce((acc, file, index) => {
  acc[index.toString()] = `/all-user-data/clutter/${file}`;
  return acc;
}, {});

const output = `const clutterImages = ${JSON.stringify(clutterImages, null, 4)};\n\nexport default clutterImages;`;

fs.writeFileSync(outputFile, output);
console.log('✅ Clutter image map generated with numeric keys!');