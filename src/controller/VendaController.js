/**
 * Neste Arquivo, é realizado todas as transações que envolvem as vendas
 */

const Venda = require('../model/Venda');
const Carrinho = require('../model/Carrinho');
const getCartTotal = require('../utils/getCartTotal');
const mandarEmail = require('../utils/mandarEmail');

module.exports = {

    /**
     * Esta é a função principal. Como são três tabelas diferentes em relação a venda são realizados 3 ações diferentes:
     * 1) Inserção da Venda (Dav)
     * 2) Inserção dos produtos da compra (DavItens)
     * 3) Inserção da forma de pagamento (DavFormPagt)
     */
    async realizarDav(req, res, next) {

        //Primeiramente pegamos o nosso objeto da requisição post, e em seguida é feito um tratamento (já que ele vem em forma de string)        
        //No final de tudo, temos o <arrayObject> contendo os nossos produtos
        /*let obj = JSON.parse(req.body.objProduto)
        let arr = obj.replace('[[', '').replace(']]', '').split('],[').map(substring => substring.split(','));
        const arrayObject = arr.map(function (produto) {
            return {
                codigo: produto[0],
                nome: produto[1],
                preco: produto[2],
                qtd: produto[3],
                subtotal: produto[4]
            }
        });*/

        //É gerado um código para a compra e armazenado na variável <nDAV>
        const nDAV = await Venda.getNDav(req.session.filial);

        //Pegamos os produtos do Carrinho
        const produtostmp = await Carrinho.getProdutos(req.user.id, req.session.filial);
        const produtosFinais = await Carrinho.getProdutosSemImagem(produtostmp, req.session.filial);

        //Inserimos a informação da venda na tabela de DAV (1). É retornado um valor -true- ou -false- de acordo com o resultado da operação
        const confirmacaoDav = await Venda.inserirDAV(nDAV, req.user.id, parseFloat(req.body.total.replace('R$', '').replace('.','').replace(',','.')), '07.626.6970002-30', req.body.intervalo || '', req.session.filial);

        //Inserimos os produtos da venda na tabela DavItens (2). É retornado um valor -true- ou -false- de acordo com o resultado da operação
        const confirmacaoDavItens = await Venda.inserirDAVItens(nDAV, produtosFinais, req.session.filial);

        //Inserimos a forma de pagamento (3). É retornado um valor -true- ou -false- de acordo com o resultado da operação
        const confirmacaoDaVFormPagt = await Venda.inserirDAVFormaDePagamento(nDAV, req.body.formPagt, req.body.parcelas || 1, parseFloat(req.body.total.replace('R$', '').replace('.','').replace(',','.')), req.session.filial);

        //Se, e somente se, todas essas operações retornarem -true-...
        if (confirmacaoDav && confirmacaoDavItens && confirmacaoDaVFormPagt) {

            //...Informações como código do dav, data, e total são armazenados nas variáveis da sessão, e é passado então para a próxima etapa da venda
            res.locals.nDAV = nDAV;
            //req.body.formPagt == 11 ? res.locals.formPagt = 'Dinheiro' : res.locals.formPagt = 'Duplicata';
            res.locals.formPagt = req.body.formPagtNome;
            let date = new Date();
            let mes = date.getMonth() + 1;
            let dia = date.getDate();
            res.locals.data = `${dia > 9 ? "" + dia : "0" + dia}/${mes > 9 ? "" + mes : "0" + mes}/${date.getUTCFullYear()}`;
            res.locals.total = await getCartTotal(req.user.id, req.session.filial);

            return next();
        }
        //...Senão, todas as operações de realizar a venda (1), (2) e (3) são revertidas. Se houver algum erro nessa reversão, teremos uma transação presa. Caso contrário, será renderizada uma tela de erro
        else {
            const reverterDav = Venda.deletarDav(nDAV, req.session.filial);
            const reverterDavItens = Venda.deletarDavItens(nDAV, req.session.filial);
            const reverterDavFormaPagt = Venda.deletarDavFormaPagt(nDAV, req.session.filial);
            if (reverterDav.erro) {
                res.render('errors/manipuladorErro', {
                    err: {
                        tit: reverterDav.tit,
                        msg: reverterDav.msg,
                        cod: reverterDav.cod
                    },
                    cartTotal: '',
                    filial: req.session.filialName
                })
            } else if (reverterDavItens.erro) {
                res.render('errors/manipuladorErro', {
                    err: {
                        tit: reverterDavItens.tit,
                        msg: reverterDavItens.msg,
                        cod: reverterDavItens.cod
                    },
                    cartTotal: '',
                    filial: req.session.filialName
                })
            } else if (reverterDavFormaPagt.erro) {
                res.render('errors/manipuladorErro', {
                    err: {
                        tit: reverterDavFormaPagt.tit,
                        msg: reverterDavFormaPagt.msg,
                        cod: reverterDavFormaPagt.cod
                    },
                    cartTotal: '',
                    filial: req.session.filialName
                })

            } else {
                res.render('errors/manipuladorErro', {
                    err: {
                        tit: 'Erro na Compra',
                        msg: 'Erro Oracle no Processamento da sua Compra. Entre em contato conosco para solucionar esse caso',
                        cod: 700
                    },
                    cartTotal: '',
                    filial: req.session.filialName
                })
            }
        }


    },

    //Função que renderiza a página de confirmação da venda
    async confirmarVenda(req, res) {
        res.render('confirmacao/confirmacao', {
            cartTotal: await getCartTotal(req.user.id, req.session.filial),
            filial: req.session.filialName
        });
    },

    //Esta função rendereiza a página de histórico das compras do usuário logado de acordo com a filial que ele está logado
    async getHistorico(req, res) {

        //As vendas são carregadas de acordo com o usuário logado e a sessão e armazenadas na variável <vendas>
        const vendas = await Venda.getVendas(req.user.id, req.session.filial);

        //Se houver algum erro na conexão com o banco de dados, é renderizda uma página de erro
        if (vendas.erro) {
            res.render('errors/manipuladorErro', {
                err: {
                    tit: vendas.tit,
                    msg: vendas.msg,
                    cod: vendas.cod
                },
                cartTotal: '',
                filial: req.session.filialName
            });
        }
        //Senão, a página de histórico é carregada normalmente
        else {
            res.render('historico/historico', {
                vendas: vendas,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: req.session.filialName
            })
        }


    },

    //Esta função rendereiza na tela o detalamento de um dav específico
    async getDavDetalhe(req, res) {

        //O detalhamento do Dav é armazenado na variável <dav>
        const dav = await Venda.getVendaById(req.params.id, req.session.filial, req.user.id);

        //Se houver algum erro na conexão com o banco de dados, uma página de erro é renderizada
        if (dav.erro) {
            res.render('errors/manipuladorErro', {
                err: {
                    tit: dav.tit,
                    msg: dav.msg,
                    cod: dav.cod
                },
                cartTotal: '',
                filial: req.session.filialName
            })
        }
        //Senão, renderiza a tela de detalhamento de dav normalmente
        else {
            const produtos = await Venda.getVendaItens(req.params.id, req.session.filial);

            res.render('vendaDetalhe/vendaDetalhe', {
                nDav: dav.nDav,
                data: dav.data,
                totals: dav.total,
                formPagt: dav.formPagt,
                produtos: produtos,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: req.session.filialName

            });
        }
    },

    //Esta função é responsável por pegar os dados da venda e mandar um email para o vendedor escolhido
    async enviarEmail(req, res) {

        //O detalhamento do Dav é armazenado na variável <dav>
        const dav = await Venda.getVendaById(req.body.id, req.session.filial, req.user.id);

        //Se houver algum erro na conexão com o banco de dados, uma página de erro é renderizada
        if (dav.erro) {
            res.render('errors/manipuladorErro', {
                err: {
                    tit: dav.tit,
                    msg: dav.msg,
                    cod: dav.cod
                },
                cartTotal: '',
                filial: req.session.filialName
            })
        }
        //Senão, o email é enviado para o vendedor normalmente
        else {
            const produtos = await Venda.getVendaItens(req.body.id, req.session.filial);


            const result = await mandarEmail(req.body.email, produtos, dav);
            //console.log(result);

            res.send(true);
        }
    }
}