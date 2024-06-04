const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.get('/', async (req, res) => {
  try {
    const profiles = await profileController.getProfiles(req, res);
    res.render('index', { profiles });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.render('error', { message: 'Error fetching profiles', error });
  }
});

module.exports = router;
