'use strict';

const express = require('express');

const knex = require('../knex');

// Create an router instance (aka "mini-app")
const router = express.Router();

// Get All Tags
router.get('/', (req, res, next) => {
  knex('tags')
    .select('id', 'name')
    .then(results => res.json(results))
    .catch(err => next(err));
});

// Get Tag by Id
router.get('/:id', (req, res, next) => {
  const {id} = req.params;
  knex('tags')
    .select('id', 'name')
    .where({id})
    .then(results => res.json(results[0]))
    .catch(err => next(err));

});

// Update Tag
router.put('/:id', (req, res, next) => {
  const {id} = req.params;

  const updateObj = {};
  const updateableField = ['name'];

  updateableField.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  if (!updateObj.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  knex('tags')
    .update(updateObj)
    .where({id})
    .returning(['id', 'name'])
    .then(results => res.json(results[0]))
    .catch(err => next(err));
});

// Post Tag
router.post('/', (req, res, next) => {
  const {name} = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newItem = {name};

  knex.insert(newItem)
    .into('tags')
    .returning(['id', 'name'])
    .then(([results]) => {
      res.location(`${req.originalUrl}/${results.id}`).status(201).json(results);
    })
    .catch(err => next(err));
});

// Delete Tag
router.delete('/:id', (req, res, next) => {
  const {id} = req.params;

  knex('tags')
    .del()
    .where({id})
    .then(() => res.sendStatus(204))
    .catch(err => next(err));
});


module.exports = router;