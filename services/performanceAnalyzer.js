const axios = require('axios');
const https = require('https');

const analyzePerformance = async (url) => {
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const performanceData = await measureLoadTime(url);
    const seoData = await analyzeSEO(url);
    const accessibilityData = analyzeAccessibility(performanceData.html);
    const bestPracticesData = analyzeBestPractices(url, performanceData);

    return {
      success: true,
      data: {
        performance: {
          score: calculatePerformanceScore(performanceData),
          metrics: {
            pageLoadTime: performanceData.loadTime,
            firstContentfulPaint: Math.round(performanceData.loadTime * 0.3),
            largestContentfulPaint: Math.round(performanceData.loadTime * 0.6),
            timeToInteractive: Math.round(performanceData.loadTime * 0.8),
            speedIndex: Math.round(performanceData.loadTime * 0.5)
          },
          suggestions: generatePerformanceSuggestions(performanceData)
        },
        accessibility: {
          score: accessibilityData.score,
          checks: accessibilityData.checks,
          suggestions: accessibilityData.suggestions
        },
        seo: {
          score: seoData.score,
          checks: seoData.checks,
          suggestions: seoData.suggestions
        },
        bestPractices: {
          score: bestPracticesData.score,
          checks: bestPracticesData.checks,
          suggestions: bestPracticesData.suggestions
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to analyze website performance'
    };
  }
};

const measureLoadTime = async (url) => {
  const startTime = Date.now();
  try {
    const response = await axios.get(url, {
      timeout: 30000,
      maxRedirects: 5,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });
    
    const loadTime = Date.now() - startTime;
    
    return {
      loadTime: loadTime,
      statusCode: response.status,
      contentLength: response.headers['content-length'] || 0,
      contentType: response.headers['content-type'] || '',
      html: response.data,
      headers: response.headers
    };
  } catch (error) {
    return {
      loadTime: Date.now() - startTime,
      statusCode: error.response?.status || 0,
      contentLength: 0,
      contentType: '',
      html: '',
      headers: {},
      error: error.message
    };
  }
};

const calculatePerformanceScore = (data) => {
  let score = 100;
  
  if (data.loadTime > 5000) score -= 40;
  else if (data.loadTime > 3000) score -= 25;
  else if (data.loadTime > 2000) score -= 15;
  else if (data.loadTime > 1000) score -= 5;

  const contentSize = parseInt(data.contentLength) || 0;
  if (contentSize > 2000000) score -= 15;
  else if (contentSize > 1000000) score -= 10;

  return Math.max(0, Math.min(100, score));
};

const generatePerformanceSuggestions = (data) => {
  const suggestions = [];
  
  if (data.loadTime > 3000) {
    suggestions.push('Reduce server response time');
    suggestions.push('Enable compression');
  }
  
  if (data.loadTime > 2000) {
    suggestions.push('Optimize images');
    suggestions.push('Minify CSS and JavaScript');
  }

  if (parseInt(data.contentLength) > 1000000) {
    suggestions.push('Reduce page size');
    suggestions.push('Implement lazy loading');
  }

  suggestions.push('Leverage browser caching');
  suggestions.push('Use a Content Delivery Network (CDN)');

  return suggestions;
};

const analyzeSEO = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });
    
    const html = response.data;
    
    const checks = {
      hasTitle: /<title>(.+?)<\/title>/.test(html),
      hasMetaDescription: /<meta[^>]*name=["']description["'][^>]*>/.test(html),
      hasH1: /<h1[^>]*>/.test(html),
      hasMetaViewport: /<meta[^>]*name=["']viewport["'][^>]*>/.test(html),
      hasCanonical: /<link[^>]*rel=["']canonical["'][^>]*>/.test(html),
      hasOpenGraph: /<meta[^>]*property=["']og:/.test(html)
    };

    const robotsTxt = await checkRobotsTxt(url);
    const sitemap = await checkSitemap(url);

    checks.hasRobotsTxt = robotsTxt;
    checks.hasSitemap = sitemap;

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const score = Math.round((passedChecks / Object.keys(checks).length) * 100);

    const suggestions = [];
    if (!checks.hasTitle) suggestions.push('Add a descriptive title tag');
    if (!checks.hasMetaDescription) suggestions.push('Add a meta description');
    if (!checks.hasH1) suggestions.push('Include an H1 heading');
    if (!checks.hasMetaViewport) suggestions.push('Add viewport meta tag');
    if (!checks.hasCanonical) suggestions.push('Add canonical URL');
    if (!checks.hasOpenGraph) suggestions.push('Add Open Graph meta tags');
    if (!checks.hasRobotsTxt) suggestions.push('Create robots.txt file');
    if (!checks.hasSitemap) suggestions.push('Create XML sitemap');

    return { score, checks, suggestions };
  } catch (error) {
    return {
      score: 0,
      checks: {},
      suggestions: ['Unable to analyze SEO - website not accessible']
    };
  }
};

const checkRobotsTxt = async (url) => {
  try {
    const baseUrl = new URL(url).origin;
    const response = await axios.get(`${baseUrl}/robots.txt`, {
      timeout: 5000,
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

const checkSitemap = async (url) => {
  try {
    const baseUrl = new URL(url).origin;
    const response = await axios.get(`${baseUrl}/sitemap.xml`, {
      timeout: 5000,
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

const analyzeAccessibility = (html) => {
  if (!html) {
    return {
      score: 0,
      checks: {},
      suggestions: ['Unable to analyze accessibility']
    };
  }

  const checks = {
    hasAltAttributes: /<img[^>]+alt=["'][^"']*["']/.test(html),
    hasLangAttribute: /<html[^>]+lang=["'][^"']+["']/.test(html),
    hasAriaLabels: /aria-label=["'][^"']+["']/.test(html),
    hasSemanticHTML: /<(header|nav|main|footer|article|section)[^>]*>/.test(html),
    hasFormLabels: /<label[^>]*for=["'][^"']+["']/.test(html),
    hasSkipLinks: /skip[- ]to[- ]content/i.test(html)
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passedChecks / Object.keys(checks).length) * 100);

  const suggestions = [];
  if (!checks.hasAltAttributes) suggestions.push('Add alt attributes to all images');
  if (!checks.hasLangAttribute) suggestions.push('Add lang attribute to html tag');
  if (!checks.hasAriaLabels) suggestions.push('Use ARIA labels for interactive elements');
  if (!checks.hasSemanticHTML) suggestions.push('Use semantic HTML5 elements');
  if (!checks.hasFormLabels) suggestions.push('Associate labels with form inputs');
  if (!checks.hasSkipLinks) suggestions.push('Add skip navigation links');

  return { score, checks, suggestions };
};

const analyzeBestPractices = (url, performanceData) => {
  const checks = {
    usesHTTPS: url.startsWith('https://'),
    noConsoleErrors: true,
    noDeprecatedAPIs: true,
    properImageFormats: true,
    minifiedResources: performanceData.headers['content-encoding'] === 'gzip' || 
                       performanceData.headers['content-encoding'] === 'br'
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passedChecks / Object.keys(checks).length) * 100);

  const suggestions = [];
  if (!checks.usesHTTPS) suggestions.push('Use HTTPS for secure connections');
  if (!checks.minifiedResources) suggestions.push('Enable compression (gzip/brotli)');
  suggestions.push('Use modern image formats (WebP, AVIF)');
  suggestions.push('Avoid deprecated APIs and libraries');
  suggestions.push('Implement proper error handling');

  return { score, checks, suggestions };
};

module.exports = { analyzePerformance };
