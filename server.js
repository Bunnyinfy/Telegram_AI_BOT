require('dotenv').config();
const { Telegraf, session } = require('telegraf');
const mongoose = require('mongoose');
const { registerUser } = require('./controllers/userController');
const { handleChat } = require('./controllers/chatController');
const { analyzeImage } = require('./controllers/imageController');
const { searchWeb } = require('./controllers/webSearchController');
const { handlePDF } = require('./controllers/pdfController'); // Added for PDF processing

// Initialize the Telegram bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Enable session middleware to track conversation state
bot.use(session());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ===== Bot Commands =====
// Start command: Register user
bot.start(registerUser);

// Text messages: Handle chat with Gemini + sentiment analysis
bot.on('text', handleChat);

// Photo/files: Analyze image with Gemini
bot.on('photo', analyzeImage);

// Web search command
bot.command('websearch', searchWeb);

// PDF handling
bot.on('document', handlePDF); // Handle PDF uploads

// Error handling
bot.catch((err) => {
  console.error('❌ Bot error:', err);
});

// Start the bot
bot.launch()
  .then(() => console.log('🤖 Bot is running!'))
  .catch(err => console.error('❌ Bot failed to start:', err));

// Graceful shutdown
process.once('SIGINT', async () => {
  bot.stop('SIGINT');
  mongoose.disconnect();
  console.log('🛑 Bot stopped gracefully');
});

process.once('SIGTERM', async () => {
  bot.stop('SIGTERM');
  mongoose.disconnect();
  console.log('🛑 Bot stopped gracefully');
});
