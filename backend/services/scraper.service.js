const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const supabase = require('../models/supabase');

const SCRAPER_URL = process.env.SCRAPER_URL || 'https://www.mmmut.ac.in/AllRecord';

/**
 * Scrapes the MMMUT portal for new PDF notices.
 * Compares content hashes to avoid duplicates.
 */
const scrape = async () => {
  const results = { newCount: 0, skippedCount: 0, details: [] };

  try {
    // Fetch the page
    const { data: html } = await axios.get(SCRAPER_URL, {
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
      const title = $(el).text().trim() || `Notice ${i + 1}`;

      if (href) {
        const fullUrl = href.startsWith('http') ? href : `https://www.mmmut.ac.in${href}`;
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

      // Create a notice from the scraped PDF
      await supabase.from('notices').insert([{
        title: pdf.title,
        content: `Automatically scraped from MMMUT portal. View the original PDF for full details.`,
        category: 'general',
        pdf_url: pdf.url,
        source: 'scraper',
        target_criteria: { global: true },
        status: 'active',
      }]);

      results.newCount++;
      results.details.push({ title: pdf.title, url: pdf.url });
    }

    console.log(`Scrape complete. New: ${results.newCount}, Skipped: ${results.skippedCount}`);
    return results;
  } catch (err) {
    console.error('Scraper error:', err.message);
    throw err;
  }
};

module.exports = { scrape };
