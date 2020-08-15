const express = require('express');
const bodyParser = require('body-parser');
const Promotion = require('../models/promotion');


const promotionRouter = express.Router();

promotionRouter.use(bodyParser.json());

promotionRouter.route('/')
.get((req, res, next) => {
  Promotion.find()
  .then(promotions => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(promotions);
  })
  .catch(err => next(err)); //next passes off the error to the overall error handler
})
.post((req, res, next) => {
  Promotion.create(req.body)
  .then(promotion => {
    console.log('Promotion Created ', promotion);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(promotion);
  })
  .catch(err => next(err));
})
.put((req, res) => {  //leaving this as is coz put operation is not allowed
  res.statusCode = 403;
  res.end('PUT operation not supported on /promotions');
})
.delete((req, res, next) => {
  Promotion.deleteMany()
  .then(response => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(response);
  })
  .catch(err => next(err));
});

promotionRouter.route('/:promotionId')
.get((req, res, next) => {
  Promotion.findById(req.params.promotionId)
  .then(promotion => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(promotion);
  })
  .catch(err => next(err));
})
.post((req, res) => {
  res.statusCode = 403;
  res.end(`POST operation not supported on /promotions/${req.params.promotionId}`);
})
.put((req, res, next) => {
  Promotion.findByIdAndUpdate(req.params.promotionId, {
    $set: req.body
  }, { new: true }) //new, so we get back info about the updated document as the result from this method
  .then(promotion => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(promotion);
  })
  .catch(err => next(err));
})
.delete((req, res, next) => {
  Promotion.findByIdAndDelete(req.params.promotionId)
  .then(response => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(response);
  })
  .catch(err => next(err));
});

module.exports = promotionRouter;