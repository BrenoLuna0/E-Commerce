const Filial = require('../model/Filial');

module.exports = {
    async show(req, res) {
        const filiais = await Filial.findAll();

        if (filiais.erro) {
            res.render('errors/manipuladorErro', {
                err: {
                    tit: filiais.tit,
                    msg: filiais.msg,
                    cod: filiais.cod
                },
                cartTotal: '',
                filial: ''
            });
        } else {
            res.render('login/login', {
                filiais,
                reload : false
            })
        }

    },

}