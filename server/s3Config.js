// s3Config.js
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const env = require('dotenv').config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
console.log(process.env.AWS_S3_BUCKET);

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    // acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, `${file.originalname}`);
    }
  })
});

// const upload = multer({ storage: storage });

module.exports = upload;
