var hash = require('./pass').hash
    , users = require('../user');


exports.on_login = '.';

exports.login =
{
    get: function(req, res)
    {
        res.render('auth/login', {});
    },

    post: function(req, res)
    {
        var q = {email: req.body.email, password: req.body.password};
        users.model.findOne(q, function(err, user) {
            req.session.message = user ? 'user found!' : 'no way';
            req.session.user = user;
            res.redirect(req.query.next || exports.on_login);
        });
    }
}

/*

            // Regenerate session when signing in
            // to prevent fixation
            req.session.regenerate(function(){
                // Store the user's primary key
                // in the session store to be retrieved,
                // or in this case the entire user object
                req.session.user = user;
                req.session.success = 'Authenticated as ' + user.name
                    + ' click to <a href="/logout">logout</a>. '
                    + ' You may now access <a href="/restricted">/restricted</a>.';
                res.redirect('back');
            });



 */

exports.register =
{
    get: function(req, res)
    {
        res.render('auth/register');
    },

    post: function(req, res)
    {
        var q = {email: req.body.email};
        users.model.findOne(q, function(err, user) {
            if (user)  {
                req.session.message = 'User with email already exists';
                res.redirect('.');
                return;
            }
            user = new users.model();
            user.name = req.body.username;
            user.email = req.body.email;
            user.password = req.body.password;
            user.save(function(err, user) {
                req.session.message = err ? 'uhoh '+err : 'you registered!';
                req.session.user = user;
                res.redirect('.');
            });
        });
    }
}


exports.logout = function(req, res)
{
    req.session.destroy(function(){
        res.redirect('/');
    });
}
