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
        res.render('alterarSenha/alterarSenha', {
            resultado: null,
            cartTotal: await getCartTotal(req.user.id, req.session.filial),
            filial: await getFilialName(req.session.filial)
        })
    }
}