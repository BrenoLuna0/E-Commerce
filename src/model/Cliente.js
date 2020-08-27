const knex = require("../knexConnection");
const md5 = require("md5");

class Cliente {
  constructor(
    CLIE_CODIGO,
    CLIE_CPFCNPJ,
    SENHA_MD5,
    BLOQUEADO,
    NRO_TENTATIVAS,
    ULTIMA_TENTATIVA
  ) {
    this.CLIE_CODIGO = CLIE_CODIGO;
    this.CLIE_CPFCNPJ = CLIE_CPFCNPJ;
    this.SENHA_MD5 = SENHA_MD5;
    this.BLOQUEADO = BLOQUEADO;
    this.NRO_TENTATIVAS = NRO_TENTATIVAS;
    this.ULTIMA_TENTATIVA = ULTIMA_TENTATIVA;
  }

  static async getNumeroTentativas(id) {
    return await knex
      .raw(`SELECT NRO_TENTATIVAS FROM CLIENTE_SENHA WHERE CLIE_CODIGO = ${id}`)
      .then((response) => {
        return response[0].NRO_TENTATIVAS;
      })
      .catch((err) => {
        console.log(err);
        return {
          tit: "Erro na conexão com banco de dados",
          msg: "Erro ao tentar efetuar login",
          cod: 504,
        };
      });
  }

  static async getClienteCodigo(login) {
    return await knex
      .raw(`SELECT CLIE_CODIGO FROM CLIENTE_SENHA WHERE CLIE_LOGIN = ${login}`)
      .then((response) => {
        return response.length === 0 ? false : true;
      })
      .catch((err) => {
        console.log(err);
        return {
          tit: "Erro na conexão com banco de dados",
          msg: "Erro ao tentar efetuar login",
          cod: 506,
        };
      });
  }

  static async adicionarTentativaLogin(id, tentativas) {
    return await knex
      .raw(
        `UPDATE CLIENTE_SENHA SET NRO_TENTATIVAS = ${tentativas} WHERE CLIE_CODIGO = ${id}`
      )
      .then((response) => {
        return true;
      })
      .catch((err) => {
        console.log("Erro ao coloar as tentativas do usuario 505: " + err);
        return false;
      });
  }

  static async resetarTentativas(id) {
    return await knex
      .raw(
        `UPDATE CLIENTE_SENHA SET NRO_TENTATIVAS = 0 WHERE CLIE_CODIGO = ${id}`
      )
      .then((response) => {
        return true;
      })
      .catch((err) => {
        console.log(
          "Erro ao zerar o numero de tentativas do usuario 501: " + err
        );
        return false;
      });
  }

  static async alterarSenha(id, password) {
    return await knex
      .raw(
        `UPDATE CLIENTE_SENHA SET SENHA_MD5 = '${md5(
          password
        )}' WHERE CLIE_CODIGO = ${id}`
      )
      .then((response) => {
        return true;
      })
      .catch((err) => {
        console.log("Erro ao alterar a senha do usuario 502: " + err);
        return false;
      });
  }

  static async checarSenha(id, senha) {
    return await knex
      .raw(
        `SELECT * FROM CLIENTE_SENHA WHERE SENHA_MD5 = '${md5(
          senha
        )}' AND CLIE_CODIGO = ${id}`
      )
      .then((response) => {
        return response.length === 0 ? false : true;
      })
      .catch((err) => {
        console.log("Erro ao pegar a senha do usuario 503: " + err);
        return null;
      });
  }
}

module.exports = Cliente;
