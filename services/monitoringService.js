const cron = require('node-cron');
const TrackedWebsite = require('../models/TrackedWebsite');
const { performAnalysis } = require('../controllers/analyzerController');
const { checkAndCreateNotifications } = require('../controllers/websiteController');

// Monitor tracked websites
async function monitorWebsites() {
  try {
    console.log('🔍 Running website monitoring check...');
    
    const now = new Date();
    const websitesToCheck = await TrackedWebsite.find({
      isActive: true,
      nextCheck: { $lte: now }
    });

    console.log(`📋 Found ${websitesToCheck.length} websites to check`);

    for (const website of websitesToCheck) {
      try {
        console.log(`🌐 Checking ${website.url}...`);
        
        const analysis = await performAnalysis(website.url);
        const previousStatus = website.status;
        
        // Update website status
        website.lastCheck = Date.now();
        website.status = {
          overall: analysis.ssl?.valid ? 'healthy' : 'warning',
          ssl: {
            valid: analysis.ssl?.valid,
            daysRemaining: analysis.ssl?.daysRemaining,
            expiryDate: analysis.ssl?.validTo
          },
          performance: {
            score: analysis.performance?.performance?.score || 0,
            loadTime: analysis.performance?.metrics?.pageLoadTime || 0
          }
        };
        website.nextCheck = new Date(Date.now() + website.checkInterval * 60 * 60 * 1000);
        
        await website.save();
        
        // Create notifications if needed
        await checkAndCreateNotifications(website, previousStatus, website.userId);
        
        console.log(`✓ ${website.url} checked successfully`);
      } catch (error) {
        console.error(`✗ Error checking ${website.url}:`, error.message);
        
        // Update with error status
        website.status.lastError = error.message;
        website.lastCheck = Date.now();
        website.nextCheck = new Date(Date.now() + website.checkInterval * 60 * 60 * 1000);
        await website.save();
      }
    }
    
    console.log('✓ Monitoring check completed');
  } catch (error) {
    console.error('✗ Monitoring error:', error);
  }
}

// Initialize monitoring service
function initMonitoring() {
  console.log('🚀 Initializing website monitoring service...');
  
  // Run every hour
  cron.schedule('0 * * * *', () => {
    monitorWebsites();
  });
  
  // Run on startup after 1 minute
  setTimeout(() => {
    monitorWebsites();
  }, 60000);
  
  console.log('✓ Monitoring service started (runs every hour)');
}

module.exports = { initMonitoring, monitorWebsites };
