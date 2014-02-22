var User = require('./model').User;
var nodemailer = require("nodemailer");
var crypto = require('crypto');



exports.on_login = '.';


exports.login =
{
  get: function (req, res) {
    res.render('auth/login', {});
  },

  post: function (req, res) {
    var noway = function () {
      req.session.message = 'no way';
      res.redirect(req.query.next || exports.on_login);
    }
    var q = {email: req.body.email};
    User.findOne(q, function (err, user) {
      if (!user)
        noway();
      else {
        exports.hash(req.body.password, user.salt, function (err, hash) {
          if (err)
            noway();
          if (hash != user.hash)
            noway();
          req.session.message = 'user found!';
          req.session.user = user;
          res.redirect(req.query.next || exports.on_login);
        })
      }
    });
  }
};


exports.register =
{
  get: function (req, res) {
    res.render('auth/register');
  },

  post: function (req, res) {
    var q = {email: req.body.email};
    User.findOne(q, function (err, user) {
      if (user) {
        req.session.message = 'User with email already exists';
        if (!user.verified)
          exports.send_mail(user);
        res.redirect('.');
        return;
      }
      exports.hash(req.body.password, function (err, salt, hash) {
        if (err) throw err;
        // store the salt & hash in the "db"
        user = new User();
        user.name = req.body.username;
        user.email = req.body.email;
        user.salt = salt;
        user.hash = hash;
        user.verified = true; // could say false etc
        user.save(function (err, user) {
          req.session.message = err ? 'uhoh ' + err : 'you registered!';
          req.session.user = user;
          if (!user.verified)
            exports.send_mail(user);
          res.redirect('.');
        });
      });
    });
  }
};


var smtpTransport = nodemailer.createTransport("SMTP",{
  service: "Gmail",
  auth: {
      user: "",
      pass: ""
  }
});

exports.send_mail = function (user, subject, text, html) {
  var mailOptions = {
    from: "CMS <currently13@gmail.com>",
    to: user.email,
    subject: 'validate',
    text: 'did you just reg? click /validate?h={user.hash} to complete',
    html: 'did you just reg? click /validate?h={user.hash} to complete'
  }

  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log("Message sent: " + response.message);
    }
    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
  });
};


exports.validate_email = function (req, res) {
  var q = {hash: req.params.h};
  User.findOne(q, function (err, user) {
    if (!user) {
      req.session.message = 'nope';
      res.redirect('.');
      return;
    }
    user.verified = true;
    user.save(function (err, user) {
      req.session.message = err ? 'uhoh ' + err : 'you registered!';
      req.session.user = user;
      res.redirect('.');
    });
  });
};


exports.logout = function (req, res) {
  req.session.destroy(function () {
    res.redirect('/');
  });
};





//admin
exports.list = function(req, res)
{
    User.find(function(err, users) {
        res.render('users/list', { title: 'Users', users: users });
    });
};

//admin
exports.load = function(req, res, next)
{
    var q = User.findOne({_id: req.params['user_id']});
    q.exec(function(err, m)
    {
      //todo
    });
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
      var user = req.body.user;
      req.user.name = user.name;
      req.user.email = user.email;
      res.redirect('back');
    }
}



/// perms

exports.has_user = function(req, res, next)
{
    if (req.session.user) {
        next();
    } else {
        req.session.message = 'Access denied!';
        res.redirect('/login?next='+encodeURIComponent(req.url));
    }
}

exports.is_admin = function(req, res, next)
{
    if (req.session.user.admin) {
        next();
    } else {
        req.session.message = 'Access denied!';
        res.redirect('/login?next='+encodeURIComponent(req.url));
    }
}

exports.is_user = function(req, res, next)
{
    if (req.session.user == req.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}



// https://github.com/visionmedia/node-pwd

var crypto_len = 128;
var crypto_iterations = 12000;

/**
 * Hashes a password with optional `salt`, otherwise
 * generate a salt for `pass` and invoke `fn(err, salt, hash)`.
 *
 * @param {String} password to hash
 * @param {String} optional salt
 * @param {Function} callback
 * @api public
 */

exports.hash = function(pwd, salt, fn) {
    if (3 == arguments.length) {
        crypto.pbkdf2(pwd, salt, crypto_iterations, crypto_len, function(err, hash) {
            fn(err, hash.toString('base64'));
        });
    } else {
        fn = salt;
        crypto.randomBytes(crypto_len, function(err, salt) {
            if (err) return fn(err);
            salt = salt.toString('base64');
            crypto.pbkdf2(pwd, salt, crypto_iterations, crypto_len, function(err, hash) {
                if (err) return fn(err);
                fn(null, salt, hash.toString('base64'));
            });
        });
    }
};