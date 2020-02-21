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
                    resolve({
                        erro : true,
                        tit : 'Sem Comunicação com o Servidor',
                        msg : err.message,
                        cod : 401
                    });
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

    static async findNameById(id){
        const conexao = await connection;
        const sql = `SELECT FIL_NOME FROM SIAC_TS.vw_filial WHERE FIL_CODIGO = ${id}`;

        return new Promise(async function(resolve){
            conexao.execute(sql,[],{autoCommit : true}, function(err, result){
                if(err){
                    console.log('Erro Oracle ao pegar o nome da filial 402: ' + err.message);
                    resolve([]);
                }else{
                    if(typeof(result.rows[0]) === 'undefined'){
                        console.log('Nenhuma filial foi encontrada');
                        resolve([]);
                    }else{
                        const fil_nome = result.rows[0][0];

                        return resolve(fil_nome);
                    }
                }
            });
        });
    }
}

module.exports = Filial;