const { Telegraf, session } = require('telegraf');
const { message } = require('telegraf/filters');
const { registerUser } = require('../controllers/userController');
const { handleChat,handleFollowUp } = require('../controllers/chatController');
const { analyzeImage } = require('../controllers/imageController');
const { searchWeb } = require('../controllers/webSearchController');
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const { handlePDF } = require('../controllers/pdfController');



// Enable session middleware to track conversation state
bot.use(session());

// Start command: Register user
bot.start(registerUser);

// Photo/files: Analyze image with Gemini
bot.on(message('photo'), analyzeImage);

// Web search command
bot.command('websearch', searchWeb);

// PDF handling
//bot.on(message('document'), handlePDF); // Handle PDF uploads

// Handle text messages conditionally
bot.on(message('text'), async (ctx) => {
  if (ctx.session.waitingForQuery) {
    // If waiting for a query, handle it with handlePDFQuery
    await handlePDFQuery(ctx);
  } else {
    // Otherwise, handle it with handleChat
    await handleChat(ctx);
  }
});
bot.on(message('document'), async (ctx) => {
  if (ctx.message.document.mime_type === 'application/pdf') {
    await handlePDF(ctx);
  } else {
    ctx.reply('Please upload a PDF file.');
  }
});

bot.on('text', (ctx) => {
  if (ctx.session.waitingForFollowUp) {
    handleFollowUp(ctx);
  } else {
    handleChat(ctx);
  }
});
// Error handling
bot.catch((err) => {
  console.error('❌ Bot error:', err);
});

// Start the bot
bot.launch();
