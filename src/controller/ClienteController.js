/**
 * Aqui estão todas as funções de controle relacionadas os usuário
 */

const Cliente = require('../model/Cliente');
const getCartTotal = require('../utils/getCartTotal');
const getFilialName = require('../utils/getFilialName');

module.exports = {

    /**
     * Função incompleta. É necessário criar um esquema de controle para a quantidade de vezes que o usuário pode se logar
     * Esta função irá resetar as tentativas para 0 após o login ser realizado com sucesso 
     */
    async resetTentativas(req, res) {
        const resultado = await Cliente.resetarTentativas(req.user.id);

        if (resultado) {

        }
    },

    //Esta função é responsável por alterar a senha do usuário logado
    async alterarSenha(req, res) {

        /**
         * É realizado a Operação de alteração de senha no banco de dados.
         * O resultado desta função retorna -true- em caso de sucesso, e -false- em falha.
         * Este resultado (-true- ou -false-) é armazenado dentro da variável <resultado>
         */
        const resultado = await Cliente.alterarSenha(req.user.id, req.body.password);
        
        //Caso retorne -false-, a página de erro é renderizada
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
        //Caso retorne -true-...
        const userId = req.user.id;
        const filialN = req.session.filial;
        req.logout(); //...o usuário é deslogado e a página de confirmação é renderizada
        //Nesta página, após 7 segundos, o usuário será redirecionado para a página de login automaticamente, ou se ele clicar em qualquer parte do site antes desse tempo
        res.render('alterarSenha/alterarSenha', {
            resultado,
            cartTotal: await getCartTotal(userId, filialN),
            filial: await getFilialName(filialN)
        })
    },

    //Função que carregará o formulário de alteração de senha
    async carregarFormulario(req, res) {
        res.render('alterarSenha/confirmarSenha', {
            erro : null,
            cartTotal: await getCartTotal(req.user.id, req.session.filial),
            filial: await getFilialName(req.session.filial)
        })
    },

    /**
     * Função que verifica se a senha inserida pelo usuário no momento em que ele vai mudar a mesma, bate com a do banco de dados 
     */
    async verificarUsuario(req,res){
        
        //A senha é verificada aqui, e o valor de retorno que pode ser -null-, -true- ou -false- é passado para a variável <verificacao>
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