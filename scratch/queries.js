'use strict';

const knex = require('../knex');

// GET
let searchTerm = 'gaga';
knex
  .select('notes.id', 'title', 'content')
  .from('notes')
  .modify(queryBuilder => {
    if (searchTerm) {
      queryBuilder.where('title', 'like', `%${searchTerm}%`);
    }
  })
  .orderBy('notes.id')
  .then(results => {
    console.log(JSON.stringify(results, null, 2));
  })
  .catch(err => {
    console.error(err);
  });

// GET by id
let id = 1002;
searchTerm='';
knex 
  .select('notes.id', 'title', 'content')
  .from('notes')
  .where({id: id})
  .orderBy('notes.id')
  .then(results => {
    console.log(JSON.stringify(results[0], null, 2));
  })
  .catch(err => {
    console.error(err);
  });

// PUT
let updateObj = {id: 1002, title: 'Updated Note', content: 'This note was updated'};
knex('notes')
  .update({title: updateObj.title, content: updateObj.content})
  .where({id: id})
  .returning(['id', 'title', 'content'])
  .then(results => {
    console.log(JSON.stringify(results[0], null, 2));
  })
  .catch(err => {
    console.error(err);
  });

// POST
let newObj = {title: 'New Note', content: 'This is a new note'};
knex('notes')
  .insert(newObj)
  .returning(['id', 'title', 'content'])
  .then(results => {
    console.log(JSON.stringify(results[0], null, 2));
  })
  .catch(err => {
    console.error(err);
  });

// DELETE
id=1000;
knex('notes')
  .del()
  .where({id: id})
  .then(results => {
    console.log(JSON.stringify(results, null, 2));
  })
  .catch(err => {
    console.error(err);
  });