const { GoogleGenerativeAI } = require('@google/generative-ai');

// Replace 'YOUR_API_KEY' with your actual API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateResponse = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const enhancedPrompt = `You are a helpful assistant. Respond to the user's query in a friendly and engaging way. Use emojis where appropriate to make the response more lively and fun. Here's the user's query: ${prompt}`;
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini query error:', error);
    throw new Error('Failed to generate response.');
  }
};

module.exports = { generateResponse };
