const Produto = require('../model/Produto');
const Categoria = require('../model/Categoria');
const getCartTotal = require('../utils/getCartTotal');
const getFilialName = require('../utils/getFilialName');

module.exports = {
    async show(req, res) {
        const produtos = await Produto.find9(req.session.filial);
        if (produtos.erro) {
            res.render('errors/manipuladorErro', {
                err: {
                    tit: produtos.tit,
                    msg: produtos.msg,
                    cod: produtos.cod
                },
                cartTotal: '',
                filial: ''
            });
        } else {
            res.render('front/front', {
                products: produtos,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: await getFilialName(req.session.filial)
            });
        }

    },

    async paginate(req, res) {
        let categoria = req.query.cat || '%';
        /*if (req.query.cat) {
            categoria = req.query.cat
        } else {
            categoria = '%';
        }*/
        const produtos = await Produto.findAll(req.query.page, categoria, req.session.filial);
        if (produtos.erro) {
            res.render('errors/manipuladorErro', {
                err: {
                    tit: produtos.tit,
                    msg: produtos.msg,
                    cod: produtos.cod
                },
                cartTotal: '',
                filial: ''
            });
        } else {
            const categorias = await Categoria.categorias(req.session.filial);
            res.render('produtos/produtos', {
                products: produtos,
                page: req.query.page,
                categories: categorias,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: await getFilialName(req.session.filial)
            });
        }
    },

    async getCategorias(req, res) {
        const produtos = await Produto.findAll(req.query.page, req.params.catDescricao.replace(/\+/g, ' ').replace(/@/g, '/'), req.session.filial);

        if (produtos.erro) {
            res.render('errors/manipuladorErro', {
                err: {
                    tit: produtos.tit,
                    msg: produtos.msg,
                    cod: produtos.cod
                },
                cartTotal: '',
                filial: ''
            });
        } else {
            const categorias = await Categoria.categorias(req.session.filial);

            res.render('produtos/produtos', {
                products: produtos,
                page: req.query.page,
                categories: categorias,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: await getFilialName(req.session.filial)
            });
        }
    },

    async getByDescricao(req, res) {
        const descricaoTmp = req.query.descricao || '';
        let descricao = descricaoTmp.replace(/-E-/g, '/').toUpperCase();
        let pagina = req.query.page || 1;
        /*if (!req.query.page) {
            pagina = 1
        } else {
            pagina = req.query.page;
        }*/

        const produtos = await Produto.findByDescricao(pagina, descricao, req.session.filial);

        if (produtos.erro) {
            res.render('errors/manipuladorErro', {
                err: {
                    tit: produtos.tit,
                    msg: produtos.msg,
                    cod: produtos.cod
                },
                cartTotal: '',
                filial: ''
            });
        } else {
            const categorias = await Categoria.categorias(req.session.filial);


            res.render('produtos/produtos', {
                products: produtos,
                page: pagina,
                categories: categorias,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: await getFilialName(req.session.filial)
            });
        }
    },

    async detail(req, res) {
        let produto = await Produto.findById(req.params.id, req.session.filial);
        if (produto.erro) {
            res.render('errors/manipuladorErro', {
                err: {
                    tit: produto.tit,
                    msg: produto.msg,
                    cod: produto.cod
                },
                cartTotal: '',
                filial: ''
            });
        } else {
            let alert;

            if (!produto.PROD_IMAG_DESCRICAO) {
                produto.PROD_IMAG_DESCRICAO = 'Não há Descrição Para esse Produto'
            }
            const produtosRelacionados = await Produto.produtosRelacionados([produto[0].PROD_CATEGORIA], req.session.filial);
            if (req.query.msg) {
                alert = true;
            } else {
                alert = false;
            }
            res.render('produtoDetalhe/produtoDetalhe', {
                product: produto,
                produtosRelacionados: produtosRelacionados,
                alerta: alert,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: await getFilialName(req.session.filial)
            });
        }

    }
}