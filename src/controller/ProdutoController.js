const Produto = require('../model/Produto');
const Categoria = require('../model/Categoria');
const getCartTotal = require('../utils/getCartTotal');

module.exports = {
    async show(req, res) {
        console.log(req.session.filial);
        const produtos = await Produto.find9(req.session.filial);
        res.render('front/front', {
            products : produtos,
            cartTotal :  await getCartTotal(req.user.id, req.session.filial)
        });
    },

    async paginate(req, res) {
        let categoria;
        if (req.query.cat) {
            categoria = req.query.cat
        } else {
            categoria = '%';
        }
        const produtos = await Produto.findAll(req.query.page, categoria, req.session.filial);
        const categorias = await Categoria.categorias(req.session.filial);
        res.render('produtos/produtos', {
            products: produtos,
            page: req.query.page,
            categories: categorias,
            cartTotal: await getCartTotal(req.user.id, req.session.filial)
        });
    },

    async getCategorias(req, res) {
        const produtos = await Produto.findAll(req.query.page, req.params.catDescricao.replace(/-/g, ' '), req.session.filial);
        const categorias = await Categoria.categorias(req.session.filial);

        res.render('produtos/produtos', {
            products: produtos,
            page: req.query.page,
            categories: categorias,
            cartTotal: await getCartTotal(req.user.id, req.session.filial)
        });
    },

    async getByDescricao(req, res) {
        let descricao = req.query.descricao.replace(/-/g, ' ').toUpperCase();
        let pagina;
        if (!req.query.page) {
            pagina = 1
        } else {
            pagina = req.query.page;
        }

        const produtos = await Produto.findByDescricao(pagina, descricao, req.session.filial);
        const categorias = await Categoria.categorias(req.session.filial);


        res.render('produtos/produtos', {
            products: produtos,
            page: pagina,
            categories: categorias,
            cartTotal: await getCartTotal(req.user.id, req.session.filial)
        });
    },

    async detail(req, res) {
        let produto = await Produto.findById(req.params.id, req.session.filial);
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
            cartTotal: await getCartTotal(req.user.id, req.session.filial)
        });
    }
}