const connection = require('../connection');

class Categoria{
    static async categorias(filial){
        const conexao = await connection;
        const sql = `SELECT distinct sub_grp_descricao 
        FROM siac_ts.vw_subgrupo S, SIAC_TS.VW_PRODUTO_WEB P
        where s.sub_grp_codigo = p.sub_grp_codigo
        AND P.FIL_CODIGO = ${filial}`;

        return new Promise(async function(resolve){
            await conexao.execute(sql,[],{autoCommit : true}, function(err, result){
                if(err){
                    console.log('Erro Oracle ao requisitar Categorias 101');
                    resolve(err.message);
                }else{
                    if(typeof(result.rows[0]) === 'undefined'){
                        resolve([]);
                    }else{
                        const objectArray = result.rows.map(function(categorias){
                            return {descricao : categorias[0].replace(/\s/g , "-").replace(/\//g , "-E-")}
                        });
                        resolve(objectArray);
                    }
                }
            });
        });
    }
}

module.exports = Categoria;