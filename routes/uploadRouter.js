const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');    // callback (cb) args: to say no error, and path to store file
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname)   // originalname makes sure name of file is same in both server n client side. Otherwise multer will give some random string
  }
});

const imageFileFilter = (req, file, cb) => {
  if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {   // if file is not one of these extensions, return error
    return cb(new Error('You can upload only image files!'), false);  
  }
  cb(null, true);  // otherwise null (no error) and true, to accept the file
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter});  // configure upload

const uploadRouter = express.Router();

uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  res.statusCode = 403;
  res.end('GET operation not supported on /imageUpload');
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json(req.file);  // info from multer to client with info abt file
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /imageUpload');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  res.statusCode = 403;
  res.end('DELETE operation not supported on /imageUpload');
});

module.exports = uploadRouter;