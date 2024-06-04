const express = require('express');
const router = express.Router();
const multer = require('multer');
const profileController = require('../controllers/profileController');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.array('input_profile'), profileController.uploadFiles);
router.get('/', profileController.getProfiles);
router.get('/data/:name', profileController.getProfileData);
router.delete('/drop/:name', profileController.deleteProfile);

module.exports = router;
