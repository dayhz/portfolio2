const { Router } = require('express');
const router = Router();

router.post('/login', (req, res) => {
  res.json({ 
    message: 'Login endpoint works!',
    body: req.body 
  });
});

router.get('/verify', (req, res) => {
  res.json({ 
    message: 'Verify endpoint works!' 
  });
});

module.exports = router;