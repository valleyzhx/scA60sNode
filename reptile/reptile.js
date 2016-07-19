var express = require('express');
var cheerio = require('cheerio');
var superagent = require('superagent');
var Science = require('../node/model/Science');
var ReptileItem = require('../node/model/ReptileItem');

var app = express();
var initPage = 5;

function detailReqest (items,func) {
   var item = items.pop();
   if(item) {
     superagent.get(item.href)
     .set('User-Agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36')
     .end(function(err,sres) {
       if(err) {
         items.push(item);
       }else {
           var $ = cheerio.load(sres.text);
           var text = $('#enText').text();
           var mp3 = $('audio').attr('src');

           if (text.length>20) {
             var science = new Science({
               title:item.title,
               mp3:mp3,
               content:text,
               create:item.time
             });
             // res.send(science);
             science.save(function(err) {
               if (err) {
                 //console.log(err);
               } else {
                 //console.log('success');
               }
             });
           }else {
             var reptileItem = new ReptileItem({
               title:item.title,
               href:item.href,
               time:item.time
             });
             reptileItem.save(function(err) {
               if (err) {
                 //console.log(err);
               } else {
                 //console.log('success');
               }
             });
           }
     }
      detailReqest(items,func);
   });
 }else {
       func();
   }
}

function appAction() {
  // 用 superagent 去抓取 https://cnodejs.org/ 的内容
  (function startReptile(page) {
    superagent.get('http://www.bigear.cn/reslist-3199-'+ page +'.html')
    .set('User-Agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36')
    .end(function (err, sres) {
        // 常规的错误处理
        if (err) {
          return next(err);
        }

        var $ = cheerio.load(sres.text);
        var items = [];
        Science.findOne({},null,{sort: {'create': -1 }},function(err, science){
          if (err) {
          //  res.send(err);
          }
          var lastTime = '0';
          if (science) {
              lastTime = science.create;
          }
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
         detailReqest(items,function () {
           page--;
           if (page>0) {
             startReptile(page);
           }else {
             // res.send('finish');
             console.log('finish');
             initPage = 1;
           }
         });
        });
      });
  })(initPage);

}

function checkFailAction() {
  ReptileItem.find(function (err, items) {
  if (err) return console.error(err);
  console.log("check fail");
  ReptileItem.remove(function (err) {
    if (err) return console.error(err);
    detailReqest(items,function() {
      console.log("check finish");
    });
  });
})
}

  appAction();
setInterval(function () {
  appAction();
},1000*3600*12);
setInterval(function () {
  checkFailAction();
},1000*3600);

// app.listen(3000, function () {
//   console.log('app is listening at port 3000');
// });
