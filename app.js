const express = require('express');
const morgan = require('morgan');
const path = require('path');
const nunjucks = require('nunjucks');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'html');

nunjucks.configure('views', {
  express: app,
  watch: true,
});

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/upload', upload.array('input_profile'), (req, res) => {
  const files = req.files;
  let allData = [];
  let fileNames = [];
  for (const file of files) {
    const rows = file.buffer.toString('utf-8').split('\n').map(row => row.trim().split(/\t|,|\s+/));
    const filteredRows = rows.filter(row => row.length > 1 && row.some(cell => cell.trim() !== '') && !row[0].toLowerCase().startsWith('task'));
    allData = allData.concat(filteredRows);
    fileNames.push(file.originalname);
  }
  res.status(200).json({ data: allData, files: fileNames });
});

app.get('/', (req, res) => {
  res.render('index');
});

app.use((req, res, next) => {
  const error = new Error(`${req.url}은 잘못된 주소입니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log("http://localhost:" + app.get('port') + " server open");
});
