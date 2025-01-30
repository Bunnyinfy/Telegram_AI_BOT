// utils/sentiment.js
const natural = require('natural');
const Analyzer = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmer;
const analyzer = new Analyzer("English", stemmer, "afinn");

/**
 * Analyze the sentiment of a given text.
 * @param {string} text - The text to analyze.
 * @returns {object} - Sentiment analysis result with score and label.
 */
const analyzeSentiment = (text) => {
  try {
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text);
    const score = analyzer.getSentiment(tokens);

    // Classify sentiment based on score
    let sentiment;
    if (score > 0.2) {
      sentiment = 'Positive';
    } else if (score < -0.2) {
      sentiment = 'Negative';
    } else {
      sentiment = 'Neutral';
    }

    return { score, sentiment };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    throw new Error('Failed to analyze sentiment.');
  }
};

module.exports = { analyzeSentiment };