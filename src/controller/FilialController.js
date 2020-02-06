const Filial = require('../model/Filial');

module.exports = {
    async show(req,res){
        const filiais = await Filial.findAll();

        res.render('login/login', {
            filiais
        })
    }
}