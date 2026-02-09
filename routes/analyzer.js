const express = require('express');
const router = express.Router();
const {
  analyzeWebsite,
  checkSSLOnly,
  checkPerformanceOnly
} = require('../controllers/analyzerController');

router.post('/analyze', analyzeWebsite);
router.post('/ssl', checkSSLOnly);
router.post('/performance', checkPerformanceOnly);

module.exports = router;
