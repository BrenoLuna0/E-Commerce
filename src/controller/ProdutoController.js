const Produto = require('../model/Produto');
const Categoria = require('../model/Categoria');

module.exports = {
    async show(req,res){
        const produtos = await Produto.find9();
        res.render('front', {
            products : produtos
        });
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
        res.render('produtos', {
            products : produtos,
            page : req.query.page,
            categories : categorias
        });
    },

    async getCategorias(req,res){
        const produtos = await Produto.findAll(req.query.page, req.params.catDescricao.replace(/-/g, ' '));
        const categorias = await Categoria.categorias();

        res.render('produtos',{
            products : produtos,
            page : req.query.page,
            categories : categorias
        });
    },

    async getByDescricao(req,res){
        let descricao = req.query.descricao.replace(/-/g, ' ').toUpperCase();
        let pagina;
        const produtos = await Produto.findByDescricao(req.query.page, descricao);
        const categorias = await Categoria.categorias();
        if(!req.query.page){
            pagina = 1
        }else{
            pagina = req.query.page;
        }

        res.render('produtos', {
            products : produtos,
            page : pagina,
            categories : categorias
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
        res.render('produtoDetalhe', {
            product : produto,
            produtosRelacionados : produtosRelacionados,
            alerta : alert
        });
    }
}