var cms = require('../modules/cms');

exports.templates = {
  home: {
    template: 'hackettmill/home.ejs',
    data: function(user, params, complete){
      var Exhibition = cms.meta.model('Exhibition');
      var News = cms.meta.model('News');
      Exhibition.find({}, function(err, exhibits){
        News.find({}, function(err, news){
          complete({exhibits: exhibits, news: news});
        });
      });
    }
  }
}