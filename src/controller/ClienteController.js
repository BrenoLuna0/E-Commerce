const Cliente = require('../model/Cliente');
const getCartTotal = require('../utils/getCartTotal');
const getFilialName = require('../utils/getFilialName');

module.exports = {
    async resetTentativas(req, res) {
        const resultado = await Cliente.resetarTentativas(req.user.id);

        if (resultado) {

        }
    },

    async alterarSenha(req, res) {
        const resultado = await Cliente.alterarSenha(req.user.id, req.body.password);
        if (!resultado) {
            res.render('errors/manipuladorErro', {
                err: {
                    tit: 'Erro ao ALterar Senha',
                    msg: 'Erro Oracle ao alterar a senha',
                    cod: 502
                },
                cartTotal: '',
                filial: ''
            });
        }
        const userId = req.user.id;
        const filialN = req.session.filial;
        req.logout();
        res.render('alterarSenha/alterarSenha', {
            resultado,
            cartTotal: await getCartTotal(userId, filialN),
            filial: await getFilialName(filialN)
        })
    },

    async carregarFormulario(req, res) {
        res.render('alterarSenha/confirmarSenha', {
            erro : null,
            cartTotal: await getCartTotal(req.user.id, req.session.filial),
            filial: await getFilialName(req.session.filial)
        })
    },

    async verificarUsuario(req,res){
        const verificacao = await Cliente.checarSenha(req.user.id, req.body.password);

        if(verificacao === null){
            res.render('errors/manipuladorErro', {
                err: {
                    tit: 'Erro ao ALterar Senha',
                    msg: 'Erro Oracle ao alterar a senha',
                    cod: 508
                },
                cartTotal: '',
                filial: ''
            });
        }else if(verificacao === false){
            res.render('alterarSenha/confirmarSenha', {
                erro: true,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: await getFilialName(req.session.filial)
            })
        }else {
            res.render('alterarSenha/alterarSenha', {
                resultado: null,
                cartTotal: await getCartTotal(req.user.id, req.session.filial),
                filial: await getFilialName(req.session.filial)
            })
        }
    }
}