var express = require('express');
var router = express.Router();
var Science = require('../model/Science');
var superagent = require('superagent');
var cheerio = require('cheerio');


/* GET users listing. */
router.get('/', function(req, res, next) {
  superagent.get('http://www.bigear.cn/res-3481-7777700197596.html')
  .set('User-Agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36')
  .end(function(err,sres) {
    if (err) {
      return next(err);
    }
    var $ = cheerio.load(sres.text);
    var mp3 = $('audio').attr('src');
    var key = mp3.match(/\/\w{4}\//);
    console.log('key:'+key);
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
        res.jsonp({'code':0,'data':[]});
      }else{
        var itmes = [];
        for (var i = 0; i < list.length; i++) {
          var model = list[i];
          var mp3 = model.mp3;
          model.mp3 = mp3.replace(/\/\w{4}\//,key);;
        }
        res.jsonp({'code':0,'data':list});
      }
        });

    }

  });

});

module.exports = router;
