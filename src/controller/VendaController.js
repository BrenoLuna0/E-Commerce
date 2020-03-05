const Venda = require('../model/Venda');
const getCartTotal = require('../utils/getCartTotal');
const getFilialName = require('../utils/getFilialName');

module.exports = {
    async realizarDav(req, res, next) {

        let obj = JSON.parse(req.body.objProduto)
        let arr = obj.replace('[[', '').replace(']]', '').split('],[').map(substring => substring.split(','));
        const arrayObject = arr.map(function (produto) {
            return {
                codigo: produto[0],
                nome: produto[1],
                preco: produto[2],
                qtd: produto[3],
                subtotal: produto[4]
            }
        });

        if (req.body.formPagt === '11') {
            const nDAV = await Venda.getNDav(req.session.filial);
            console.log(nDAV);
            const confirmacaoDav = await Venda.inserirDAV(nDAV, req.user.id, req.body.total, '07.626.6970002-30', '', req.session.filial);
            const confirmacaoDavItens = await Venda.inserirDAVItens(nDAV, arrayObject, req.session.filial);
            const confirmacaoDaVFormPagt = await Venda.inserirDAVFormaDePagamento(nDAV, 11, 0, req.body.total, req.session.filial);

            if (confirmacaoDav && confirmacaoDavItens && confirmacaoDaVFormPagt) {
                res.locals.nDAV = nDAV;
                res.locals.formPagt = 'Dinheiro';
                let date = new Date();
                let mes = date.getMonth() + 1;
                let dia = date.getDate();
                res.locals.data = `${dia > 9 ? "" + dia : "0" + dia}/${mes > 9 ? "" + mes : "0" + mes}/${date.getUTCFullYear()}`;
                res.locals.total = await getCartTotal(req.user.id, req.session.filial);

                return next();
            } else {
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
                        filial: ''
                    })
                } else if (reverterDavItens.erro) {
                    res.render('errors/manipuladorErro', {
                        err: {
                            tit: reverterDavItens.tit,
                            msg: reverterDavItens.msg,
                            cod: reverterDavItens.cod
                        },
                        cartTotal: '',
                        filial: ''
                    })
                } else if (reverterDavFormaPagt.erro) {
                    res.render('errors/manipuladorErro', {
                        err: {
                            tit: reverterDavFormaPagt.tit,
                            msg: reverterDavFormaPagt.msg,
                            cod: reverterDavFormaPagt.cod
                        },
                        cartTotal: '',
                        filial: ''
                    })

                } else {
                    res.render('errors/manipuladorErro', {
                        err: {
                            tit: 'Erro na Compra',
                            msg: 'Erro Oracle no Processamento da sua Compra. Entre em contato conosco para solucionar esse caso',
                            cod: 700
                        },
                        cartTotal: '',
                        filial: ''
                    })
                }
            }

        } else {
            const nDAV = await Venda.getNDav(req.session.filial);
            console.log(nDAV);
            const confirmacaoDav = await Venda.inserirDAV(nDAV, req.user.id, req.body.total, '07.626.6970002-30', req.body.intervalo, req.session.filial);
            const confirmacaoDavItens = await Venda.inserirDAVItens(nDAV, arrayObject, req.session.filial);
            const confirmacaoDaVFormPagt = await Venda.inserirDAVFormaDePagamento(nDAV, 18, req.body.parcelas, req.body.total, req.session.filial);

            if (confirmacaoDav && confirmacaoDavItens && confirmacaoDaVFormPagt) {
                res.locals.nDAV = nDAV;
                res.locals.formPagt = 'Duplicata';
                let date = new Date();
                let mes = date.getMonth() + 1;
                let dia = date.getDate();
                res.locals.data = `${dia > 9 ? "" + dia : "0" + dia}/${mes > 9 ? "" + mes : "0" + mes}/${date.getUTCFullYear()}`;
                res.locals.total = await getCartTotal(req.user.id, req.session.filial);
                return next();
            } else {

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
                        filial: ''
                    })
                } else if (reverterDavItens.erro) {
                    res.render('errors/manipuladorErro', {
                        err: {
                            tit: reverterDavItens.tit,
                            msg: reverterDavItens.msg,
                            cod: reverterDavItens.cod
                        },
                        cartTotal: '',
                        filial: ''
                    })
                } else if (reverterDavFormaPagt.erro) {
                    res.render('errors/manipuladorErro', {
                        err: {
                            tit: reverterDavFormaPagt.tit,
                            msg: reverterDavFormaPagt.msg,
                            cod: reverterDavFormaPagt.cod
                        },
                        cartTotal: '',
                        filial: ''
                    })

                } else {
                    res.render('errors/manipuladorErro', {
                        err: {
                            tit: 'Erro na Compra',
                            msg: 'Erro Oracle no Processamento da sua Compra. Entre em contato conosco para solucionar esse caso',
                            cod: 700
                        },
                        cartTotal: '',
                        filial: ''
                    })
                }
            }
        }
    },

    async confirmarVenda(req, res) {
        res.render('confirmacao/confirmacao', {
            cartTotal: await getCartTotal(req.user.id, req.session.filial),
            filial: await getFilialName(req.session.filial)
        });
    },

    async getHistorico(req, res) {
        const vendas = await Venda.getVendas(req.user.id, req.session.filial);

        if (vendas.erro) {
            res.render('errors/manipuladorErro', {
                err: {
                    tit: vendas.tit,
                    msg: vendas.msg,
                    cod: vendas.cod
                },
                cartTotal: '',
                filial: ''
            });
        } else {
            res.render('historico/historico', {
                vendas: vendas,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: await getFilialName(req.session.filial)
            })
        }


    },

    async getDavDetalhe(req, res) {
        const dav = await Venda.getVendaById(req.params.id, req.session.filial, req.user.id);

        if (dav.erro) {
            res.render('errors/manipuladorErro', {
                err: {
                    tit: dav.tit,
                    msg: dav.msg,
                    cod: dav.cod
                },
                cartTotal: '',
                filial: ''
            })
        } else {
            const produtos = await Venda.getVendaItens(req.params.id, req.session.filial);

            res.render('vendaDetalhe/vendaDetalhe', {
                nDav: dav.codigoSG,
                data: dav.data,
                totals: dav.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }),
                formPagt: dav.formPagt,
                produtos: produtos,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: await getFilialName(req.session.filial)

            });
        }
    }
}