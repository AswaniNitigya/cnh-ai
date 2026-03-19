const ocrService = require('../services/ocr.service');
const translatorService = require('../services/translator.service');

// Process uploaded image: OCR -> Translation -> Return
const processOCR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const imagePath = req.file.path;
    const imageUrl = `/uploads/${req.file.filename}`;

    // Step 1: OCR — extract Hindi text
    const hindiText = await ocrService.extractText(imagePath);

    if (!hindiText || hindiText.trim().length === 0) {
      return res.status(422).json({
        error: 'No text could be extracted from the image.',
        image_url: imageUrl,
      });
    }

    // Step 2: Translate Hindi -> English
    let englishText = '';
    try {
      englishText = await translatorService.translate(hindiText, 'hi', 'en');
    } catch (transErr) {
      console.error('Translation failed, returning OCR only:', transErr.message);
      englishText = '[Translation unavailable] ' + hindiText;
    }

    res.json({
      image_url: imageUrl,
      hindi_text: hindiText,
      english_text: englishText,
      message: 'OCR and translation completed. Please review and edit before posting.',
    });
  } catch (err) {
    console.error('OCR processing error:', err);
    res.status(500).json({ error: 'OCR processing failed: ' + err.message });
  }
};

module.exports = { processOCR };
