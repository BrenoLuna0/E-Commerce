const connection = require('../connectionUser');
const connection2 = require('../connection');

class Carrinho {

    static async adicionarNoCarrinho(userId, productId, qtd) {
        const prvQtd = await Carrinho.verificarProduto(userId,productId);

        const conexao = await connection;
        let sql;

        if (prvQtd) {
            const qtdFinal = parseInt(qtd) + parseInt(prvQtd);
            sql = `UPDATE CARRINHO SET PROD_QTD = ${qtdFinal} WHERE USUARIO_CODIGO = ${userId} AND PROD_CODIGO = ${productId}`;
        } else {
            sql = `INSERT INTO CARRINHO (USUARIO_CODIGO, PROD_CODIGO, PROD_QTD) VALUES (${userId},${productId},${qtd})`;
        }

        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err) {
                if (err) {
                    console.log('Erro no oracle: ' + err.message);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });

    }

    static async removerDoCarrinho(userId, productId) {
        const conexao = await connection;
        const sql = `DELETE FROM CARRINHO WHERE USUARIO_CODIGO = ${userId} AND PROD_CODIGO = ${productId}`;

        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err) {
                if (err) {
                    console.log('Erro no Oracle: ' + err.message);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });

    }

    static async limparCarrinho(userId) {

    }

    static async atualizarQuantidade(userId, productId, qtd) {
        const conexao = await connection;
        const sql = `UPDATE CARRINHO SET PROD_QTD = ${qtd} WHERE PROD_CODIGO = ${productId} AND USUARIO_CODIGO = ${userId}`;

        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err) {
                if (err) {
                    console.log('Erro no Oracle: ' + err.message);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    static async getProdutos(userId) {
        const conexao = await connection;
        const sql = `SELECT PROD_CODIGO, PROD_QTD FROM CARRINHO WHERE USUARIO_CODIGO = ${userId}`;
        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, async function (err, result) {
                if (err) {
                    console.log('Deu erro ao requisitar produtos do carrinho: ' + err.message);
                    resolve([]);
                } else {
                    if (typeof (result.rows[0]) === 'undefined') {
                        console.log('Carrinho vazio');
                        resolve(false);
                    } else {
                        const produtosCarrinho = result.rows.map(function (produto) {
                            return {
                                codigo: produto[0],
                                qtd: produto[1]
                            }
                        });
                        resolve(produtosCarrinho);
                    }

                }
            });
        });

    }

    static async getProdutosDetalhe(produtos) {
        const conexao = await connection2;


        const produtosdetalhes = await produtos.map(function (produto) {
            let sql = `SELECT DISTINCT PROD_DESCRICAO, PROD_PRECO_01 FROM SIAC_TS.VW_PRODUTO WHERE PROD_CODIGO = ${produto.codigo}`;
            return new Promise(async function (resolve) {
                conexao.execute(sql, [], { autoCommit: true }, function (err, result) {
                    if (err) {
                        console.log('Erro no oracle: ' + err.message);
                        resolve([]);
                    } else {
                        if (typeof (result.rows[0]) === 'undefined') {
                            console.log('Nunhuk resultad');
                            resolve({
                                nome: 'produto generico',
                                preco: 5,
                                qtd: 1,
                                subtotal: 5
                            });
                        } else {
                            const produtoFinal = result.rows[0];
                            resolve({
                                codigo: produto.codigo,
                                nome: produtoFinal[0],
                                preco: produtoFinal[1],
                                qtd: produto.qtd,
                                subtotal: produto.qtd * produtoFinal[1]
                            });
                        }
                    }
                });
            });

        });
        let resultado;
        await Promise.all(produtosdetalhes).then(function (results) {
            resultado = results;
        });
        return resultado;


    }

    static async verificarProduto(userId, productId) {
        const conexao = await connection;
        const sql = `SELECT PROD_QTD FROM CARRINHO WHERE USUARIO_CODIGO = ${userId} AND PROD_CODIGO = ${productId}`;

        return new Promise(async function (resolve) {
            conexao.execute(sql, [], { autoCommit: true }, function (err, result) {
                if (err) {
                    console.log('Erro Oracle 25: ' + err.message);
                    resolve(false);
                } else {
                    if (typeof (result.rows[0]) === 'undefined') {
                        console.log('Produto Inexistente no carrinho');
                        resolve(false);
                    } else {
                        resolve(result.rows[0][0]);
                    }
                }
            });
        });
    }

}

module.exports = Carrinho;