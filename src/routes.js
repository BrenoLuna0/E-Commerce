const express = require('express');
const routes = express.Router();
const path = require('path');
const passport = require('passport');
require('./auth')(passport);

const ProdutoController = require('./controller/ProdutoController');
const CarrinhoController = require('./controller/CarrinhoController');
const VendaController = require('./controller/VendaController');
const FilialController = require('./controller/FilialController');
const ClienteController = require('./controller/ClienteController');

function authenticationMiddleware() {
    return function (req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/login')
    }
}

function authenticationMiddleware2() {
    return function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next()
        }
        res.redirect('/main')
    }
}



routes.get('/login', authenticationMiddleware2(), FilialController.show);

routes.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/login'); }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            req.session.filial = req.body.filial;
            return res.redirect('/main');
        });
    })(req, res, next);
});

routes.get('/logout', authenticationMiddleware(), function (req, res, next) {
    req.logout();
    res.status(200).clearCookie('connect.sid', {
        path: '/login'
    });
    req.session.destroy(function (err) {
        res.redirect('/login'); //Inside a callback… bulletproof!
    });

});
routes.get('/', authenticationMiddleware(), (req, res) => {
    res.redirect('/main');
});
routes.get('/main', authenticationMiddleware(), ProdutoController.show);
routes.get('/produto', authenticationMiddleware(), ProdutoController.paginate);
routes.get('/categorias/:catDescricao', authenticationMiddleware(), ProdutoController.getCategorias);
routes.get('/descricao', authenticationMiddleware(), ProdutoController.getByDescricao);
routes.get('/produto/:id', authenticationMiddleware(), ProdutoController.detail);

routes.get('/carrinho/', authenticationMiddleware(), CarrinhoController.showProducts);
routes.post('/carrinho/add', authenticationMiddleware(), CarrinhoController.adicionarAoCarrinho);
routes.delete('/carrinho/remove', authenticationMiddleware(), CarrinhoController.removerDoCarrinho);
routes.put('/carrinho/update', authenticationMiddleware(), CarrinhoController.atualizarCarrinho);

routes.get('/checkout', authenticationMiddleware(), CarrinhoController.checkout);
routes.post('/checkout', authenticationMiddleware(), CarrinhoController.isEmpty, VendaController.realizarDav, CarrinhoController.limparCarrinho);

routes.get('/historico', authenticationMiddleware(), VendaController.getHistorico);
routes.get('/historico/:id', authenticationMiddleware(), VendaController.getDavDetalhe);

routes.get('/alterarSenha', authenticationMiddleware(), ClienteController.carregarFormulario);
routes.post('/alterarSenha', authenticationMiddleware(), ClienteController.verificarUsuario);
routes.post('/modificarSenha', authenticationMiddleware(), ClienteController.alterarSenha);

//rota genérica;

routes.get('*', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('errors/manipuladorErro', {
            err: {
                tit: 'Página não Encontrada',
                msg: 'A página que você está tentando acessar não existe. Verifique se a URL está correta ou clique na Logo do site para ir para a página inicial',
                cod: 600
            },
            cartTotal: '',
            filial: ''
        });
    }
    res.redirect('/login')
});


module.exports = routes;