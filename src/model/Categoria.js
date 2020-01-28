const connection = require('../connection');

class Categoria{
    static async categorias(){
        const conexao = await connection;
        const sql = `SELECT distinct sub_grp_descricao 
        FROM SIAC_TS.vw_subgrupo S, siac_ts.vw_produto P
        where s.sub_grp_codigo = p.sub_grp_codigo`;

        return new Promise(async function(resolve){
            await conexao.execute(sql,[],{autoCommit : true}, function(err, result){
                if(err){
                    console.log('Erro Oracle ao requisitar Categorias 101');
                    resolve(err.message);
                }else{
                    if(typeof(result.rows[0]) === 'undefined'){
                        console.log('Não há categorias para serem capturadas');
                        resolve([]);
                    }else{
                        const objectArray = result.rows.map(function(categorias){
                            return {descricao : categorias[0].replace(/\s/g , "-")}
                        });
                        resolve(objectArray);
                    }
                }
            });
        });
    }
}

module.exports = Categoria;