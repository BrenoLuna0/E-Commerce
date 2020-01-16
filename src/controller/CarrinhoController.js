const Carrinho = require('../model/Carrinho');
const Categoria = require('../model/Categoria');
const getCartTotal = require('../utils/getCartTotal');

module.exports = {
    async showProducts(req, res) {
        const categorias = await Categoria.categorias();
        const produtosCarrinho = await Carrinho.getProdutos(req.user.id);
        if (!produtosCarrinho) {
            res.render('carrinhoVazio', {
                categories: categorias,
                cartTotal : await getCartTotal(req.user.id)
            });
        } else {
            const produtosFinais = await Carrinho.getProdutosDetalhe(produtosCarrinho);
            res.render('carrinho', {
                produtos: produtosFinais,
                categories: categorias,
                cartTotal : await getCartTotal(req.user.id)
            });
        }

    },

    async adicionarAoCarrinho(req, res) {
        const result = await Carrinho.adicionarNoCarrinho(req.user.id, req.body.produto, req.body.qtd);

        if(req.body.dif){
            res.send(result);
        }else{
            res.redirect('/produto/' + req.body.produto +'?msg=true');
        }
        

    },

    async removerDoCarrinho(req,res){
        const result = await Carrinho.removerDoCarrinho(req.user.id, req.body.produto);

        if(result){
            res.redirect('/carrinho');
        }else{
            res.redirect('/carrinho')
        }
    },

    async atualizarCarrinho(req,res){
        const result = await Carrinho.atualizarQuantidade(req.user.id, req.body.produto, req.body.qtd);

        if(result){
            res.redirect('/carrinho');
        }else{
            res.redirect('/carrinho')
        }

    },

    async checkout(req, res) {
        const categorias = await Categoria.categorias();
        const produtosCarrinho = await Carrinho.getProdutos(req.user.id);
        if (!produtosCarrinho) {
            res.render('carrinhoVazio', {
                categories: categorias,
                cartTotal : await getCartTotal(req.user.id)
            });
        } else {
            const produtosFinais = await Carrinho.getProdutosDetalhe(produtosCarrinho);
            res.render('checkout', {
                produtos: produtosFinais,
                categories: categorias,
                cartTotal : await getCartTotal(req.user.id)
            });
        }

    },

    async limparCarrinho(req,res){
        const result = await Carrinho.limparCarrinho(req.user.id);
        if(result){
            res.redirect('/confirmacao');
        }else{
            res.redirect('/confirmacao');
        }

    },

}