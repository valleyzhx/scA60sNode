var cheerio = require('cheerio');
var superagent = require('superagent');
var Science = require('../node/model/Science');

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
      var result = [];
      $('.contentlist ul strong a').each(function (idx, element) {
        var $element = $(element);
        items.push({
          title: $element.attr('title'),
          href: 'http://www.bigear.cn'+$element.attr('href')
        });

      });
      // var s = items[0];
      // items = [s];
      (function s () {
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

                var science = new science({
                  title:item.title,
                  mp3:mp3,
                  content:text
                });
                science.save((function (err) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log('meow');
                });

            }
            // res.send(result);
            s();
          })
        }else {
            res.send(result);
        }
      })()


    });
