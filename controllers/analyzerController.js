const { checkSSL } = require('../services/sslChecker');
const { analyzePerformance } = require('../services/performanceAnalyzer');

// Core analysis function (reusable)
const performAnalysis = async (url) => {
  const urlPattern = /^(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
  
  if (!urlPattern.test(url)) {
    throw new Error('Invalid URL format');
  }

  const hostname = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  const [sslResult, performanceResult] = await Promise.all([
    checkSSL(hostname),
    analyzePerformance(url)
  ]);

  if (!sslResult.success && !performanceResult.success) {
    throw new Error('Failed to analyze website');
  }

  return {
    url: url,
    hostname: hostname,
    ssl: sslResult.success ? sslResult.data : null,
    performance: performanceResult.success ? performanceResult.data : null,
    analyzedAt: new Date().toISOString()
  };
};

// HTTP endpoint for website analysis
const analyzeWebsite = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    const result = await performAnalysis(url);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

const checkSSLOnly = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    const hostname = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const result = await checkSSL(hostname);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

const checkPerformanceOnly = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    const result = await analyzePerformance(url);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

module.exports = {
  analyzeWebsite,
  checkSSLOnly,
  checkPerformanceOnly,
  performAnalysis   // Export for reuse in monitoring
};
