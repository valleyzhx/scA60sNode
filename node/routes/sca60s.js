var express = require('express');
var router = express.Router();
var Science = require('../model/Science');

/* GET users listing. */
router.get('/', function(req, res, next) {
  var page = 1;
  var pagesize = 10;

  if (req.query.func == 'getlist') {
      if (req.query.page) {
        page = Math.max(req.query.page,1);
      }
      if (req.query.pagesize) {
        pagesize = Math.max(req.query.pagesize,1);
      }
      Science.find({},'-_id -__v')
      .limit(pagesize)
      .skip((page-1)*pagesize)
      .sort({'create':-1})
      .exec(function (err,list) {
        if (err) {
			        res.jsonp('error',{
				      message:err.message,
				      error:err
			         });
			        return;
		        }
		if (!list) {
			res.jsonp({'code':0,data:[]});
		}else{
			res.jsonp({'code':0,data:list});
		}
      });

  }
});

module.exports = router;
