const connection = require('../connection');
const connection2 = require('../connectionUser');

class Venda {

    static async getNDav() {
        const conexao = await connection2;
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
          VALUES(2, ${nDAV} , '010264103000112' , ${new Date()} , ${userId} , 1 , 'A' , ${vendaTotal} , 0 , 0 , ${vendaTotal} , 4 , '${cnpj}' , '${intervaloDeParcelas}' , 'S' , 'N' )`;


        return new Promise(async function(resolve){
            conexao.execute(sql,[],{autoCommit : true}, function(err){
                if(err){
                    console.log('Erro no sql: ' + err.message);
                    resolve(false);
                }else{
                    resolve(true);
                }
            });
        });
    }
}

module.exports = Venda;