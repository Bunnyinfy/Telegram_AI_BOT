// utils/helpers.js
const { analyzeSentiment } = require('./sentiment');

/**
 * Generate a sentiment-based response.
 * @param {string} userInput - The user's input text.
 * @returns {string} - A sentiment-tailored response.
 */
const getSentimentResponse = (userInput) => {
  const { sentiment } = analyzeSentiment(userInput);

  switch (sentiment) {
    case 'Positive':
      return '😊 That sounds great! How can I assist you further?';
    case 'Negative':
      return '😔 I’m sorry to hear that. Is there anything I can do to help?';
    default:
      return '🤔 How can I assist you today?';
  }
};

module.exports = { getSentimentResponse };