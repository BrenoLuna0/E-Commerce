const express = require('express');
const routes = express.Router();
const path = require('path');
const passport = require('passport');
require('./auth')(passport);

const ProdutoController = require('./controller/ProdutoController');
const CarrinhoController = require('./controller/CarrinhoController');

function authenticationMiddleware() {
    return function (req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/login')
    }
}


/*routes.get('/',(req,res)=>{
    res.render('front',{
        image : "https://a-static.mlcdn.com.br/618x463/cadeira-gamer-inclinavel-ate-150kg-preta-e-vermelha-tgc12-thunderx3/estrela10/167036/59b0aff3005282b8dde866e4fa4ff294.jpg"
    });
});*/
routes.get('/', authenticationMiddleware());
routes.get('/login', function (req, res, next) {
    if (req.query.fail) {
        res.render('login', { message: 'Usuário e/ou senha incorretos' });
    } else {
        res.render('login', { message: null });
    }
});
routes.post('/login', passport.authenticate('local', { successRedirect: '/main', failureRedirect: '/login?fail=true' }));
routes.get('/logout', authenticationMiddleware(), function(req,res,next){
    req.logout();
    res.redirect('/login');

});

routes.get('/main',authenticationMiddleware(), ProdutoController.show);
routes.get('/produto',authenticationMiddleware(), ProdutoController.paginate);
routes.get('/categorias/:catDescricao',authenticationMiddleware(), ProdutoController.getCategorias);
routes.get('/descricao',authenticationMiddleware(), ProdutoController.getByDescricao);
routes.get('/produto/:id',authenticationMiddleware(), ProdutoController.detail);
//routes.get('/produto', ProdutoController.show);

routes.get('/carrinho/', authenticationMiddleware(), CarrinhoController.showProducts);
routes.post('/carrinho/add', CarrinhoController.adicionarAoCarrinho);
routes.post('/carrinho/remove',authenticationMiddleware(), CarrinhoController.removerDoCarrinho);
routes.post('/carrinho/update',authenticationMiddleware(), CarrinhoController.atualizarCarrinho);
routes.get('/checkout',authenticationMiddleware(), CarrinhoController.checkout);



module.exports = routes;