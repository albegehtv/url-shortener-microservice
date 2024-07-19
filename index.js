require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the "public" directory
app.use('/public', express.static(`${process.cwd()}/public`));

// Serve HTML file
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// URL Shortener API
const urls = {};
let idCounter = 1;

app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;
  if (!url) {
    return res.json({ error: 'Invalid URL' });
  }

  // Validate URL
  dns.lookup(new URL(url).hostname, (err) => {
    if (err) {
      return res.json({ error: 'Invalid URL' });
    }

    // Check if URL is already in the dictionary
    const existingEntry = Object.entries(urls).find(([_, value]) => value === url);
    if (existingEntry) {
      return res.json({ original_url: url, short_url: existingEntry[0] });
    }

    // Add new URL to the dictionary
    const shortUrl = idCounter++;
    urls[shortUrl] = url;
    res.json({ original_url: url, short_url: shortUrl });
  });
});

// Redirect to original URL
app.get('/api/shorturl/:short', (req, res) => {
  const shortUrl = parseInt(req.params.short, 10);
  const originalUrl = urls[shortUrl];
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
