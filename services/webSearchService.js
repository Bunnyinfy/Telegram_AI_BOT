const axios = require('axios');

const searchWeb = async (query) => {
  const response = await axios.get(`https://api.serpapi.com/search?q=${query}&api_key=process.env.SERPAPIKEY`);
  return response.data.organic_results;
};

module.exports = { searchWeb };