const Profile = require('../models/profile');

exports.uploadFiles = async (req, res) => {
  try {
    const files = req.files;
    for (const file of files) {
      const rows = file.buffer.toString().split('\n').map(row => row.trim().split(/\t|,|\s+/));
      
      // 빈 행 제거 및 'task'로 시작하는 행 제거
      const filteredRows = rows.filter(row => row.length > 1 && row.some(cell => cell.trim() !== '') && !row[0].toLowerCase().startsWith('task'));

      const name = file.originalname.split('.')[0];

      await Profile.create({ name, data: filteredRows });
    }
    res.status(200).send('Files uploaded and processed successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().distinct('name');
    res.json(profiles);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getProfileData = async (req, res) => {
  try {
    const { name } = req.params;
    const profile = await Profile.findOne({ name });

    if (!profile) {
      return res.status(404).send('Profile not found');
    }

    res.json(profile.data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const { name } = req.params;
    await Profile.deleteMany({ name });
    res.send('Profile deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
};
