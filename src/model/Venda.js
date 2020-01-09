const connection = require('../connection');

class Venda {

    static async getNDav() {
        const conexao = await connection;
        const sql = `SELECT siac_ts.SEQ_PRODUCAO.nextval FROM dual`;

        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err, result) {
                if (err) {
                    console.log('Erro no sql 37: ' + err.message);
                    resolve(false);
                } else {
                    resolve(result.rows[0][0]);
                }
            });
        });
    }

    static async inserirDAV(nDAV, userId, vendaTotal, cnpj, intervaloDeParcelas) {
        const conexao = await connection;
        var today = new Date();
        var date = today.getDate() + '/' + (today.getMonth()+1) + '/' + today.getFullYear();
        console.log(date);
        const sql = `INSERT INTO DAV 
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
          VALUES(2, ${nDAV} , '010264103000112' , '${date}' , ${userId} , 1 , 'A' , ${vendaTotal} , 0 , 0 , ${vendaTotal} , 4 , '${cnpj}' , '${intervaloDeParcelas}' , 'S' , 'N')`;


        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err) {
                if (err) {
                    console.log('Erro no sql 38: ' + err.message);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    static async inserirDAVItens(nDAV, davItens) {
        const conexao = await connection;
        let i = 0;
        const resultados = davItens.map(function (davItem) {
            i++;
            let sql = `INSERT INTO DAV_ITENS 
            (FIL_CODIGO,
            DAV_CODIGO, 
            IMEI_CODIGO, 
            DAV_ITEN_CODIGO, 
            PROD_CODIGO, 
            DAV_ITEN_QTD, 
            DAV_ITEN_PRECO_UNIT, 
            DAV_ITEN_TOTAL)  
            VALUES (2 , ${nDAV} , '010264103000112' , ${i} , ${davItem.codigo} , ${davItem.qtd} , ${davItem.preco} , ${davItem.subtotal})`;
            return new Promise(async function (resolve) {
                conexao.execute(sql, [], { autoCommit: true }, function (err) {
                    if (err) {
                        console.log('Erro no Oracle 256: ' + err.message);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        });

        let verificacao;
        await Promise.all(resultados).then(function (results) {
            verificacao = results;
        });
        return verificacao;

    }

    static async inserirDAVFormaDePagamento(nDAV, formPagtCodigo, parcelas, vendaTotal) {
        const conexao = await connection;
        const sql = `INSERT INTO DAV_FORMA_PAGAMENTO
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
         VALUES (2, ${nDAV}, '010264103000112', 1, ${formPagtCodigo}, '', 0, ${parcelas}, 0, 0, 0, 0, ${vendaTotal}, ${vendaTotal})`;

        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err) {
                if (err) {
                    console.log('Erro no oracle 257: ' + err.message);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });

    }

}

module.exports = Venda;