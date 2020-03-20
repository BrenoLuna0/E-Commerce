const connection = require('../connection');
const md5 = require('md5');

class Cliente {
    constructor(CLIE_CODIGO, CLIE_CPFCNPJ, SENHA_MD5, BLOQUEADO, NRO_TENTATIVAS, ULTIMA_TENTATIVA) {
        this.CLIE_CODIGO = CLIE_CODIGO;
        this.CLIE_CPFCNPJ = CLIE_CPFCNPJ;
        this.SENHA_MD5 = SENHA_MD5;
        this.BLOQUEADO = BLOQUEADO;
        this.NRO_TENTATIVAS = NRO_TENTATIVAS;
        this.ULTIMA_TENTATIVA = ULTIMA_TENTATIVA;
    }

    static async getNumeroTentativas(id){
        const conexao = await connection;
        const sql = `SELECT NRO_TENTATIVAS FROM CLIENTE_SENHA WHERE CLIE_CODIGO = ${id}`;

        return new Promise(async function(resolve){
            conexao.execute(sql,[],{autoCommit : true}, function(err,result){
                if(err){
                    resolve({
                        tit: 'Erro na conexão com banco de dados',
                        msg: 'Erro ao tentar efetuar login',
                        cod: 504
                    })
                } else{
                    if(typeof(result.rows[0]) === 'undefined'){
                        resolve(false);
                    }else{
                        resolve(result.rows[0][0]);
                    }
                }
            });
        });
    }

    static async getClienteCodigo(login){
        const conexao = await connection;
        const sql = `SELECT CLIE_CODIGO FROM CLIENTE_SENHA WHERE CLIE_LOGIN = ${login}`;

        return new Promise(async function(resolve){
            conexao.execute(sql,[],{autoCommit : true}, function(err,result){
                if(err){
                    resolve({
                        tit: 'Erro na conexão com banco de dados',
                        msg: 'Erro ao tentar efetuar login',
                        cod: 506
                    })
                } else{
                    if(typeof(result.rows[0]) === 'undefined'){
                        resolve(false);
                    }else{
                        resolve(result.rows[0][0]);
                    }
                }
            });
        });
    }

    static async adicionarTentativaLogin(id,tentativas) {
        const conexao = await connection;
        const sql = `UPDATE CLIENTE_SENHA SET NRO_TENTATIVAS = ${tentativas} WHERE CLIE_CODIGO = ${id}`;

        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err) {
                if (err) {
                    console.log('Erro ao coloar as tentativas do usuario 505: ' + err.message);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    static async resetarTentativas(id) {
        const conexao = await connection;
        const sql = `UPDATE CLIENTE_SENHA SET NRO_TENTATIVAS = 0 WHERE CLIE_CODIGO = ${id}`;

        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err) {
                if (err) {
                    console.log('Erro ao zerar o numero de tentativas do usuario 501: ' + err.message);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    static async alterarSenha(id, password) {
        const conexao = await connection;
        const sql = `UPDATE CLIENTE_SENHA SET SENHA_MD5 = '${md5(password)}' WHERE CLIE_CODIGO = ${id}`;

        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err) {
                if (err) {
                    console.log('Erro ao alterar a senha do usuario 502: ' + err.message);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    static async checarSenha(id, senha) {
        const conexao = await connection;
        const sql = `SELECT * FROM CLIENTE_SENHA WHERE SENHA_MD5 = '${md5(senha)}' AND CLIE_CODIGO = ${id}`;

        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err, result) {
                if (err) {
                    console.log('Erro ao pegar a senha do usuario 503: ' + err.message);
                    resolve(null);
                } else {
                    if (typeof (result.rows[0]) === 'undefined') {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            });
        });
    }
}

module.exports = Cliente;