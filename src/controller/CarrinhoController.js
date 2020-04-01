/**
 * Aqui estão todas as funções de controle de requisição sobre o carrinho
 */

const Carrinho = require('../model/Carrinho');
const getCartTotal = require('../utils/getCartTotal');
const Produto = require('../model/Produto'); //Este require é necessário para pegar os produtos relacionados aos que estão no carrinho
const Vendedor = require('../model/Vendedor'); 

module.exports = {

    /**
     * Função responsável por renderizar a página do carrinho com seus respectivos produtos
     * Caso nenhum produto esteja no carrinho, ela renderizará a página "Carrinho Vazio"
     */
    async showProducts(req, res) {

        //É feita a requisição dos produtos que estão no carrinho...
        const produtosCarrinho = await Carrinho.getProdutos(req.user.id, req.session.filial);
        
        //...Caso dê algum problema com a conexão com o banco de dados, uma página de erro será renderizada...
        if (produtosCarrinho.erro) {

            res.render('errors/manipuladorErro', {
                err: {
                    tit: produtosCarrinho.tit,
                    msg: produtosCarrinho.msg,
                    cod: produtosCarrinho.cod
                },
                cartTotal: '',
                filial: req.session.filialName
            });

        } 
        //...Caso não haja nenhum produto no carrinho, será renderizado a página "Carrinho Vazio"...
        else if (!produtosCarrinho) {
            res.render('carrinhoVazio/carrinhoVazio', {
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: req.session.filialName
            });
        } 
        //...Caso dê tudo certo, serão feitos alguns procedimentos:
        else {
            //Será carregado as informações adicionais dos produtos como preço e imagem para exibição na página
            const produtosFinais = await Carrinho.getProdutosDetalhe(produtosCarrinho, req.session.filial);

            //Aqui é requerido as categorias dos produtos presentes no carrinho...
            const categoriasRelacionadas = produtosFinais.map(function (produto) {
                return produto.categoria;
            });

            //...para então pegar 6 produtos relacionados com as categorias dos produtos no carrinho
            const produtosRelacionados = await Produto.produtosRelacionados(categoriasRelacionadas, req.session.filial);
            
            //Então é feita a renderização da página
            res.render('carrinho/carrinho', {
                produtos: produtosFinais,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                produtosRelacionados: produtosRelacionados,
                filial: req.session.filialName
            });
        }

    },

    //Função responsável por adicionar um produto no carrinho
    async adicionarAoCarrinho(req, res) {
        /**
         * Aqui é feita a inserção do produto no carrinho, com seguintes parâmetros:
         * Código do Usuário, Código do Produto, quantidade a ser adicionada, e a filial logada.
         * Esta função retornará -true- em caso de sucesso, e -false- em caso de falha. Este valor está guardado dentro da variável <result>
         */
        const result = await Carrinho.adicionarNoCarrinho(req.user.id, req.body.produto, req.body.qtd, req.session.filial);
        
        //Caso a operação retorne -true-, será retornado para a view o novo valor total do carrinho para ser atualizado
        if(result){
            const cartTotal = await getCartTotal(req.user.id, req.session.filial);
            res.send(cartTotal);
        }

        //Caso a operação retorne -false-, será retornado para a view esse valor -false-, onde ela exibirá um alerta, dizendo que não foi possível concluir a operação
        else {
            res.send(result);
        }

    },

    //Função responsável por remover os produtos do carrinho, similar ao de inserção
    async removerDoCarrinho(req, res) {

        /**
         * Aqui é feita a remoção do produto no carrinho, com seguintes parâmetros:
         * Código do Usuário, Código do Produto e a filial logada.
         * Esta função retornará -true- em caso de sucesso, e -false- em caso de falha. Este valor está guardado dentro da variável <result>
         * 
         * Estes respectivos valores (-true- e -false-) são retornados para a view
         */
        const result = await Carrinho.removerDoCarrinho(req.user.id, req.body.produto, req.session.filial);
        if (result) {
            res.send(true);
        } else {
            res.send(false)
        }
    },

    //Função responsável por atualizar a quantidade de um respectivo produto no carrinho
    async atualizarCarrinho(req, res) {

        /**
         * Aqui é feita a atualização do produto no carrinho, com seguintes parâmetros:
         * Código do Usuário, Código do Produto, nova quantidade e a filial logada.
         * Esta função retornará -true- em caso de sucesso, e -false- em caso de falha. Este valor está guardado dentro da variável <result>
         * 
         * Estes respectivos valores (-true- e -false-) são retornados para a view
         */
        const result = await Carrinho.atualizarQuantidade(req.user.id, req.body.produto, req.body.qtd, req.session.filial);

        if (result) {
            res.send(true);
        } else {
            res.send(false)
        }

    },


    //Função responsável por renderização da página de "Checkout" (Confirmação da compra)
    async checkout(req, res) {

        //Aqui é carregado os produtos do carrinho...
        const produtosCarrinho = await Carrinho.getProdutos(req.user.id, req.session.filial);

        //...Caso dê algum erro relacionado a conexão com o banco de dados, é renderizada uma página de erro...
        if (produtosCarrinho.erro) {
            res.render('errors/manipuladorErro', {
                err: {
                    tit: produtosCarrinho.tit,
                    msg: produtosCarrinho.msg,
                    cod: produtosCarrinho.cod
                },
                cartTotal: '',
                filial: req.session.filialName
            });

        } 
        //..Caso o usuário tente acessar a página de checkout diretamente pela url com o carrinho vazio, a página "Carrinho vazio será renderizada"
        else if (!produtosCarrinho) {
            res.render('carrinhoVazio/carrinhoVazio', {
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: req.session.filialName
            });
        } 
        //...Caso dê tudo certo:
        else {

            //É feita a requisição do detalhamento dos produtos do carrinho...
            const produtosFinais = await Carrinho.getProdutosDetalhe(produtosCarrinho, req.session.filial);
            
            //E logo em seguida é renderizada a página de checkout
            res.render('checkout/checkout', {
                produtos: produtosFinais,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: req.session.filialName
            });
        }

    },

    //Função responsável por limpar o carrinho após o processo da compra ser finalizado com sucesso
    async limparCarrinho(req, res) {

        /**
         * É chamada a função que esvaziará o carrinho daquele usuário na filial que ele está logado
         * Esta função retornará -true- em caso de sucesso e -false- em caso de falha. Este valor está guardado dentro da variável <result>
         */
        const result = await Carrinho.limparCarrinho(req.user.id, req.session.filial);
        
        //Em caso de sucesso, é renderizada a página de confirmação da compra, com todas as informações
        if (result) {
            const vendedores = await Vendedor.getVendedores(req.session.filial);
            res.render('confirmacao/confirmacao', {
                nDav: res.locals.nDAV,
                formPagt: res.locals.formPagt,
                data: res.locals.data,
                cartTotal: '',
                total: res.locals.total,
                vendedores,
                filial: req.session.filialName
            });
        } 
        //Em caso de falha, é renderizada a página de erro, porém a compra foi concluída com sucesso. Só o carrinho que não foi esvaziado
        else {
            res.render('errors/manipuladorErro', {
                err: {
                    tit: 'Erro no Processamento da Compra',
                    msg: 'Erro no final do processo da compra. Verifique se esta compra está disponível em seu histórico. Caso não esteja, entre em contato conosco',
                    cod: '003'
                },
                cartTotal: '',
                filial: req.session.filialName
            });
        }

    },

    //Função de checagem, para verificar se o carrinho está vazio
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
                filial: req.session.filialName
            });
        } else {
            return res.redirect('/main');
        }

    }

}