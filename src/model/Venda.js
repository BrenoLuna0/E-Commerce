const knex = require("../knexConnection");
const connection = require("../connection");
const formatarMoeda = require("../utils/formatarMoeda");

class Venda {
  static async getNDav(filial) {
    return await knex
      .raw(`SELECT SIAC_TS.fretorna_seq_dav('${filial}') DAV_CODIGO FROM DUAL`)
      .then((response) => response[0].DAV_CODIGO)
      .catch((err) => {
        console.log("Erro oracle ao pegar o numero do DAV 301: " + err);
        return false;
      });
  }

  static async inserirDAV(
    nDAV,
    userId,
    vendaTotal,
    cnpj,
    intervaloDeParcelas,
    filial
  ) {
    let observacao;
    if (intervaloDeParcelas === "") {
      observacao = "";
    } else {
      observacao = `Intervalo de Dias: ${intervaloDeParcelas}`;
    }
    //const conexao = await connection;
    var today = new Date();
    var date =
      today.getDate() +
      "/" +
      (today.getMonth() + 1) +
      "/" +
      today.getFullYear();

    return await knex
      .raw(
        `INSERT INTO DAV 
    (FIL_CODIGO,
     DAV_CODIGO,
     imei_codigo,
     DAV_DATA_ABERTURA,
     CLIE_CODIGO,
     TABE_PREC_CODIGO,
     DAV_SITUACAO, 
    DAV_SUB_TOTAL,
    DAV_VALOR_DESCONTO,
     DAV_VALOR_ACRESCIMO,
    DAV_TOTAL,
    FUNC_CODIGO,
    CLIE_CPFCNPJ,
    DAV_OBSERVACAO,
    DAV_INTRANET,
    DAV_INTRANET_ATUALIZADO)
     VALUES(${filial}, ${nDAV} , '010264103000112' , '${date}' , ${userId} , 1 , 'A' , ${vendaTotal} , 0 , 0 , ${vendaTotal} , 4 , '${cnpj}' , 'DAV TESTE NÃO FATURAR!!' , 'S' , 'N')`
      )
      .then(() => true)
      .catch((err) => {
        console.log("Erro oracle ao inserir DAV 302: " + err);
        return false;
      });
  }

  static async inserirDAVItens(nDAV, davItens, filial) {
    let i = 0;

    const resultados = davItens.map(async (davItem) => {
      i++;
      return await knex
        .raw(
          `INSERT INTO DAV_ITENS 
      (FIL_CODIGO,
      DAV_CODIGO, 
      IMEI_CODIGO, 
      DAV_ITEN_CODIGO, 
      PROD_CODIGO, 
      DAV_ITEN_QTD, 
      DAV_ITEN_PRECO_UNIT, 
      DAV_ITEN_TOTAL)  
      VALUES (${filial} , ${nDAV} , '010264103000112' , ${i} , ${davItem.codigo} , ${davItem.qtd} , ${davItem.preco} , ${davItem.subtotal})`
        )
        .then(() => true)
        .catch((err) => {
          console.log("Erro no Oracle ao inserir DavItens 303: " + err);
          return false;
        });
    });

    let verificacao;
    await Promise.all(resultados).then(function (results) {
      verificacao = results;
    });
    return verificacao;
  }

  static async inserirDAVFormaDePagamento(
    nDAV,
    formPagtCodigo,
    parcelas,
    vendaTotal,
    filial
  ) {
    return await knex
      .raw(
        `INSERT INTO DAV_FORMA_PAGAMENTO
    (FIL_CODIGO,
    DAV_CODIGO,
    IMEI_CODIGO,
    DAV_FORM_PAGT_ITEN,
    FORM_PAGT_CODIGO,
    DAV_FORM_PAGT_VENCIMENTO,
    DAV_FORM_PAGT_INTERVALO_DIAS,
    DAV_FORM_PAGT_NUM_PARCELA,
    DAV_FORM_PAGT_PERC_DESCONTO,
    DAV_FORM_PAGT_VALOR_DESCONTO,
    DAV_FORM_PAGT_PERC_ACRESCIMO,
    DAV_FORM_PAGT_VALOR_ACRESCIMO,
    DAV_FORM_PAGT_VALOR,
    DAV_FORM_PAGT_TOTAL)
    VALUES (${filial}, ${nDAV}, '010264103000112', 1, ${formPagtCodigo}, '', 0, ${parcelas}, 0, 0, 0, 0, ${vendaTotal}, ${vendaTotal})`
      )
      .then(() => true)
      .catch((err) => {
        console.log(
          "Erro no oracle ao inserir DavFormadePagamento 304: " + err
        );
        return false;
      });
  }

  static async getVendas(id, filial) {
    return await knex
      .raw(
        `SELECT DAV_CODIGO, DAV_DATA_ABERTURA, DAV_SUB_TOTAL, DAV_CODIGO_SG FROM DAV
    WHERE CLIE_CODIGO = ${id}
    AND FIL_CODIGO = ${filial}
    ORDER BY DAV_CODIGO DESC`
      )
      .then((response) => {
        return response.map((venda) => {
          const date = new Date(venda.DAV_DATA_ABERTURA);
          const mes = date.getMonth() + 1;
          const dia = date.getDate();
          return {
            codigo: venda.DAV_CODIGO,
            data: `${dia > 9 ? "" + dia : "0" + dia}/${
              mes > 9 ? "" + mes : "0" + mes
            }/${date.getUTCFullYear()}`,
            total: formatarMoeda(venda.DAV_SUB_TOTAL),
            codigoSG: venda.DAV_CODIGO_SG,
          };
        });
      })
      .catch((err) => {
        console.log(
          "Erro no oracle ao pegar os davs para o historico 305: " + err
        );
        resolve({
          erro: true,
          tit: "Erro Oracle",
          msg: err,
          cod: 305,
        });
      });
  }

  static async getVendaById(id, filial, user) {
    return await knex
      .raw(
        `SELECT D.DAV_CODIGO, D.DAV_DATA_ABERTURA, D.DAV_SUB_TOTAL, F.FORM_PAGT_DESCRICAO, D.DAV_CODIGO_SG 
    FROM DAV D, dav_forma_pagamento DF, SIAC_TS.vw_forma_pagamento F
    WHERE D.DAV_CODIGO = df.dav_codigo
    AND df.form_pagt_codigo = f.form_pagt_codigo 
    AND D.FIL_CODIGO = ${filial} 
    AND D.CLIE_CODIGO = ${user}
    AND D.DAV_CODIGO = ${id}`
      )
      .then((response) => {
        if (response.length === 0) {
          console.log("Venda inexistente");
          return {
            erro: true,
            tit: "Venda Inexistente",
            msg: "Venda Inexistente",
            cod: 306,
          };
        } else {
          const venda = response[0];
          const date = new Date(venda.DAV_DATA_ABERTURA);
          const mes = date.getMonth() + 1;
          const dia = date.getDate();
          return {
            nDav: venda.DAV_CODIGO,
            data: `${dia > 9 ? "" + dia : "0" + dia}/${
              mes > 9 ? "" + mes : "0" + mes
            }/${date.getUTCFullYear()}`,
            total: formatarMoeda(venda.DAV_SUB_TOTAL),
            formPagt: venda.FORM_PAGT_DESCRICAO,
            codigoSG: venda.DAV_CODIGO_SG,
          };
        }
      })
      .catch((err) => {
        console.log("Erro Oracle ao pegar a venda pelo codigo 306: " + err);
        return {
          erro: true,
          tit: "Erro Oracle",
          msg: err,
          cod: 306,
        };
      });
  }

  static async getVendaItens(id, filial) {
    return await knex
      .raw(
        `SELECT d.prod_codigo, p.prod_descricao, d.dav_iten_preco_unit, d.dav_iten_qtd, d.dav_iten_total 
    FROM dav_itens D, SIAC_TS.VW_PRODUTO P
    WHERE d.prod_codigo = p.prod_codigo
    AND p.fil_codigo = ${filial}
    AND P.PROD_ATIVO = 'S'
    AND p.PROD_PRECO_VENDA > 0
    AND DAV_CODIGO = ${id}`
      )
      .then((response) => {
        return response.map((produto) => ({
          codigo: produto.PROD_CODIGO,
          nome: produto.PROD_DESCRICAO,
          preco: formatarMoeda(produto.DAV_ITEN_PRECO_UNIT),
          qtd: produto.DAV_ITEN_QTD,
          subtotal: formatarMoeda(produto.DAV_ITEN_TOTAL),
        }));
      })
      .catch((err) => {
        console.log("Erro oracle ao pegar os itens do dav 307: " + err);
        return [];
      });
  }

  static async deletarDav(nDav, filial) {
    return await knex
      .raw(
        `DELETE FROM DAV WHERE DAV_CODIGO = ${nDav} AND FIL_CODIGO = ${filial}`
      )
      .then(() => true)
      .catch((err) => {
        console.log(`Transação Presa. Número do DAV : ${nDav}`);
        return {
          erro: true,
          tit: `Transação Presa. Número do DAV : ${nDav}`,
          msg: err,
          cod: 308,
        };
      });
  }

  static async deletarDavItens(nDav, filial) {
    return await knex
      .raw(
        `DELETE FROM DAV_ITENS WHERE DAV_CODIGO = ${nDav} AND FIL_CODIGO = ${filial}`
      )
      .then(() => true)
      .catch((err) => {
        console.log(`Transação Presa. Número do DAV : ${nDav}`);
        return {
          erro: true,
          tit: `Transação Presa. Número do DAV : ${nDav}`,
          msg: err,
          cod: 309,
        };
      });
  }

  static async deletarDavFormaPagt(nDav, filial) {
    return await knex
      .raw(
        `DELETE FROM DAV_FORMA_PAGAMENTO WHERE DAV_CODIGO = ${nDav} AND FIL_CODIGO = ${filial}`
      )
      .then(() => true)
      .catch((err) => {
        console.log(`Transação Presa. Número do DAV : ${nDav}`);
        return {
          erro: true,
          tit: `Transação Presa. Número do DAV : ${nDav}`,
          msg: err,
          cod: 310,
        };
      });
  }
}

module.exports = Venda;
