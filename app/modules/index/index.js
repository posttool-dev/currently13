exports.index = function(req, res)
{
    res.render('index')
    console.log(process._user)
}