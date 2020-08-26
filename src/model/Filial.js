const knex = require("../knexConnection");
const { response } = require("express");

class Filial {
  static async findAll() {
    return await knex
      .raw(
        "SELECT FIL_CODIGO, FIL_NOME FROM SIAC_TS.vw_filial ORDER BY fil_codigo"
      )
      .then((response) => {
        return response.map((filial) => {
          return {
            codigo: filial.FIL_CODIGO,
            descricao: filial.FIL_NOME,
          };
        });
      })
      .catch((err) => {
        console.log("Erro Oracle ao pegar as filiais 401: " + err);
        return {
          erro: true,
          tit: "Sem Comunicação com o Servidor",
          msg: err,
          cod: 401,
        };
      });
  }

  static async findNameById(id) {
    return await knex
      .raw("SELECT FIL_NOME FROM SIAC_TS.vw_filial WHERE FIL_CODIGO = ?", [id])
      .then((response) => {
        return response[0].FIL_NOME;
      })
      .catch((err) => {
        console.log("Erro Oracle ao pegar o nome da filial 402: " + err);
        return [];
      });
  }
}

module.exports = Filial;
