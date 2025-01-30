const { generateResponse } = require('../services/geminiService');
const User = require('../models/userModel');

const handleChat = async (ctx) => {
  try {
    const userInput = ctx.message.text;
    const chatId = ctx.chat.id;

    // Generate response using Gemini
    const response = await generateResponse(userInput);

    // Save chat history with sentiment
    await User.updateOne(
      { chat_id: chatId },
      {
        $push: {
          chat_history: {
            user_input: userInput,
            bot_response: response,
            timestamp: new Date(),
          },
        },
      }
    );

    // Send the response with emojis
    ctx.reply(response);

    // Auto-follow-up logic
    if (userInput.toLowerCase().includes('weather')) {
      ctx.reply('🌦️ Would you like to know the weather for tomorrow as well?');
      ctx.session.waitingForFollowUp = true; // Set follow-up state
    } else if (userInput.toLowerCase().includes('news')) {
      ctx.reply('📰 Would you like to see the latest news headlines?');
      ctx.session.waitingForFollowUp = true; // Set follow-up state
    }

  } catch (error) {
    console.error('Chat handling error:', error);
    ctx.reply('⚠️ An error occurred. Please try again.');
  }
};
const handleFollowUp = async (ctx) => {
  try {
    const userInput = ctx.message.text;
    const chatId = ctx.chat.id;

    if (ctx.session.waitingForFollowUp) {
      if (userInput.toLowerCase().includes('yes')) {
        // Handle follow-up action
        if (ctx.session.followUpType === 'weather') {
          const response = await generateResponse('What is the weather forecast for tomorrow?');
          ctx.reply(response);
        } else if (ctx.session.followUpType === 'news') {
          const response = await generateResponse('What are the latest news headlines?');
          ctx.reply(response);
        }
      } else {
        ctx.reply('Okay, let me know if you need anything else! 😊');
      }

      // Reset follow-up state
      ctx.session.waitingForFollowUp = false;
      ctx.session.followUpType = null;
    }
  } catch (error) {
    console.error('Follow-up handling error:', error);
    ctx.reply('⚠️ An error occurred. Please try again.');
  }
};

module.exports = { handleChat,handleFollowUp };