const Produto = require('../model/Produto');
const Categoria = require('../model/Categoria');
const getCartTotal = require('../utils/getCartTotal');

module.exports = {
    async show(req,res){
        const produtos = await Produto.find9();
        res.send(produtos);
        /*res.render('front/front', {
            products : produtos,
            cartTotal : await getCartTotal(req.user.id)
        });*/
    },

    async paginate(req,res){
        console.log(req.url);
        let categoria;
        if(req.query.cat){
            categoria = req.query.cat
        }else{
            categoria = '%';
        }
        const produtos = await Produto.findAll(req.query.page, categoria);
        const categorias = await Categoria.categorias();
        res.render('produtos/produtos', {
            products : produtos,
            page : req.query.page,
            categories : categorias,
            cartTotal : await getCartTotal(req.user.id)
        });
    },

    async getCategorias(req,res){
        const produtos = await Produto.findAll(req.query.page, req.params.catDescricao.replace(/-/g, ' '));
        const categorias = await Categoria.categorias(req.user.id);

        res.render('produtos/produtos',{
            products : produtos,
            page : req.query.page,
            categories : categorias,
            cartTotal : await getCartTotal(req.user.id)
        });
    },

    async getByDescricao(req,res){
        let descricao = req.query.descricao.replace(/-/g, ' ').toUpperCase();
        let pagina;
        if(!req.query.page){
            pagina = 1
        }else{
            pagina = req.query.page;
        }

        const produtos = await Produto.findByDescricao(pagina, descricao);
        const categorias = await Categoria.categorias();
        

        res.render('produtos/produtos', {
            products : produtos,
            page : pagina,
            categories : categorias,
            cartTotal : await getCartTotal(req.user.id)
        });
    },

    async detail(req,res){
        let produto = await Produto.findById(req.params.id);
        let alert;
        
        if(!produto.PROD_IMAG_DESCRICAO){
            produto.PROD_IMAG_DESCRICAO = 'Não há Descrição Para esse Produto'
        }
        const produtosRelacionados = await Produto.produtosRelacionados(produto[0].PROD_CATEGORIA);
        if(req.query.msg){
            alert = true;
        }else{
            alert = false;
        }
        res.render('produtoDetalhe/produtoDetalhe', {
            product : produto,
            produtosRelacionados : produtosRelacionados,
            alerta : alert,
            cartTotal : await getCartTotal(req.user.id)
        });
    }
}