const profiles = {};

exports.uploadFiles = (req, res) => {
  try {
    const files = req.files;
    for (const file of files) {
      const rows = file.buffer.toString().split('\n').map(row => row.trim().split(/\t|,|\s+/));
      
      // 빈 행 제거 및 'task'로 시작하는 행 제거
      const filteredRows = rows.filter(row => row.length > 1 && row.some(cell => cell.trim() !== '') && !row[0].toLowerCase().startsWith('task'));

      const name = file.originalname.split('.')[0];

      if (!profiles[name]) {
        profiles[name] = [];
      }
      profiles[name].push(filteredRows);
    }
    res.status(200).send('Files uploaded and processed successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getProfiles = (req, res) => {
  try {
    const profileNames = Object.keys(profiles);
    res.json(profileNames);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getProfileData = (req, res) => {
  try {
    const { name } = req.params;
    const profileData = profiles[name];

    if (!profileData) {
      return res.status(404).send('Profile not found');
    }

    res.json(profileData);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.deleteProfile = (req, res) => {
  try {
    const { name } = req.params;
    delete profiles[name];
    res.send('Profile deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
};
