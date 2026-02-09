const TrackedWebsite = require('../models/TrackedWebsite');
const Notification = require('../models/Notification');
const { performAnalysis } = require('./analyzerController');

// Get all tracked websites for user
exports.getTrackedWebsites = async (req, res) => {
  try {
    const websites = await TrackedWebsite.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { websites }
    });
  } catch (error) {
    console.error('Get tracked websites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tracked websites'
    });
  }
};

// Add new tracked website
exports.addTrackedWebsite = async (req, res) => {
  try {
    const { url, nickname, checkInterval } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    // Check if user already tracking this URL
    const existing = await TrackedWebsite.findOne({ 
      userId: req.userId, 
      url: url.toLowerCase() 
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You are already tracking this website'
      });
    }

    // Create tracked website
    const website = await TrackedWebsite.create({
      userId: req.userId,
      url: url.toLowerCase(),
      nickname,
      checkInterval: checkInterval || 24,
      nextCheck: new Date(Date.now() + (checkInterval || 24) * 60 * 60 * 1000)
    });

    // Perform initial check
    try {
      const analysis = await performAnalysis(url);
      
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
    } catch (error) {
      console.error('Initial check failed:', error);
    }

    res.status(201).json({
      success: true,
      message: 'Website added successfully',
      data: { website }
    });
  } catch (error) {
    console.error('Add tracked website error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add website'
    });
  }
};

// Update tracked website
exports.updateTrackedWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const { nickname, checkInterval, isActive } = req.body;

    const website = await TrackedWebsite.findOne({ 
      _id: id, 
      userId: req.userId 
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    if (nickname !== undefined) website.nickname = nickname;
    if (checkInterval !== undefined) website.checkInterval = checkInterval;
    if (isActive !== undefined) website.isActive = isActive;

    await website.save();

    res.json({
      success: true,
      message: 'Website updated successfully',
      data: { website }
    });
  } catch (error) {
    console.error('Update tracked website error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update website'
    });
  }
};

// Delete tracked website
exports.deleteTrackedWebsite = async (req, res) => {
  try {
    const { id } = req.params;

    const website = await TrackedWebsite.findOneAndDelete({ 
      _id: id, 
      userId: req.userId 
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    // Delete associated notifications
    await Notification.deleteMany({ websiteId: id });

    res.json({
      success: true,
      message: 'Website removed successfully'
    });
  } catch (error) {
    console.error('Delete tracked website error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete website'
    });
  }
};

// Check single website now
exports.checkWebsiteNow = async (req, res) => {
  try {
    const { id } = req.params;

    const website = await TrackedWebsite.findOne({ 
      _id: id, 
      userId: req.userId 
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    // Perform check
    const analysis = await performAnalysis(website.url);
    
    // Update website status
    const previousStatus = website.status;
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
    await checkAndCreateNotifications(website, previousStatus, req.userId);

    res.json({
      success: true,
      message: 'Website checked successfully',
      data: { website, analysis }
    });
  } catch (error) {
    console.error('Check website error:', error);
    
    // Update with error status
    const website = await TrackedWebsite.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (website) {
      website.status.lastError = error.message;
      website.lastCheck = Date.now();
      website.nextCheck = new Date(Date.now() + website.checkInterval * 60 * 60 * 1000);
      await website.save();
    }

    res.status(500).json({
      success: false,
      message: 'Failed to check website',
      error: error.message
    });
  }
};

// Helper function to create notifications
async function checkAndCreateNotifications(website, previousStatus, userId) {
  const notifications = [];

  // SSL Expiry notifications
  if (website.status.ssl.valid && website.status.ssl.daysRemaining <= 30) {
    const notificationType = website.status.ssl.daysRemaining <= 7 ? 'ssl_expiring' : 'ssl_expiring';
    
    notifications.push({
      userId,
      websiteId: website._id,
      type: notificationType,
      title: `SSL Certificate Expiring Soon`,
      message: `SSL certificate for ${website.nickname || website.url} expires in ${website.status.ssl.daysRemaining} days`,
      data: {
        url: website.url,
        daysRemaining: website.status.ssl.daysRemaining,
        expiryDate: website.status.ssl.expiryDate
      }
    });
  }

  // SSL Invalid
  if (!website.status.ssl.valid) {
    notifications.push({
      userId,
      websiteId: website._id,
      type: 'ssl_invalid',
      title: 'SSL Certificate Invalid',
      message: `SSL certificate for ${website.nickname || website.url} is invalid or expired`,
      data: { url: website.url }
    });
  }

  // Performance degradation
  if (previousStatus?.performance?.score && 
      website.status.performance.score < previousStatus.performance.score - 20) {
    notifications.push({
      userId,
      websiteId: website._id,
      type: 'performance_degraded',
      title: 'Performance Degraded',
      message: `Performance score for ${website.nickname || website.url} dropped from ${previousStatus.performance.score} to ${website.status.performance.score}`,
      data: {
        url: website.url,
        performanceScore: website.status.performance.score,
        previousScore: previousStatus.performance.score
      }
    });
  }

  // Create all notifications
  for (const notif of notifications) {
    await Notification.createNotification(notif);
  }
}

module.exports.checkAndCreateNotifications = checkAndCreateNotifications;
