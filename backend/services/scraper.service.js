const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const pdfParse = require('pdf-parse');
const supabase = require('../models/supabase');

const DEFAULT_SCRAPER_URL = process.env.SCRAPER_URL || 'https://www.mmmut.ac.in/AllRecord';

/**
 * Scrapes the MMMUT portal for new PDF notices.
 * Compares content hashes to avoid duplicates.
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
      title = title.substring(0, 250); // Prevent extremely long titles from crashing DB

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

      // Log the scrape
      await supabase.from('scraped_logs').insert([{
        source_url: pdf.url,
        content_hash: hash,
        title: pdf.title,
        date_found: new Date().toISOString(),
      }]);

      let summary = 'Detailed content not available. Please view the original PDF.';
      try {
        const pdfResponse = await axios.get(pdf.url, { responseType: 'arraybuffer', timeout: 15000 });
        const dataBuffer = Buffer.from(pdfResponse.data);
        const pdfData = await pdfParse(dataBuffer);
        
        let text = pdfData.text || '';
        text = text.replace(/\s+/g, ' ').trim();
        if (text.length > 0) {
          summary = text.substring(0, 400) + (text.length > 400 ? '...' : '');
        }
      } catch (pdfErr) {
        console.error(`PDF parse error for ${pdf.url}:`, pdfErr.message);
      }

      // Create a notice from the scraped PDF
      await supabase.from('notices').insert([{
        title: pdf.title,
        content: `${summary}\n\n*Automatically scraped from MMMUT portal. View the original PDF for full details.*`,
        category: scrapeCategory,
        pdf_url: pdf.url,
        source: 'scraper',
        target_criteria: { global: true },
        status: 'active',
      }]);

        results.newCount++;
        results.details.push({ title: pdf.title, url: pdf.url });
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
