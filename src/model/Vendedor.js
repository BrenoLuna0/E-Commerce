const connection = require('../connection');

class Vendedor {

    constructor(VENDEDOR_CODIGO, VENDEDOR_NOME, VENDEDOR_EMAIL) {
        this.VENDEDOR_CODIGO = VENDEDOR_CODIGO;
        this.VENDEDOR_NOME = VENDEDOR_NOME;
        this.VENDEDOR_EMAIL = VENDEDOR_EMAIL;
    }


    static async getVendedores(fil_codigo) {
        const conexao = await connection;
        const sql = `SELECT vendedor_codigo, vendedor_nome, vendedor_email 
        FROM SIAC_TS.vw_vendedor
        WHERE fil_codigo = ${fil_codigo}`;

        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err, result) {
                if (err) {
                    resolve({
                        erro: true,
                        tit: 'Erro Ao pegar os vendedores no banco de dados',
                        msg: err.message,
                        cod: '601'
                    });
                } else {
                    if (typeof (result.rows[0]) === 'undefined') {
                        console.log('Não há vendedores para essa filial');
                        resolve([])
                    }else {
                        const vendedores = result.rows.map(function(vendedor){
                            return new Vendedor(vendedor[0],vendedor[1], vendedor[2]);
                        });

                        resolve(vendedores);
                    }
                }
            });
        });
    }
}

module.exports = Vendedor;