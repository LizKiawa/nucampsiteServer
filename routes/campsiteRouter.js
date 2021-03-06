const express = require('express');
const bodyParser = require('body-parser');
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');
const cors = require('./cors');  // one dot is to import cors module from the routes folder, not the one u installed in node_modules

const campsiteRouter = express.Router();

campsiteRouter.use(bodyParser.json());

campsiteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {  // basic cors or get method. The corsWithOptions is for preflight requests
  Campsite.find()
  .populate('comments.author')
  .then(campsites => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(campsites);
  })
  .catch(err => next(err)); //next passes off the error to the overall error handler
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Campsite.create(req.body)
  .then(campsite => {
    console.log('Campsite Created ', campsite);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(campsite);
  })
  .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {  //leaving this as is coz put operation is not allowed
  res.statusCode = 403;
  res.end('PUT operation not supported on /campsites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Campsite.deleteMany()
  .then(response => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(response);
  })
  .catch(err => next(err));
});

campsiteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
  Campsite.findById(req.params.campsiteId)
  .populate('comments.author')
  .then(campsite => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(campsite);
  })
  .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
  res.statusCode = 403;
  res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Campsite.findByIdAndUpdate(req.params.campsiteId, {
    $set: req.body
  }, { new: true }) //new, so we get back info about the updated document as the result from this method
  .then(campsite => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(campsite);
  })
  .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Campsite.findByIdAndDelete(req.params.campsiteId)
  .then(response => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(response);
  })
  .catch(err => next(err));
});

campsiteRouter.route('/:campsiteId/comments')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
  Campsite.findById(req.params.campsiteId)
  .populate('comments.author')
  .then(campsite => {
    if (campsite) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(campsite.comments);
    } else {
      err = new Error(`Campsite ${req.params.campsiteId} not found`);
      err.status = 404;
      return next(err);
    }
  })
  .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,  (req, res, next) => {
  Campsite.findById(req.params.campsiteId)
  .then(campsite => {
    if (campsite) {
      req.body.author = req.user._id;
      campsite.comments.push(req.body);
      campsite.save()
      .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
      })
      .catch(err => next(err));
    } else {
      err = new Error(`Campsite ${req.params.campsiteId} not found`);
      err.status = 404;
      return next(err);
    }
  })
  .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {  //leaving this as is coz put operation is not allowed
  res.statusCode = 403;
  res.end('PUT operation not supported on /campsites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Campsite.findById(req.params.campsiteId)
  .then(campsite => {
    if (campsite) {
      for (let i = (campsite.comments.length-1); i >= 0; i--) {
        campsite.comments.id(campsite.comments[i]._id).remove();
      }
      campsite.save()
      .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
      })
      .catch(err => next(err));
    } else {
      err = new Error(`Campsite ${req.params.campsiteId} not found`);
      err.status = 404;
      return next(err);
    }
  })
  .catch(err => next(err));
});

campsiteRouter.route('/:campsiteId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
  Campsite.findById(req.params.campsiteId)
  .populate('comments.author')
  .then(campsite => {
    if (campsite && campsite.comments.id(req.params.commentId)) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(campsite.comments.id(req.params.commentId));
    } else if (!campsite) {
      err = new Error(`Campsite ${req.params.campsiteId} not found`);
      err.status = 404;
      return next(err);
    } else {
      err = new Error(`Comment ${req.params.commentId} not found`);
      err.status = 404;
      return next(err);
    }
  })
  .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
  res.statusCode = 403;
  res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Campsite.findById(req.params.campsiteId)
  .populate('comments.author')
  .then(campsite => {
    if (campsite && campsite.comments.id(req.params.commentId)) {
      if((campsite.comments.id(req.params.commentId).author._id).equals(req.user._id)) {
        if (req.body.rating) {
          campsite.comments.id(req.params.commentId).rating = req.body.rating;
        }
        if (req.body.text) {
          campsite.comments.id(req.params.commentId).text = req.body.text;
        }
        campsite.save()
        .then(campsite => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(campsite);
        })
        .catch(err => next(err));
      } else {
        err = new Error('You are not authorized!');
        err.status = 403;
        return next(err);
      }  
    } else if (!campsite) {
      err = new Error(`Campsite ${req.params.campsiteId} not found`);
      err.status = 404;
      return next(err);
    } else {
      err = new Error(`Comment ${req.params.commentId} not found`);
      err.status = 404;
      return next(err);
    }
  })
  .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Campsite.findById(req.params.campsiteId)
  .then(campsite => {
    if (campsite && campsite.comments.id(req.params.commentId)) {
      if((campsite.comments.id(req.params.commentId).author._id).equals(req.user._id)) {
        campsite.comments.id(req.params.commentId).remove();
        campsite.save()
        .then(campsite => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(campsite);
        })
        .catch(err => next(err));
      } else {
        err = new Error('You are not authorized!');
        err.status = 403;
        return next(err);
      }  
    } else if (!campsite) {
      err = new Error(`Campsite ${req.params.campsiteId} not found`);
      err.status = 404;
      return next(err);
    } else {
      err = new Error(`Comment ${req.params.commentId} not found`);
      err.status = 404;
      return next(err);
    }
  })
  .catch(err => next(err));
});


module.exports = campsiteRouter;