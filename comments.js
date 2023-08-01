// Create web server


// Import modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

// Import models
const Dishes = require('../models/dishes');
const Comments = require('../models/comments');

// Create router
const commentRouter = express.Router();

// Use body-parser
commentRouter.use(bodyParser.json());

// Configure router
commentRouter.route('/')
    .get((req, res, next) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /comments');
    }
    )   // End of .get()
    .post(authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.body.dishId)
            .then((dish) => {
                if (dish != null) {
                    Comments.create({
                        rating: req.body.rating,
                        comment: req.body.comment
                    }) // End of Comments.create()
                        .then((comment) => {
                            dish.comments.push(comment._id);
                            dish.save()
                                .then((dish) => {
                                    Comments.findById(comment._id)
                                        .populate('author')
                                        .then((comment) => {
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'application/json');
                                            res.json(comment);
                                        })
                                }, (err) => next(err));
                        }
                        , (err) => next(err));
                }   // End of if (dish != null)
                else {
                    err = new Error('Dish ' + req.body.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }   // End of else
            }, (err) => next(err))
            .catch((err) => next(err));
    }
    )   // End of .post()
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /comments');
    }
    )   // End of .put()
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Comments.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    }
    );  // End of .delete()

commentRouter.route('/:commentId')
    .get((req, res, next) => {
        Comments.findById(req.params.commentId)
            .populate('author')
            .then((comment) => {
                if (comment != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(comment);
                }   // End of if (comment != null)
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }   // End of else
            }, (err) => next(err))
            .catch((err) => next(err));
    });


    
