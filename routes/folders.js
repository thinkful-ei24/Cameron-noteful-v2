'use strict';

const express = require('express');

const knex = require('../knex');

// Create an router instance (aka "mini-app")
const router = express.Router();

router.get('/', (req, res, next) => {
  knex.select('id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.get('/:id', (req, res, next) => {
  const {id} = req.params;

  knex('folders')
    .select('id', 'name')
    .where({id})
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => next(err));
});

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

  knex('folders')
    .update({name: updateObj.name})
    .where({id})
    .returning(['id', 'name'])
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  const {name} = req.body;
  const newFolder = {name};

  if(!newFolder.name){
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  knex('folders')
    .insert(newFolder)
    .returning(['id', 'name'])
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => next(err));
});

router.delete('/:id', (req, res, next) => {
  const {id} = req.params;

  knex('folders')
    .del()
    .where({id})
    .then(() => res.sendStatus(204))
    .catch(err => next(err));
});

module.exports = router;
