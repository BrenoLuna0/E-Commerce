const connection = require("../connection");
const knex = require("../knexConnection");

class Vendedor {
  constructor(VENDEDOR_CODIGO, VENDEDOR_NOME, VENDEDOR_EMAIL) {
    this.VENDEDOR_CODIGO = VENDEDOR_CODIGO;
    this.VENDEDOR_NOME = VENDEDOR_NOME;
    this.VENDEDOR_EMAIL = VENDEDOR_EMAIL;
  }

  static async getVendedores(fil_codigo) {
    return await knex
      .raw(
        `SELECT vendedor_codigo, vendedor_nome, vendedor_email 
        FROM SIAC_TS.vw_vendedor
        WHERE fil_codigo = ${fil_codigo}`
      )
      .then((response) => {
        return response.map(
          (vendedor) =>
            new Vendedor(
              vendedor.VENDEDOR_CODIGO,
              vendedor.VENDEDOR_NOME,
              vendedor.VENDEDOR_EMAIL
            )
        );
      })
      .catch((err) => {
        console.log(err);
        return {
          erro: true,
          tit: "Erro Ao pegar os vendedores no banco de dados",
          msg: err,
          cod: "601",
        };
      });
  }
}

module.exports = Vendedor;
