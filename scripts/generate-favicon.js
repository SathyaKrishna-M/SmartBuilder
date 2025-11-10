const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const toIco = require('to-ico');

async function generateFavicon() {
  const logoPath = path.join(__dirname, '../public/assets/branding/logo.svg');
  const outputPath = path.join(__dirname, '../public/favicon.ico');
  
  try {
    // Generate different sizes for favicon
    const sizes = [16, 32, 48];
    const buffers = [];
    
    for (const size of sizes) {
      const buffer = await sharp(logoPath)
        .resize(size, size)
        .png()
        .toBuffer();
      buffers.push(buffer);
    }
    
    // Convert PNG buffers to ICO
    const icoBuffer = await toIco(buffers);
    
    // Write ICO file
    fs.writeFileSync(outputPath, icoBuffer);
    console.log('✅ Favicon generated successfully at:', outputPath);
  } catch (error) {
    console.error('❌ Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon();

