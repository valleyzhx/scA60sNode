var mongoose = require('mongoose');

var ReptileItem = mongoose.model('ReptileItem', {
  title:String,
  href:String,
  time:String
});

module.exports = ReptileItem;
