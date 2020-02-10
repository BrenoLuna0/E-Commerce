const Carrinho = require('../model/Carrinho');
const Categoria = require('../model/Categoria');
const getCartTotal = require('../utils/getCartTotal');
const Produto = require('../model/Produto');
const getFilialName = require('../utils/getFilialName');

module.exports = {
    async showProducts(req, res) {
        const categorias = await Categoria.categorias(req.session.filial);
        const produtosCarrinho = await Carrinho.getProdutos(req.user.id, req.session.filial);
        if (!produtosCarrinho) {
            res.render('carrinhoVazio/carrinhoVazio', {
                categories: categorias,
                cartTotal : await getCartTotal(req.user.id, req.session.filial),
                filial :  await getFilialName(req.session.filial)
            });
        } else {
            const produtosFinais = await Carrinho.getProdutosDetalhe(produtosCarrinho,req.session.filial);
            const categoriasRelacionadas = produtosFinais.map(function(produto){
                return produto.categoria;
            });
            const produtosRelacionados = await Produto.produtosRelacionados(categoriasRelacionadas, req.session.filial);
            res.render('carrinho/carrinho', {
                produtos: produtosFinais,
                categories: categorias,
                cartTotal : await getCartTotal(req.user.id, req.session.filial),
                produtosRelacionados : produtosRelacionados,
                filial :  await getFilialName(req.session.filial)
            });
        }

    },

    async adicionarAoCarrinho(req, res) {
        const result = await Carrinho.adicionarNoCarrinho(req.user.id, req.body.produto, req.body.qtd, req.session.filial);

        if(req.body.dif){
            res.send(result);
        }else{
            res.redirect('/produto/' + req.body.produto +'?msg=true');
        }
        

    },

    async removerDoCarrinho(req,res){
        const result = await Carrinho.removerDoCarrinho(req.user.id, req.body.produto, req.session.filial);
        console.log('remove');
        if(result){
            res.send(true);
        }else{
            res.send(false)
        }
    },

    async atualizarCarrinho(req,res){
        const result = await Carrinho.atualizarQuantidade(1, req.body.produto, req.body.qtd, req.session.filial);

        if(result){
            res.send(true);
        }else{
            res.redirect(false)
        }

    },

    async checkout(req, res) {
        const categorias = await Categoria.categorias(req.session.filial);
        const produtosCarrinho = await Carrinho.getProdutos(req.user.id, req.session.filial);
        if (!produtosCarrinho) {
            res.render('carrinhoVazio/carrinhoVazio', {
                categories: categorias,
                cartTotal : await getCartTotal(req.user.id, req.session.filial),
                filial :  await getFilialName(req.session.filial)
            });
        } else {
            const produtosFinais = await Carrinho.getProdutosDetalhe(produtosCarrinho,req.session.filial);
            res.render('checkout/checkout', {
                produtos: produtosFinais,
                categories: categorias,
                cartTotal : await getCartTotal(req.user.id, req.session.filial),
                filial :  await getFilialName(req.session.filial)
            });
        }

    },

    async limparCarrinho(req,res){
        const result = await Carrinho.limparCarrinho(req.user.id, req.session.filial);
        if(result){
            res.render('confirmacao/confirmacao', {
                nDav : res.locals.nDAV,
                formPagt : res.locals.formPagt,
                data : res.locals.data,
                cartTotal : '',
                total : res.locals.total,
                filial :  await getFilialName(req.session.filial)
            });
        }else{
            res.render('confirmacao/confirmacao', {
                nDav : res.locals.nDAV,
                formPagt : res.locals.formPagt,
                data : res.locals.data,
                cartTotal : '',
                total : res.locals.total,
                filial :  await getFilialName(req.session.filial)
            });
        }

    },

    async isEmpty(req,res, next){
        const total = await getCartTotal(req.user.id, req.session.filial);
        if(total != ''){
            return next();
        }else{
            return res.redirect('/main');
        }

    }

}