import QRCode from 'qrcode';

/**
 * Generate QR code as data URL
 * @param {string} url - The URL to encode in QR code
 * @returns {Promise<string>} Base64 data URL of QR code
 */
export const generateQRCodeDataURL = async (url) => {
  try {
    console.log('🔳 Generating QR Code for URL:', url);
    
    const qrDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',  // High error correction
      type: 'image/png',
      quality: 0.95,
      margin: 4,                   // White border
      width: 500,                  // Size in pixels
      color: {
        dark: '#000000',           // QR code color
        light: '#FFFFFF'           // Background color
      }
    });
    
    console.log('✅ QR Code generated successfully');
    console.log('   Data URL starts with:', qrDataUrl.substring(0, 50) + '...');
    console.log('   Total length:', qrDataUrl.length, 'characters');
    
    return qrDataUrl;
  } catch (error) {
    console.error('❌ QR Code generation failed:', error);
    throw error;
  }
};

/**
 * Generate QR code as PNG buffer
 * @param {string} url - The URL to encode
 * @returns {Promise<Buffer>} PNG image buffer
 */
export const generateQRCodeBuffer = async (url) => {
  try {
    const buffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      type: 'png',
      quality: 0.95,
      margin: 4,
      width: 500
    });
    
    return buffer;
  } catch (error) {
    console.error('Error generating QR buffer:', error);
    throw error;
  }
};

/**
 * Generate SVG QR code
 * @param {string} url - The URL to encode
 * @returns {Promise<string>} SVG string
 */
export const generateQRCodeSVG = async (url) => {
  try {
    const svg = await QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 4,
      width: 500
    });
    
    return svg;
  } catch (error) {
    console.error('Error generating QR SVG:', error);
    throw error;
  }
};
