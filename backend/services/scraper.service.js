const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const pdfParse = require('pdf-parse');
const supabase = require('../models/supabase');
const { translate } = require('./translator.service');
const { isTextUsable, ocrPdfBuffer } = require('./pdf-ocr.service');

const DEFAULT_SCRAPER_URL = process.env.SCRAPER_URL || 'https://www.mmmut.ac.in/AllRecord';

/**
 * Check if text contains Hindi/Devanagari characters.
 */
const containsHindi = (text) => /[\u0900-\u097F]/.test(text);

/**
 * Scrapes the MMMUT portal for new PDF notices.
 * Pipeline: Scrape → PDF text extraction → Hindi→English translation → Store notice
 */
const scrape = async (targetUrls = []) => {
  const urlsToScrape = targetUrls.length > 0 ? targetUrls : [DEFAULT_SCRAPER_URL];
  const results = { newCount: 0, skippedCount: 0, details: [] };

  try {
    for (const url of urlsToScrape) {
      console.log(`Scraping: ${url}`);
      
      let scrapeCategory = 'general';
      if (url.toLowerCase().includes('exam')) {
        scrapeCategory = 'exam';
      }

      // Fetch the page
      const { data: html } = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CNH-Bot/1.0)',
        },
      });

      const $ = cheerio.load(html);

      // Find all PDF links on the page
    const pdfLinks = [];
    $('a[href$=".pdf"]').each((i, el) => {
      const href = $(el).attr('href');
      let title = $(el).text().trim();
      const lower = title.toLowerCase();
      
      if (!title || lower.includes('download') || lower.includes('view') || lower.includes('click here') || lower === 'pdf') {
        const rowText = $(el).closest('tr').text().replace(/\s+/g, ' ').replace(/(download|view|click here|pdf)/ig, '').trim();
        if (rowText.length > 5) {
          title = rowText;
        } else {
          const parentPrev = $(el).parent().prev().text().replace(/\s+/g, ' ').trim();
          if (parentPrev.length > 5) {
            title = parentPrev;
          }
        }
      }
      title = title || `Notice ${i + 1}`;
      title = title.substring(0, 250);

      if (href) {
        let fullUrl = href;
        if (!href.startsWith('http')) {
          fullUrl = `https://www.mmmut.ac.in${href.startsWith('/') ? '' : '/'}${href}`;
        }
        pdfLinks.push({ url: fullUrl, title });
      }
    });

    console.log(`Found ${pdfLinks.length} PDF links on the page.`);

    for (const pdf of pdfLinks) {
      // Generate hash for dedup
      const hash = crypto.createHash('sha256').update(pdf.url).digest('hex');

      // Check if already scraped
      const { data: existing } = await supabase
        .from('scraped_logs')
        .select('id')
        .eq('content_hash', hash)
        .single();

      if (existing) {
        results.skippedCount++;
        continue;
      }

      console.log(`Processing new notice: ${pdf.title}`);

      // Log the scrape
      await supabase.from('scraped_logs').insert([{
        source_url: pdf.url,
        content_hash: hash,
        title: pdf.title,
        date_found: new Date().toISOString(),
      }]);

      // Step 1: Extract text from PDF (try pdf-parse first, fallback to OCR)
      let rawText = '';
      let pdfBuffer = null;
      try {
        const pdfResponse = await axios.get(pdf.url, { responseType: 'arraybuffer', timeout: 30000 });
        pdfBuffer = Buffer.from(pdfResponse.data);
        const pdfData = await pdfParse(pdfBuffer);
        rawText = (pdfData.text || '').replace(/\s+/g, ' ').trim();
      } catch (pdfErr) {
        console.error(`  PDF download/parse error for ${pdf.url}:`, pdfErr.message);
      }

      // Check if pdf-parse output is usable — MMMUT PDFs often have garbled text
      if (!isTextUsable(rawText) && pdfBuffer) {
        console.log(`  pdf-parse text is garbled/empty, falling back to OCR...`);
        try {
          rawText = await ocrPdfBuffer(pdfBuffer, 2);  // OCR first 2 pages
        } catch (ocrErr) {
          console.error(`  OCR fallback failed:`, ocrErr.message);
        }
      }

      // Step 2: Translate title and content if Hindi detected
      let finalTitle = pdf.title;
      let finalContent = '';

      if (rawText.length > 20) {
        // Translate content
        if (containsHindi(rawText)) {
          try {
            console.log(`  Translating content (${rawText.length} chars)...`);
            const contentToTranslate = rawText.substring(0, 3000); // Limit for translation
            const translatedContent = await translate(contentToTranslate, 'hi', 'en');
            finalContent = translatedContent + (rawText.length > 3000 ? '\n\n[Content truncated — view the full PDF for complete details]' : '');
          } catch (transErr) {
            console.error(`  Translation failed for content:`, transErr.message);
            finalContent = rawText.substring(0, 500) + (rawText.length > 500 ? '...' : '');
          }
        } else {
          // Already in English or mixed — use as-is
          finalContent = rawText.substring(0, 1500) + (rawText.length > 1500 ? '...' : '');
        }
      } else {
        finalContent = 'Detailed content not available. Please view the original PDF.';
      }

      // Translate title if it contains Hindi
      if (containsHindi(pdf.title)) {
        try {
          console.log(`  Translating title...`);
          finalTitle = await translate(pdf.title, 'hi', 'en');
        } catch (titleErr) {
          console.error(`  Title translation failed:`, titleErr.message);
          finalTitle = pdf.title; // keep original
        }
      }

      // Step 3: Create the notice with translated content
      await supabase.from('notices').insert([{
        title: finalTitle,
        content: `${finalContent}\n\n*Automatically scraped and translated from MMMUT portal. View the original PDF for full details.*`,
        category: scrapeCategory,
        pdf_url: pdf.url,
        source: 'scraper',
        target_criteria: { global: true },
        status: 'active',
      }]);

        results.newCount++;
        results.details.push({ title: finalTitle, url: pdf.url });
        console.log(`  ✅ Saved: ${finalTitle}`);
      }
    }

    console.log(`Scrape complete. New: ${results.newCount}, Skipped: ${results.skippedCount}`);
    return results;
  } catch (err) {
    console.error('Scraper error:', err.message);
    throw err;
  }
};

module.exports = { scrape };

