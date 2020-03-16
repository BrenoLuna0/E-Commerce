//Arquivo com as funções responsáveis por fazer o login e o logout do usuário

const Filial = require('../model/Filial');
const passport = require('passport');
require('../auth')(passport);

module.exports = {
    /**
     * Essa função possui o seguinte bug:
     * Quando o usuário faz o logout, e ele acessa a página anterior pelo botão do browser, a página anterior
     * é exibida através do cache do navegador.
     */
    async logout(req, res) {
        //Aqui ele pega todas as filiais antes de se deslogar para poder renderizar a página de login
        const filiais = await Filial.findAll();

        //Efutuação do logout
        req.logout();
        res.status(200).clearCookie('connect.sid', {
            path: '/login'
        });

        //A sessão é destruida e então é renderizada a página de login com as filiais já previamente carregadas
        req.session.destroy(function (err) {
            res.render('login/login', {
                filiais,
                reload: true
            })
        });
    },

    async login(req, res, next) {
        //Através do Passport, é feita a autenticação do usuário usando a estratégia local em -src/auth.js-
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