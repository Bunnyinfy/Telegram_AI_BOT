const User = require('../models/userModel');

const registerUser = async (ctx) => {
  const { id, first_name, username } = ctx.from;
  const chatId = ctx.chat.id;

  const user = await User.findOne({ chat_id: chatId });
  if (!user) {
    const newUser = new User({
      first_name,
      username,
      chat_id: chatId,
    });
    await newUser.save();
    ctx.reply('Welcome! Please share your phone number using the contact button.');
  } else {
    ctx.reply('You are already registered!');
  }
};

module.exports = { registerUser };