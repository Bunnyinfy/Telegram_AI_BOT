const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/userModel');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const handlePDFQuery = async (ctx) => {
  try {
    const user = await User.findOne({ chat_id: ctx.chat.id });

    if (!user || !user.last_pdf) {
      return ctx.reply("❌ No PDF found! Please upload one before asking questions.");
    }

    const pdfContent = user.last_pdf;
    const userQuestion = ctx.message.text;

    // Send question & PDF content to Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-001' });
    const prompt = `Based on the following PDF content, answer the user's question:\n\n
    --- PDF Content Start ---
    ${pdfContent.slice(0, 4000)}  // Gemini handles ~4000 tokens, truncate if necessary
    --- PDF Content End ---

    User Question: ${userQuestion}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    ctx.reply(response);

  } catch (error) {
    console.error('PDF query error:', error);
    ctx.reply('❌ Failed to process your question. Please try again.');
  }
};

module.exports = { handlePDFQuery };
