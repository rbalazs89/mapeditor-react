//scripts/generateMapblock.js
const fs = require('fs');
const path = require('path');

const mapblockDir = path.join(__dirname, '../public/all-user-data/mapblock');
const outputFile = path.join(__dirname, '../src/import/mapblock.js');

// Read files, filter for .png, and sort alphabetically
const files = fs.readdirSync(mapblockDir)
  .filter(file => file.endsWith('.png'))
  .sort(); // Ensures consistent order

// Map files to numeric keys (0, 1, 2, ...)
const mapblockImages = files.reduce((acc, file, index) => {
  acc[index.toString()] = `/all-user-data/mapblock/${file}`;
  return acc;
}, {});

const output = `const mapblockImages = ${JSON.stringify(mapblockImages, null, 4)};\n\nexport default mapblockImages;`;

fs.writeFileSync(outputFile, output);
console.log('✅ Mapblock image map generated with numeric keys!');