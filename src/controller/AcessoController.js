const Filial = require('../model/Filial');
const passport = require('passport');
require('../auth')(passport);

module.exports = {
    async logout(req, res) {
        const filiais = await Filial.findAll();
        req.logout();
        res.status(200).clearCookie('connect.sid', {
            path: '/login'
        });
        req.session.destroy(function (err) {
            res.render('login/login', {
                filiais,
                reload: true
            })
        });
    },

    async login(req, res, next) {
        passport.authenticate('local', function (err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.redirect('/login'); }
            req.logIn(user, function (err) {
                if (err) { return next(err); }
                req.session.filial = req.body.filial;
                return res.redirect('/main');
            });
        })(req, res, next);
    }
}