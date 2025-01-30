// controllers/webSearchController.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const User = require('../models/userModel');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Gemini for summarization
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-001' });

// Web search service (using SerpAPI)
const searchWeb = async (query) => {
  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        q: query,
        api_key: process.env.SERPAPI_KEY, // Replace with your SerpAPI key
        engine: 'google',
      },
    });

    // Extract top 3 results
    const results = response.data.organic_results.slice(0, 3);
    return results.map(result => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
    }));
  } catch (error) {
    console.error('Web search error:', error);
    return [];
  }
};

// Generate AI summary using Gemini
const generateSummary = async (query, results) => {
  try {
    const prompt = `
      Summarize the following web search results for the query "${query}":
      ${results.map((res, index) => `${index + 1}. ${res.snippet}`).join('\n')}

      Provide a concise summary and list the top links.
    `;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini summarization error:', error);
    return 'Failed to generate summary. Here are the top links:\n' +
      results.map(res => res.link).join('\n');
  }
};

// Handle /websearch command
const handleWebSearch = async (ctx) => {
  try {
    // Extract the query from the command (e.g., "/websearch cats" -> "cats")
    const query = ctx.message.text.replace('/websearch', '').trim();

    if (!query) {
      return ctx.reply('Please provide a search query. Example: /websearch AI trends');
    }

    // Fetch search results
    const results = await searchWeb(query);
    if (results.length === 0) {
      return ctx.reply('No results found for your query.');
    }

    // Generate AI summary
    const summary = await generateSummary(query, results);

    // Send the summary to the user
    await ctx.reply(summary);

    // Save the search query and results to MongoDB
    await User.updateOne(
      { chat_id: ctx.chat.id },
      { $push: { searches: { query, results, timestamp: new Date() } } }
    );

  } catch (error) {
    console.error('Web search command error:', error);
    ctx.reply('⚠️ An error occurred during the web search.');
  }
};

module.exports = { searchWeb: handleWebSearch };