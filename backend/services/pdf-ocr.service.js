const fs = require('fs');
const path = require('path');
const os = require('os');
const Tesseract = require('tesseract.js');

// Lazy-load canvas and pdfjs-dist — they require native system libs
// that may not be available on all hosting platforms (e.g. Render free tier)
let createCanvas, pdfjsLib;
let canvasAvailable = false;

try {
  createCanvas = require('canvas').createCanvas;
  pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
  canvasAvailable = true;
  console.log('✅ PDF OCR: canvas + pdfjs-dist loaded successfully');
} catch (err) {
  console.warn('⚠️  PDF OCR: canvas/pdfjs-dist not available — PDF OCR fallback will be disabled.');
  console.warn('   This is normal on hosts without native graphics libs (Cairo, Pango).');
  console.warn('   Text-based PDF extraction and all other features still work.');
}

/**
 * Check if extracted text looks valid (not garbled).
 */
const isTextUsable = (text) => {
  if (!text || text.length < 20) return false;

  const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]{3,}/g) || []).length;
  const totalChars = text.length;

  if (hindiChars / totalChars > 0.1) return true;
  if (englishWords >= 5) return true;

  return false;
};

/**
 * Render a PDF page to an image buffer using pdfjs-dist + canvas.
 */
const renderPdfPageToImage = async (pdfBuffer, pageNum = 1, scale = 2.0) => {
  if (!canvasAvailable) throw new Error('canvas/pdfjs-dist not available');

  const data = new Uint8Array(pdfBuffer);
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');

  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toBuffer('image/png');
};

/**
 * Extract text from a PDF buffer using OCR.
 * Falls back gracefully if canvas is not available.
 */
const ocrPdfBuffer = async (pdfBuffer, maxPages = 3) => {
  if (!canvasAvailable) {
    console.log('  OCR skipped: canvas not available on this platform');
    return '';
  }

  const data = new Uint8Array(pdfBuffer);
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const numPages = Math.min(doc.numPages, maxPages);

  console.log(`  OCR: Processing ${numPages} page(s)...`);

  const texts = [];
  for (let i = 1; i <= numPages; i++) {
    try {
      const imgBuf = await renderPdfPageToImage(pdfBuffer, i, 2.0);
      const tmpFile = path.join(os.tmpdir(), `cnh_ocr_p${i}_${Date.now()}.png`);
      fs.writeFileSync(tmpFile, imgBuf);

      const { data: { text } } = await Tesseract.recognize(tmpFile, 'hin+eng');
      try { fs.unlinkSync(tmpFile); } catch (_) {}

      if (text && text.trim().length > 0) {
        texts.push(text.trim());
        console.log(`  OCR: Page ${i} - ${text.trim().length} chars extracted`);
      }
    } catch (pageErr) {
      console.error(`  OCR: Page ${i} failed:`, pageErr.message);
    }
  }

  return texts.join('\n\n');
};

module.exports = { isTextUsable, ocrPdfBuffer, renderPdfPageToImage, canvasAvailable };
