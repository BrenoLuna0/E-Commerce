const Produto = require('../model/Produto');
const Categoria = require('../model/Categoria');
const getCartTotal = require('../utils/getCartTotal');
const getFilialName = require('../utils/getFilialName');

module.exports = {

    
    //Esta função renderiza a página inicial de produtos no site 
    async show(req, res) {

        //São carregados 9 produtos aleatórios do banco de dados...
        const produtos = await Produto.find9(req.session.filial);
        
        //...Se houver algum erro de conexão com o banco, uma página de erro será mostrada...
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
        } 
        //...Senão a página principal é carregada normalmente
        else {
            res.render('front/front', {
                products: produtos,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: await getFilialName(req.session.filial)
            });
        }

    },

    //Esta função renderiza a página de exibição de todos os produtos, utilizando uma técnica de paginação
    async paginate(req, res) {

        //Se a categoria não for especificada na url, é atribuido o valor '%'

        //Os produtos vêm do banco de dados de acordo com o número da página referida na url
        const produtos = await Produto.findAll(req.query.page, '%', req.session.filial);
        
        //Se houver algum erro de conexão com o banco de dados, é renderizada uma página de erro...
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
        } 
        //...senão são pegos a quantidade de produtos total que vem dessa consulta e as categorias para a exibição na view
        //obs.: A quantidade de produtos é necessária para evitar erros na paginação
        else {
            const produtoQtd = await Produto.getProdutosQtd('%', req.session.filial,'');
            const categorias = await Categoria.categorias(req.session.filial);
            res.render('produtos/produtos', {
                products: produtos,
                page: req.query.page,
                categories: categorias,
                produtoQtd,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: await getFilialName(req.session.filial)
            });
        }
    },

    //Esta função renderiza a tela de produtos somente com os produtos específicos de uma determinada categoria
    async getCategorias(req, res) {

        //Os produtos vêm do banco de dados de acordo com o número da página e a descrição da categoria, ambos descritos na url
        //!!!!OBS.: Os comandos 'replace' que são aplicados na descrição da categoria são feitos para que o nome da categoria possa ser usado dentro do sql
        const produtos = await Produto.findAll(req.query.page, req.params.catDescricao.replace(/\+/g, ' ').replace(/@/g, '/'), req.session.filial);

        //Se ocorrer algum erro de conexão com o banco, uma página de erro será renderizada...
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
        } 
        //...Senão, a página de produtos é renderizada com as informações da quantidade total de produtos e as categorias
        else {
            const produtoQtd = await Produto.getProdutosQtd(req.params.catDescricao.replace(/\+/g, ' ').replace(/@/g, '/'), req.session.filial,'');
            const categorias = await Categoria.categorias(req.session.filial);

            res.render('produtos/produtos', {
                products: produtos,
                page: req.query.page,
                categories: categorias,
                produtoQtd,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: await getFilialName(req.session.filial)
            });
        }
    },


    //Esta função renderiza a tela de produtos somente com os produtos específicos de acordo com a descrição
    async getByDescricao(req, res) {

        //Caso a descrição não esteja disponível na url, utiliza-se uma string vazia
        const descricaoTmp = req.query.descricao || '';
        //As funções replace e toUpperCase nesse caso é para adequar a descrição do produto para a consulta sql 
        let descricao = descricaoTmp.replace(/-E-/g, '/').toUpperCase();
        //Caso a página não esteja disponível na url, utiliza-se o valor 1 como padrão
        let pagina = req.query.page || 1;
        
        //Os produtos então são armazenados na variável <produtos>
        const produtos = await Produto.findByDescricao(pagina, descricao, req.session.filial);

        //Se houver algum erro de conexão com o banco de dados, será renderizado uma página de erro...
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
        } 
        //...Senão, a página de produtos é renderizada com as informações da quantidade total de produtos e as categorias
        else {
            const produtoQtd = await Produto.getProdutosQtd('%', req.session.filial, descricao);
            const categorias = await Categoria.categorias(req.session.filial);


            res.render('produtos/produtos', {
                products: produtos,
                page: pagina,
                categories: categorias,
                produtoQtd,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: await getFilialName(req.session.filial)
            });
        }
    },

    //Esta função renderiza a página de especificações do produto
    async detail(req, res) {

        //O produto é carregado a partir do banco de dados, e salvo na variável <produto>
        let produto = await Produto.findById(req.params.id, req.session.filial);
        
        //Caso aconteça algum erro de conexão com o banco de dados, é renderizada uma página de erro...
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
        } 
        //...Senão, a página é renderizada normalmente
        else {
            let alert; //não sei mais pra que serve essa variável :(

            const produtosRelacionados = await Produto.produtosRelacionados([produto[0].PROD_CATEGORIA], req.session.filial);
            
            //Também não me lembro mais pra que serve isso, revisar depois.
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