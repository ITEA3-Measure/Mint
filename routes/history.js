var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:project', function(req, res, next) {
    console.log(req.param('project'));
    res.render('history', { title: 'History' });
});

module.exports = router;