var user = require('./model')
    , utils = require('../utils');

exports.model = user.model;

exports.is_user = function(req, res, next)
{
    // is user is admin or...
    if (req.session.user == req.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}

exports.list = function(req, res)
{
    user.model.find(function(err, users) {
        res.render('users/list', { title: 'Users', users: users });
    });
};

exports.load = function(req, res, next)
{
    utils.load_by_id(req, user.model, next);
};

exports.display = function(req, res)
{
  res.render('users/display', {
    title: 'Viewing user ' + req.user.name,
    user: req.user
  });
};

exports.form = {
    get: function(req, res)
    {
      res.render('users/form', {
        title: 'Editing user ' + req.user.name,
        user: req.user
      });
    },
    post: function(req, res)
    {
      // Normally you would handle all kinds of
      // validation and save back to the db
      var user = req.body.user;
      req.user.name = user.name;
      req.user.email = user.email;
      res.redirect('back');
    }
}
