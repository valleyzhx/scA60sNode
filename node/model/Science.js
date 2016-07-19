var mongoose = require('mongoose');
var db = require('../../configure/db');

mongoose.connect('mongodb://localhost/sca60');

var Science = mongoose.model('Science', {
  title:String,
  mp3:String,
  content:String,
  create:String
});

module.exports = Science;
