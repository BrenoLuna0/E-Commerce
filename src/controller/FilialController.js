//Neste arquivo são tratadas as operações com a Filial

const Filial = require('../model/Filial');

module.exports = {
    
    //Esta função apenas retorna todas as filiais cadastradas no banco e renderiza a view de Login
    async show(req, res) {

        //As informações das filiais estarão guardadas na variável <filiais>
        const filiais = await Filial.findAll();

        //Caso aconteça algum erro de comunicação com o banco de dados, será exibida uma página de erro
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
        } 
        //Senão, a página de login será exibida normalmente
        else {
            res.render('login/login', {
                filiais,
                reload : false
            })
        }

    },

}