const translate = require('google-translate-api-x');

/**
 * Translate text from source language to target language using Google Translate.
 * Falls back gracefully if translation fails.
 */
const translateText = async (text, sourceLang = 'hi', targetLang = 'en') => {
  try {
    if (!text || text.trim().length === 0) {
      return '';
    }

    // google-translate-api-x has a practical limit per request (~5000 chars)
    // Split into chunks if needed
    const MAX_CHUNK = 4500;
    if (text.length <= MAX_CHUNK) {
      const result = await translate(text, { from: sourceLang, to: targetLang });
      return result.text;
    }

    // Split long text into chunks at sentence boundaries
    const chunks = [];
    let remaining = text;
    while (remaining.length > 0) {
      if (remaining.length <= MAX_CHUNK) {
        chunks.push(remaining);
        break;
      }
      // Try to split at a period or newline near the limit
      let splitIdx = remaining.lastIndexOf('।', MAX_CHUNK); // Hindi sentence ender
      if (splitIdx === -1) splitIdx = remaining.lastIndexOf('.', MAX_CHUNK);
      if (splitIdx === -1) splitIdx = remaining.lastIndexOf('\n', MAX_CHUNK);
      if (splitIdx === -1 || splitIdx < MAX_CHUNK * 0.5) splitIdx = MAX_CHUNK;
      chunks.push(remaining.substring(0, splitIdx + 1));
      remaining = remaining.substring(splitIdx + 1);
    }

    const translated = [];
    for (const chunk of chunks) {
      const result = await translate(chunk, { from: sourceLang, to: targetLang });
      translated.push(result.text);
    }
    return translated.join(' ');
  } catch (err) {
    console.error('Translation error:', err.message);
    throw new Error('Translation service unavailable: ' + err.message);
  }
};

module.exports = { translate: translateText };
