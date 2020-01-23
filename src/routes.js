const express = require('express');
const routes = express.Router();
const path = require('path');
const passport = require('passport');
require('./auth')(passport);

const ProdutoController = require('./controller/ProdutoController');
const CarrinhoController = require('./controller/CarrinhoController');
const VendaController = require('./controller/VendaController');

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



routes.get('/login', function (req, res, next) {
    if (req.query.fail) {
        res.render('login/login', { message: 'Usuário e/ou senha incorretos' });
    } else {
        res.render('login/login', { message: null });
    }
});
routes.post('/login', passport.authenticate('local', { successRedirect: '/main', failureRedirect: '/login?fail=true' }));
routes.get('/logout', authenticationMiddleware(), function(req,res,next){
    req.logout();
    res.redirect('/login');

});
routes.get('/', authenticationMiddleware(), (req,res)=>{
    res.redirect('/main');
});
routes.get('/main', ProdutoController.show);
routes.get('/produto',authenticationMiddleware(), ProdutoController.paginate);
routes.get('/categorias/:catDescricao',authenticationMiddleware(), ProdutoController.getCategorias);
routes.get('/descricao',authenticationMiddleware(), ProdutoController.getByDescricao);
routes.get('/produto/:id',authenticationMiddleware(), ProdutoController.detail);
//routes.get('/produto', ProdutoController.show);

routes.get('/carrinho/', authenticationMiddleware(), CarrinhoController.showProducts);
routes.post('/carrinho/add', CarrinhoController.adicionarAoCarrinho);
routes.delete('/carrinho/remove',authenticationMiddleware(), CarrinhoController.removerDoCarrinho);
routes.put('/carrinho/update', CarrinhoController.atualizarCarrinho);

routes.get('/checkout',authenticationMiddleware(), CarrinhoController.checkout);
routes.post('/checkout', authenticationMiddleware(), VendaController.realizarDav, CarrinhoController.limparCarrinho);

routes.get('/confirmacao',authenticationMiddleware(), VendaController.confirmarVenda);


module.exports = routes;