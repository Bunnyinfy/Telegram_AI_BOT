const pdf = require('pdf-parse');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/userModel');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const handlePDF = async (ctx) => {
  try {
    const fileId = ctx.message.document.file_id;
    const fileName = ctx.message.document.file_name;

    // Get file link from Telegram
    const fileUrl = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });

    // Extract text from PDF
    const pdfData = await pdf(response.data);
    const pdfText = pdfData.text.slice(0, 2000); // Limit to 2000 characters

    // Send text to Gemini AI for summary
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-001' });
    const prompt = `Summarize the following PDF content:\n${pdfText}`;
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    // Save metadata to MongoDB
    await User.updateOne(
      { chat_id: ctx.chat.id },
      {
        $push: {
          pdf_metadata: {
            filename: fileName,
            content: pdfText.slice(0, 1000), // Store first 1000 chars
            timestamp: new Date(),
          },
        },
      }
    );

    // Reply with summary
    ctx.reply(`📄 *${fileName}* Summary:\n${summary}`, { parse_mode: 'Markdown' });
    console.log(`📄 Received PDF: ${fileName}`);


  } catch (error) {
    console.error('PDF processing error:', error);
    ctx.reply('❌ Failed to analyze the PDF. Please try again.');
  }
};

module.exports = { handlePDF };
