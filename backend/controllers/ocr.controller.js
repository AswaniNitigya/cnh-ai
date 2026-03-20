const path = require('path');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const ocrService = require('../services/ocr.service');
const translatorService = require('../services/translator.service');

/**
 * Process uploaded file: supports both images (OCR) and PDFs (text extraction).
 * Pipeline: File → Extract Text → Translate Hindi→English → Return
 */
const processOCR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided.' });
    }

    const filePath = req.file.path;
    const fileUrl = `/uploads/${req.file.filename}`;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const isPDF = ext === '.pdf' || req.file.mimetype === 'application/pdf';

    let extractedText = '';

    if (isPDF) {
      // Step 1a: PDF → extract text directly using pdf-parse
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = (pdfData.text || '').replace(/\s+/g, ' ').trim();
      } catch (pdfErr) {
        console.error('PDF parse error:', pdfErr.message);
        return res.status(422).json({
          error: 'Failed to extract text from PDF: ' + pdfErr.message,
          file_url: fileUrl,
        });
      }
    } else {
      // Step 1b: Image → OCR using Tesseract (Hindi + English)
      extractedText = await ocrService.extractText(filePath);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(422).json({
        error: isPDF
          ? 'No text could be extracted from this PDF. It may be a scanned/image-based PDF.'
          : 'No text could be extracted from the image.',
        file_url: fileUrl,
      });
    }

    // Step 2: Translate Hindi → English
    let englishText = '';
    try {
      englishText = await translatorService.translate(extractedText, 'hi', 'en');
    } catch (transErr) {
      console.error('Translation failed, returning extracted text only:', transErr.message);
      englishText = '[Translation unavailable] ' + extractedText;
    }

    res.json({
      file_url: fileUrl,
      image_url: fileUrl, // kept for backward compatibility
      hindi_text: extractedText,
      english_text: englishText,
      source_type: isPDF ? 'pdf' : 'image',
      message: `${isPDF ? 'PDF text extraction' : 'OCR'} and translation completed. Please review and edit before posting.`,
    });
  } catch (err) {
    console.error('Processing error:', err);
    res.status(500).json({ error: 'Processing failed: ' + err.message });
  }
};

module.exports = { processOCR };
