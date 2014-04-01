var nodemailer = require("nodemailer");
var crypto = require('crypto');
var Meta = require('./meta');
var utils = require('./utils');


exports.Auth = Auth;


function Auth(User, UserInfo, onLogin) {
  this.User = User;
  this.UserInfo = UserInfo;
  this.onLogin = onLogin;
};

Auth.prototype.login_get = function (req, res) {
  res.render('auth/login', {});
};

Auth.prototype.login_post = function (req, res) {
  var self = this;
  var noway = function () {
    req.session.message = 'no way';
    res.redirect(req.query.next || self.onLogin);
  }
  var q = {email: req.body.email};
  self.User.findOne(q, function (err, user) {
    if (!user)
      noway();
    else {
      exports.hash(req.body.password, user.salt, function (err, hash) {
        if (err) {
          noway();
          return;
        }
        if (hash != user.hash){
          noway();
          return;
        }
        req.session.message = 'user found!';
        req.session.user = user;
        res.redirect(req.query.next || self.onLogin);
      })
    }
  });
};


//Auth.prototype.register_get = function (req, res) {
//    res.render('auth/register');
//  };
//
//Auth.prototype.register_post = function (req, res) {
//    var q = {email: req.body.email};
//    User.findOne(q, function (err, user) {
//      if (user) {
//        req.session.message = 'User with email already exists';
//        if (!user.verified)
//          exports.send_mail(user);
//        res.redirect('.');
//        return;
//      }
//      exports.create_user({name: req.body.username, email: req.body.email, password: req.body.password}, function(err, user){
//          req.session.message = err ? 'uhoh ' + err : 'you registered!';
//          req.session.user = user;
//          if (!user.verified)
//            exports.send_mail(user);
//          res.redirect('.');
//      });
//    });
//};


Auth.prototype.create_user = function(options, complete)
{
  var user = new this.User();
  exports.set_password(user, options.password, function(){
    delete options.password;
    for (var p in options)
      user[p] = options[p];
    user.save(function (err, user) {
      complete(err, user);
    });
  });
}


exports.set_password = function(user, password, complete)
{
  exports.hash(password, function (err, salt, hash) {
    if (err) throw err;
    user.salt = salt;
    user.hash = hash;
    complete();
  });
}


//var smtpTransport = nodemailer.createTransport("SMTP",{
//  service: "Gmail",
//  auth: {
//      user: "",
//      pass: ""
//  }
//});


//exports.send_mail = function (user, subject, text, html) {
//  var mailOptions = {
//    from: "CMS <currently13@gmail.com>",
//    to: user.email,
//    subject: 'validate',
//    text: 'did you just reg? click /validate?h={user.hash} to complete',
//    html: 'did you just reg? click /validate?h={user.hash} to complete'
//  }
//
//  // send mail with defined transport object
//  smtpTransport.sendMail(mailOptions, function (error, response) {
//    if (error) {
//      console.log(error);
//    } else {
//      console.log("Message sent: " + response.message);
//    }
//    // if you don't want to use this transport object anymore, uncomment following line
//    //smtpTransport.close(); // shut down the connection pool, no more messages
//  });
//};


Auth.prototype.send_validation_email = function (req, res) {
  console.log('/validate?h='+req.session.user.hash);
};


Auth.prototype.validate_email = function (req, res) {
  var q = {hash: req.params.h};
  this.User.findOne(q, function (err, user) {
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


Auth.prototype.logout = function (req, res) {
  req.session.destroy(function () {
    res.redirect('/login');
  });
};





//admin
// browse
Auth.prototype.users_get = function (req, res) {
  var User = this.User;
  var UserInfo = this.UserInfo;
  var conditions = utils.process_browse_filter(req.body.condition);
  User.count(conditions, function (err, count) {
    res.render('cms/browse', {
      title: 'Browse Users ',
      browser: UserInfo.browser,
      total: count
    });
  });
};


// browse (json): returns filters, ordered, offset results
Auth.prototype.users_post = function (req, res) {
  var User = this.User;
  var conditions = utils.process_browse_filter(req.body.condition);
  var fields = null;
  var options = {sort: req.body.order, skip: req.body.offset, limit: req.body.limit};
  User.count(conditions, function (err, count) {
    var q = User.find(conditions, fields, options);
    q.exec(function (err, r) {
      res.json({results: r, count: count});
    });
  });
};


// browse (json): get 'browser' info and our simplified schema info
Auth.prototype.users_schema = function (req, res) {
  res.json({schema: Meta.get_schema_info(this.UserInfo.schema), browser: this.UserInfo.browser});
};


Auth.prototype.get_user = function(id, complete) {
  if (id)
    this.User.findOne({_id: id}, complete);
  else
    complete();
}


// form: create/update
Auth.prototype.user_get = function (req, res) {
  var UserInfo = this.UserInfo;
  res.render('cms/form', {
    title: (req.object ? 'Editing' : 'Creating') + ' ' + req.type,
    id: req.id ? req.id : null,
    form: UserInfo});
};


// form (json): get the object, related objects as well as form meta info
Auth.prototype.user_get_json = function (req, res) {
  var UserInfo = this.UserInfo;
  this.get_user(req.params.id, function (err, user) {
    res.json({
      title: (user ? 'Editing' : 'Creating') + ' User',
      object: user,
      form: UserInfo.form_admin});
  });
};


// form (json): save
Auth.prototype.user_create = function (req, res) {
  var data = JSON.parse(req.body.val);
  this.get_user(req.params.id, function (err, user) {
    for (var p in data)
      user[p] = data[p];
    user.save(function (err, s) {
      res.json(user);
    });
  });
};


// form (json): delete
Auth.prototype.user_delete = function (req, res) {
  req.object.remove(function (err, m) {
    res.json(m);
  });
};













/// perms

exports.has_user = function(req, res, next)
{
    if (req.session.user && req.session.user.active) {
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
//
//exports.is_user = function(req, res, next)
//{
//    if (req.session.user == req.user) {
//        next();
//    } else {
//        req.session.error = 'Access denied!';
//        res.redirect('/login');
//    }
//}



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
  try {
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
  } catch (e) {
    fn(e);
  }
};