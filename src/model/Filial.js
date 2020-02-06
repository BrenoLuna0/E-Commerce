const connection = require('../connection');

class Filial{

    static async findAll(){
        const conexao = await connection;
        const sql = `SELECT FIL_CODIGO, FIL_NOME FROM SIAC_TS.vw_filial
        ORDER BY fil_codigo`;

        return new Promise(async function(resolve){
            conexao.execute(sql,[],{autoCommit : true}, function(err, result){
                if(err){
                    console.log('Erro Oracle ao pegar as filiais 401: ' + err.message);
                    resolve([]);
                }else{
                    if(typeof(result.rows[0]) === 'undefined'){
                        console.log('Nenhuma filial foi encontrada');
                        resolve([]);
                    }else{
                        const filiais = result.rows.map(function(filial){
                            return {
                                codigo : filial[0],
                                descricao : filial[1]
                            }
                        });

                        return resolve(filiais);
                    }
                }
            });
        });
    }
}

module.exports = Filial;