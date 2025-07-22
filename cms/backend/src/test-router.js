const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Test router works!' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint works!', body: req.body });
});

module.exports = router;