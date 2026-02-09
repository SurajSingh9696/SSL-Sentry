const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

router.get('/', websiteController.getTrackedWebsites);
router.post('/', websiteController.addTrackedWebsite);
router.put('/:id', websiteController.updateTrackedWebsite);
router.delete('/:id', websiteController.deleteTrackedWebsite);
router.post('/:id/check', websiteController.checkWebsiteNow);

module.exports = router;
