const knex = require("../knexConnection");

class Categoria {
  static async categorias(filial) {
    return await knex
      .raw(
        `SELECT distinct sub_grp_descricao 
        FROM siac_ts.vw_subgrupo S, SIAC_TS.VW_PRODUTO P
        where s.sub_grp_codigo = p.sub_grp_codigo
        AND P.PROD_ATIVO = 'S'
        AND p.PROD_PRECO_VENDA > 0
        AND P.FIL_CODIGO = ${filial}`
      )
      .then((response) => {
        return response.map((categorias) => {
          return { descricao: categorias.SUB_GRP_DESCRICAO };
        });
      })
      .catch((err) => {
        console.log("Erro Oracle ao requisitar Categorias 101");
        return err;
      });
  }
}

module.exports = Categoria;
