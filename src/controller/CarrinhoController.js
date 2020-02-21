const Carrinho = require('../model/Carrinho');
const Categoria = require('../model/Categoria');
const getCartTotal = require('../utils/getCartTotal');
const Produto = require('../model/Produto');
const getFilialName = require('../utils/getFilialName');

module.exports = {
    async showProducts(req, res) {
        const produtosCarrinho = await Carrinho.getProdutos(req.user.id, req.session.filial);
        if (produtosCarrinho.erro) {

            res.render('errors/manipuladorErro', {
                err: {
                    tit: produtosCarrinho.tit,
                    msg: produtosCarrinho.msg,
                    cod: produtosCarrinho.cod
                },
                cartTotal: '',
                filial: ''
            });

        } else if (!produtosCarrinho) {
            res.render('carrinhoVazio/carrinhoVazio', {
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: await getFilialName(req.session.filial)
            });
        } else {
            const produtosFinais = await Carrinho.getProdutosDetalhe(produtosCarrinho, req.session.filial);
            const categoriasRelacionadas = produtosFinais.map(function (produto) {
                return produto.categoria;
            });
            const produtosRelacionados = await Produto.produtosRelacionados(categoriasRelacionadas, req.session.filial);
            res.render('carrinho/carrinho', {
                produtos: produtosFinais,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                produtosRelacionados: produtosRelacionados,
                filial: await getFilialName(req.session.filial)
            });
        }

    },

    async adicionarAoCarrinho(req, res) {
        const result = await Carrinho.adicionarNoCarrinho(req.user.id, req.body.produto, req.body.qtd, req.session.filial);

        res.send(result);

    },

    async removerDoCarrinho(req, res) {
        const result = await Carrinho.removerDoCarrinho(req.user.id, req.body.produto, req.session.filial);
        console.log('remove');
        if (result) {
            res.send(true);
        } else {
            res.send(false)
        }
    },

    async atualizarCarrinho(req, res) {
        const result = await Carrinho.atualizarQuantidade(req.user.id, req.body.produto, req.body.qtd, req.session.filial);

        if (result) {
            res.send(true);
        } else {
            res.send(false)
        }

    },

    async checkout(req, res) {
        const produtosCarrinho = await Carrinho.getProdutos(req.user.id, req.session.filial);

        if (produtosCarrinho.erro) {
            res.render('errors/manipuladorErro', {
                err: {
                    tit: produtosCarrinho.tit,
                    msg: produtosCarrinho.msg,
                    cod: produtosCarrinho.cod
                },
                cartTotal: '',
                filial: ''
            });

        } else if (!produtosCarrinho) {
            res.render('carrinhoVazio/carrinhoVazio', {
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: await getFilialName(req.session.filial)
            });
        } else {
            const produtosFinais = await Carrinho.getProdutosDetalhe(produtosCarrinho, req.session.filial);
            res.render('checkout/checkout', {
                produtos: produtosFinais,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: await getFilialName(req.session.filial)
            });
        }

    },

    async limparCarrinho(req, res) {
        const result = await Carrinho.limparCarrinho(req.user.id, req.session.filial);
        if (result) {
            res.render('confirmacao/confirmacao', {
                nDav: res.locals.nDAV,
                formPagt: res.locals.formPagt,
                data: res.locals.data,
                cartTotal: '',
                total: res.locals.total,
                filial: await getFilialName(req.session.filial)
            });
        } else {
            res.render('errors/manipuladorErro', {
                err: {
                    tit: 'Erro no Processamento da Compra',
                    msg: 'Erro no final do processo da compra. Verifique se esta compra está disponível em seu histórico. Caso não esteja, entre em contato conosco',
                    cod: '003'
                },
                cartTotal: '',
                filial: ''
            });
        }

    },

    async isEmpty(req, res, next) {
        const total = await getCartTotal(req.user.id, req.session.filial);
        if (total != '') {
            return next();
        } else if (total.erro) {
            res.render('errors/manipuladorErro', {
                err: {
                    tit: total.tit,
                    msg: total.msg,
                    cod: total.cod
                },
                cartTotal: '',
                filial: ''
            });
        } else {
            return res.redirect('/main');
        }

    }

}