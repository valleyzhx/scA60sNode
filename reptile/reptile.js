var express = require('express');
var cheerio = require('cheerio');
var superagent = require('superagent');
var Science = require('../node/model/Science');

var app = express();

app.get('/', function (req, res) {
  // 用 superagent 去抓取 https://cnodejs.org/ 的内容
  superagent.get('http://www.bigear.cn/reslist-3199-1.html')
  .set('User-Agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36')
  .end(function (err, sres) {
      // 常规的错误处理
      if (err) {
        return next(err);
      }
      // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
      // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
      // 剩下就都是 jquery 的内容了
      var $ = cheerio.load(sres.text);
      var items = [];
      Science.findOne({},null,{sort: {'create': -1 }},function(err, science){
        if (err) {
          res.send(err);
        }
        var lastTime = science.create;
        $('.contentlist ul strong a').each(function (idx, element) {
         var $element = $(element);
         var title = $element.attr('title');
         var timeStr = title.match(/\d{4}.\d{2}.\d{2}/g);
         var time ='';
         if (!timeStr) {
           var date = title.match(/\d{6}/g);
           if (date) {
              date = date.toString();
             time = "20"+date.substr(0,2)+"."+date.substr(2,2)+"."+date.substr(4,2);
             title = title.replace(date,'');
           }
         }else {
           time = timeStr[0];
           title = title.replace(time,'');
         }
         if (time>lastTime) {
           items.push({
             title: title,
             href: 'http://www.bigear.cn'+$element.attr('href'),
             time:time
           });
         }
       });
      });


      //  res.send(items);

    /*  (function s () {
        var item = items.pop();
        if(item) {
          superagent.get(item.href)
          .set('User-Agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36')
          .end(function(err,sres) {
            if(err) {
              items.push(item);
              console.log('err', err);
            }else {
                var $ = cheerio.load(sres.text);
                var text = $('#enText').text();
                var mp3 = $('audio').attr('src');
                var science = new Science({
                  title:item.title,
                  mp3:mp3,
                  content:text,
                  create:item.time
                });
                // res.send(science);
                science.save(function(err) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log('success');
                  }
                });
          }
           s();
        });
        }else {
             res.send(result);
        }
    })()*/

    });
});

app.listen(3000, function () {
  console.log('app is listening at port 3000');
});
