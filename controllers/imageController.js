// controllers/imageController.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const User = require('../models/userModel');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



const analyzeImage = async (ctx) => {
  try {
    // Get the image file ID from Telegram
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    const fileId = photo.file_id;

    // Get the image URL from Telegram
    const fileUrl = await ctx.telegram.getFileLink(fileId);
    const imageResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data, 'binary');

    // Convert image to Base64
    const base64Image = imageBuffer.toString('base64');

    // Create Gemini-compatible image part
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg', // Adjust based on the file type (e.g., image/png)
      },
    };

    // Generate description using Gemini
  
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-001' });

    const prompt = 'Describe this image in detail.';
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const description = response.text();

    // Save metadata to MongoDB
    await User.updateOne(
      { chat_id: ctx.chat.id },
      {
        $push: {
          file_metadata: {
            filename: fileId,
            description: description,
            timestamp: new Date(),
          },
        },
      }
    );

    // Reply with the description
    ctx.reply(description);
  } catch (error) {
    console.error('Image analysis error:', error);
    ctx.reply('⚠️ Failed to analyze the image. Please try again.');
  }
};

module.exports = {analyzeImage};