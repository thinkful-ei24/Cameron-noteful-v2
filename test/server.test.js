'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const knex = require('../knex');
const expect = chai.expect;

chai.use(chaiHttp);

describe.skip('Sanity check', function () {

  it('true should be true', function () {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function () {
    expect(2 + 2).to.equal(4);
  });

});


describe('Static Server', function () {

  it('GET request "/" should return the index page', function () {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });

});

describe('Noteful API', function () {
  const seedData = require('../db/seedData');

  beforeEach(function () {
    return seedData('./db/noteful-app.sql');
  });

  after(function () {
    return knex.destroy(); // destroy the connection
  });

  describe('GET /api/notes', function () {

    it('should return the default of 10 Notes ', function () {
      return chai.request(app)
        .get('/api/notes')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(10);
        });
    });

    it('should return correct search results for a valid searchTerm', function () {
      return chai.request(app)
        .get('/api/notes?searchTerm=about%20cats')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(4);
          expect(res.body[0]).to.be.an('object');
        });
    });

  });

  describe('404 handler', function () {

    it('should respond with 404 when given a bad path', function () {
      return chai.request(app)
        .get('/api/does/not/exist')
        .then(function (res) {
          expect(res).to.have.status(404);
        });
    });
  
  });
  
  describe('GET /api/notes', function () {
  
    it('should return an array of objects where each item contains id, title, and content', function () {
      return chai.request(app)
        .get('/api/notes')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body.length).to.be.at.least(1);
          const expectedKeys = ['id', 'title', 'content'];
          res.body.forEach(function(note){
            expect(note).to.be.a('object');
            expect(note).to.include.keys(expectedKeys);
          });
        });
    });
  
    it('should return an empty array for an incorrect searchTerm', function () {
      return chai.request(app)
        .get('/api/notes/?searchTerm=pizza')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(0);
        });
    });
  
  });
  
  describe('GET /api/notes/:id', function () {
  
    it('should return correct note when given an id', function () {
      return chai.request(app)
        .get('/api/notes/1001')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          const expectedKeys = ['id', 'title', 'content'];
          expect(res.body).to.include.keys(expectedKeys);
          expect(res.body.id).to.equal(1001);
        });
    });
  
    it('should respond with a 404 for an invalid id', function () {
      return chai.request(app)
        .get('/api/notes/10')
        .then(function (res) {
          expect(res).to.have.status(404);
        });
    });
  
  });
  
  describe('POST /api/notes', function () {
  
    it('should create and return a new item when provided valid data', function () {
      const newItem = { title: 'New Note', content: 'This is a new note', folderId: '', tags:[]};
      return chai
        .request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'content', 'folderId', 'folderName', 'tags');
          expect(res.body.id).to.not.equal(null);
          expect(res.body).to.deep.equal(
            Object.assign(newItem, { id: res.body.id, folderId: res.body.folderId, folderName: res.body.folderName })
          );
        });
    });
  
    it('should return an error when missing "title" field', function () {
      const newItem = { content: 'This is a new note', folderId: '', tags:[]};
      return chai
        .request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function(res) {
          expect(res).to.have.status(400);
        });
    });
  
  });
  
  describe('PUT /api/notes/:id', function () {
  
    it('should update the note', function () {
      const updateItem = { title: 'Updated Note', content: 'This is an updated note', folderId: '', tags:[]};
      return chai
        .request(app)
        .get('/api/notes')
        .then(function(res) {
          updateItem.id = res.body[0].id;
          return chai
            .request(app)
            .put(`/api/notes/${updateItem.id}`)
            .send(updateItem);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.deep.equal(
            Object.assign(updateItem, { id: res.body.id, folderId: res.body.folderId, folderName: res.body.folderName })
          );
        });
    });
  
    it('should respond with a 404 for an invalid id', function () {
      const updateItem = { title: 'Updated Note', content: 'This is an updated note', folderId: '', tags:[]};
      return chai.request(app)
        .put('/api/notes/10')
        .send(updateItem)
        .then(function (res) {
          expect(res).to.have.status(404);
        });
    });
  
    it('should return an error when missing "title" field', function () {
      const updateItem = {content: 'This is an updated note', folderId: '', tags:[]};
      return chai
        .request(app)
        .post('/api/notes')
        .send(updateItem)
        .then(function(res) {
          expect(res).to.have.status(400);
        });
    });
  
  });
  
  describe('DELETE  /api/notes/:id', function () {
  
    it('should delete an item by id', function () {
      return chai  
        .request(app)
        .get('/api/notes')
        .then(function(res) {
          return chai.request(app).delete(`/api/notes/${res.body[0].id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
        });
    });
  
  });
  

});

