const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

// Allow your extension's origin
app.use(cors({
  origin: 'chrome-extension://ifopojflepcoiddjblkegphdpolcaoac'
}));

app.use(bodyParser.json());

const apiKey = process.env.SUMMARIZER_API_KEY;

const calculateMaxTokens = (inputText) => {
  const inputTokens = inputText.split(' ').length;
  const estimatedSummaryTokens = Math.ceil(inputTokens * 0.2);
  return Math.min(estimatedSummaryTokens, 200);
};

app.post('/summarize', async (req, res) => {
  const { text } = req.body;
  const maxTokens = calculateMaxTokens(text);

  try {
    const gpt3Response = await axios.post(
      'https://api.openai.com/v1/engines/text-davinci-002/completions',
      {
        prompt: `Give a concise 5-7 sentence summary of the following post:\n${text}`,
        max_tokens: maxTokens,
        n: 1,
        stop: null,
        temperature: 0.,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (gpt3Response.data.choices && gpt3Response.data.choices.length > 0) {
      const summary = gpt3Response.data.choices[0].text;
      console.log('GPT-3 API response:', gpt3Response.data);
      console.log('Generated summary:', summary);
      res.json({ summary });
    } else {
      console.log('No choices found in GPT-3 API response:', gpt3Response.data);
      res.status(500).json({ error: 'No summary generated' });
    }
  } catch (error) {
    console.error('Error calling GPT-3 API:', error);
    res.status(500).json({ error: `Error calling GPT-3 API: ${error.message}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
