const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: String,
  username: String,
  chat_id: { type: Number, unique: true },
  phone_number: String,
  chat_history: [
    {
      user_input: String,
      bot_response: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  file_metadata: [
    {
      filename: String,
      description: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  searches: [
    {
      query: String,
      results: [
        {
          title: String,
          link: String,
          snippet: String,
        },
      ],
      timestamp: { type: Date, default: Date.now },
    },
  ],
  pdf_metadata: [
    {
      filename: String,
      content: String, // Extracted text (first 1000 chars)
      timestamp: { type: Date, default: Date.now },
    },
  ],
  
  
});

module.exports = mongoose.model('User', userSchema);

