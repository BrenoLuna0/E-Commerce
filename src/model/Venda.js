const connection = require('../connection');
const formatarMoeda = require('../utils/formatarMoeda');

class Venda {

    static async getNDav(filial) {
        const conexao = await connection;
        //const sql = `SELECT siac_ts.SEQ_PRODUCAO.nextval FROM dual`;
        const sql = `SELECT SIAC_TS.fretorna_seq_dav('${filial}') DAV_CODIGO FROM DUAL`;
        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err, result) {
                if (err) {
                    console.log('Erro oracle ao pegar o numero do DAV 301: ' + err.message);
                    resolve(false);
                } else {
                    resolve(result.rows[0][0]);
                }
            });
        });
    }

    static async inserirDAV(nDAV, userId, vendaTotal, cnpj, intervaloDeParcelas, filial) {
        const conexao = await connection;
        var today = new Date();
        var date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
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
          VALUES(${filial}, ${nDAV} , '010264103000112' , '${date}' , ${userId} , 1 , 'A' , ${vendaTotal} , 0 , 0 , ${vendaTotal} , 4 , '${cnpj}' , 'Intervalo de dias: ${intervaloDeParcelas}' , 'S' , 'N')`;
          
        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err) {
                if (err) {
                    console.log('Erro oracle ao inserir DAV 302: ' + err.message);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    static async inserirDAVItens(nDAV, davItens, filial) {
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
            VALUES (${filial} , ${nDAV} , '010264103000112' , ${i} , ${davItem.codigo} , ${davItem.qtd} , ${davItem.preco} , ${davItem.subtotal})`;
            return new Promise(async function (resolve) {
                conexao.execute(sql, [], { autoCommit: true }, function (err) {
                    if (err) {
                        console.log('Erro no Oracle ao inserir DavItens 303: ' + err.message);
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

    static async inserirDAVFormaDePagamento(nDAV, formPagtCodigo, parcelas, vendaTotal, filial) {
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
         VALUES (${filial}, ${nDAV}, '010264103000112', 1, ${formPagtCodigo}, '', 0, ${parcelas}, 0, 0, 0, 0, ${vendaTotal}, ${vendaTotal})`;
        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err) {
                if (err) {
                    console.log('Erro no oracle ao inserir DavFormadePagamento 304: ' + err.message);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });

    }

    static async getVendas(id, filial) {
        const conexao = await connection;
        const sql = `SELECT DAV_CODIGO, DAV_DATA_ABERTURA, DAV_SUB_TOTAL, DAV_CODIGO_SG FROM DAV
        WHERE CLIE_CODIGO = ${id}
        AND FIL_CODIGO = ${filial}
        ORDER BY DAV_CODIGO DESC`;

        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err, result) {
                if (err) {
                    console.log('Erro no oracle ao pegar os davs para o historico 305: ' + err.message);
                    resolve({
                        erro: true,
                        tit: 'Erro Oracle',
                        msg: err.message,
                        cod: 305
                    });
                } else {
                    if (typeof (result.rows[0]) === 'undefined') {
                        resolve([]);
                    } else {
                        const vendas = result.rows.map(function (venda) {
                            const date = new Date(venda[1]);
                            const mes = date.getMonth() + 1;
                            const dia = date.getDate();
                            return {
                                codigo: venda[0],
                                data: `${dia > 9 ? "" + dia : "0" + dia}/${mes > 9 ? "" + mes : "0" + mes}/${date.getUTCFullYear()}`,
                                total: formatarMoeda(venda[2]),
                                codigoSG: venda[3]
                            }
                        });
                        //console.log(vendas);
                        return resolve(vendas);
                    }
                }
            });
        });
    }

    static async getVendaById(id, filial, user) {
        const conexao = await connection;
        const sql = `SELECT D.DAV_CODIGO, D.DAV_DATA_ABERTURA, D.DAV_SUB_TOTAL, F.FORM_PAGT_DESCRICAO, D.DAV_CODIGO_SG 
        FROM DAV D, dav_forma_pagamento DF, SIAC_TS.vw_forma_pagamento F
        WHERE D.DAV_CODIGO = df.dav_codigo
        AND df.form_pagt_codigo = f.form_pagt_codigo 
        AND D.FIL_CODIGO = ${filial} 
        AND D.CLIE_CODIGO = ${user}
        AND D.DAV_CODIGO = ${id}`;

        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err, result) {
                if (err) {
                    console.log('Erro Oracle ao pegar a venda pelo codigo 306: ' + err.message);
                    resolve({
                        erro: true,
                        tit: 'Erro Oracle',
                        msg: err.message,
                        cod: 306
                    });
                } else {
                    if (typeof (result.rows[0]) === 'undefined') {
                        console.log('Venda inexistente');
                        resolve({
                            erro: true,
                            tit: 'Venda Inexistente',
                            msg: 'Venda Inexistente',
                            cod: 306
                        });
                    } else {
                        const venda = result.rows[0];
                        const date = new Date(venda[1]);
                        const mes = date.getMonth() + 1;
                        const dia = date.getDate();
                        return resolve({
                            nDav: venda[0],
                            data: `${dia > 9 ? "" + dia : "0" + dia}/${mes > 9 ? "" + mes : "0" + mes}/${date.getUTCFullYear()}`,
                            total: formatarMoeda(venda[2]),
                            formPagt: venda[3],
                            codigoSG: venda[4]
                        });
                    }
                }
            });
        });
    }

    static async getVendaItens(id, filial) {
        const conexao = await connection;
        const sql = `SELECT d.prod_codigo, p.prod_descricao, d.dav_iten_preco_unit, d.dav_iten_qtd, d.dav_iten_total 
        FROM dav_itens D, SIAC_TS.VW_PRODUTO P
        WHERE d.prod_codigo = p.prod_codigo
        AND p.fil_codigo = ${filial}
        AND P.PROD_ATIVO = 'S'
        AND p.PROD_PRECO_VENDA > 0
        AND DAV_CODIGO = ${id}`;

        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err, result) {
                if (err) {
                    console.log('Erro oracle ao pegar os itens do dav 307: ' + err.message);
                    resolve([]);
                } else {
                    if (typeof (result.rows[0]) === 'undefined') {
                        console.log('Nao existe itens para esse Dav');
                        resolve([]);
                    } else {
                        const itensArray = result.rows.map(function (produto) {
                            return {
                                codigo: produto[0],
                                nome: produto[1],
                                preco: formatarMoeda(produto[2]),
                                qtd: produto[3],
                                subtotal: formatarMoeda(produto[4])
                            }
                        });
                        return resolve(itensArray);
                    }
                }
            });
        });
    }

    static async deletarDav(nDav, filial) {
        const conexao = await connection;
        const sql = `DELETE FROM DAV WHERE DAV_CODIGO = ${nDav} AND FIL_CODIGO = ${filial}`;

        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err) {
                if (err) {
                    console.log(`Transação Presa. Número do DAV : ${nDav}`);
                    resolve({
                        erro: true,
                        tit: `Transação Presa. Número do DAV : ${nDav}`,
                        msg: err.message,
                        cod: 308
                    })
                } else {
                    resolve(true);
                }
            });
        });
    }

    static async deletarDavItens(nDav, filial) {
        const conexao = await connection;
        const sql = `DELETE FROM DAV_ITENS WHERE DAV_CODIGO = ${nDav} AND FIL_CODIGO = ${filial}`;

        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err) {
                if (err) {
                    console.log(`Transação Presa. Número do DAV : ${nDav}`);
                    resolve({
                        erro: true,
                        tit: `Transação Presa. Número do DAV : ${nDav}`,
                        msg: err.message,
                        cod: 309
                    })
                } else {
                    resolve(true);
                }
            });
        });
    }

    static async deletarDavFormaPagt(nDav, filial) {
        const conexao = await connection;
        const sql = `DELETE FROM DAV_FORMA_PAGAMENTO WHERE DAV_CODIGO = ${nDav} AND FIL_CODIGO = ${filial}`;

        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err) {
                if (err) {
                    console.log(`Transação Presa. Número do DAV : ${nDav}`);
                    resolve({
                        erro: true,
                        tit: `Transação Presa. Número do DAV : ${nDav}`,
                        msg: err.message,
                        cod: 310
                    })
                } else {
                    resolve(true);
                }
            });
        });
    }

}

module.exports = Venda;