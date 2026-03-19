const axios = require('axios');

const LIBRE_TRANSLATE_URL = process.env.LIBRE_TRANSLATE_URL || 'https://libretranslate.de';

/**
 * Translate text from source language to target language using LibreTranslate.
 */
const translate = async (text, sourceLang = 'hi', targetLang = 'en') => {
  try {
    const response = await axios.post(`${LIBRE_TRANSLATE_URL}/translate`, {
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text',
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    return response.data.translatedText;
  } catch (err) {
    console.error('Translation API error:', err.message);
    // Fallback: return original text with a note
    throw new Error('Translation service unavailable');
  }
};

module.exports = { translate };
