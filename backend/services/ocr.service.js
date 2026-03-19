const Tesseract = require('tesseract.js');

/**
 * Extract text from an image using Tesseract.js.
 * Supports Hindi (hin) and English (eng) text detection.
 */
const extractText = async (imagePath) => {
  try {
    console.log(`Starting OCR on: ${imagePath}`);

    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      'hin+eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      }
    );

    console.log('OCR completed successfully.');
    return text.trim();
  } catch (err) {
    console.error('OCR error:', err);
    throw new Error('Failed to extract text from image: ' + err.message);
  }
};

module.exports = { extractText };
