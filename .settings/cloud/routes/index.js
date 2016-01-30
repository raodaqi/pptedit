var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/signin', function(req, res, next) {
  res.render('signin', { title: 'Express' });
});
router.get('/market', function(req, res, next) {
  res.render('market', { title: 'Express' });
});
router.get('/trends', function(req, res, next) {
  res.render('trends', { title: 'Express' });
});
router.get('/app', function(req, res, next) {
  res.render('app', { title: 'Express' });
});

module.exports = router;
