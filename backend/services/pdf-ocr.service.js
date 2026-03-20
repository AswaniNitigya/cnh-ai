const fs = require('fs');
const path = require('path');
const os = require('os');
const { createCanvas } = require('canvas');
const Tesseract = require('tesseract.js');

/**
 * Check if extracted text looks valid (not garbled).
 * Garbled text from custom-font PDFs often has:
 * - Very few recognizable words
 * - Lots of odd symbols and single chars
 * - No Hindi unicode despite being a Hindi document
 */
const isTextUsable = (text) => {
  if (!text || text.length < 20) return false;

  // Check if it has meaningful Hindi OR English content
  const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]{3,}/g) || []).length;
  const totalChars = text.length;

  // If at least 10% Hindi chars OR has at least 5 English words, it's usable
  if (hindiChars / totalChars > 0.1) return true;
  if (englishWords >= 5) return true;

  return false;
};

/**
 * Render a PDF page to an image buffer using pdfjs-dist + canvas.
 * Returns a PNG buffer.
 */
const renderPdfPageToImage = async (pdfBuffer, pageNum = 1, scale = 2.0) => {
  const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
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
 * Pipeline: PDF → render pages to images → Tesseract OCR on each image → combine text
 * @param {Buffer} pdfBuffer - The PDF file as a buffer
 * @param {number} maxPages - Max pages to process (default 3 to limit time)
 * @returns {string} Extracted text
 */
const ocrPdfBuffer = async (pdfBuffer, maxPages = 3) => {
  const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
  const data = new Uint8Array(pdfBuffer);
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const numPages = Math.min(doc.numPages, maxPages);
  
  console.log(`  OCR: Processing ${numPages} page(s)...`);
  
  const texts = [];
  for (let i = 1; i <= numPages; i++) {
    try {
      // Render page to image
      const imgBuf = await renderPdfPageToImage(pdfBuffer, i, 2.0);
      
      // Save to temp file for Tesseract
      const tmpFile = path.join(os.tmpdir(), `cnh_ocr_p${i}_${Date.now()}.png`);
      fs.writeFileSync(tmpFile, imgBuf);
      
      // Run OCR (Hindi + English)
      const { data: { text } } = await Tesseract.recognize(tmpFile, 'hin+eng');
      
      // Cleanup temp file
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

module.exports = { isTextUsable, ocrPdfBuffer, renderPdfPageToImage };
