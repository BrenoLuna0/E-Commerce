const connection = require("../connection");
const formatarMoeda = require("../utils/formatarMoeda");

class Produto {
  constructor(
    PROD_CODIGO,
    PROD_DESCRICAO,
    PROD_PRECO,
    PROD_CATEGORIA,
    PROD_IMAG_DESCRICAO,
    PROD_IMAG_PATH,
    PROD_QTD_ATUAL,
    ZOOM
  ) {
    this.PROD_CODIGO = PROD_CODIGO;
    this.PROD_DESCRICAO = PROD_DESCRICAO;
    this.PROD_PRECO = PROD_PRECO;
    this.PROD_CATEGORIA = PROD_CATEGORIA;
    this.PROD_IMAG_DESCRICAO = PROD_IMAG_DESCRICAO;
    this.PROD_IMAG_PATH = PROD_IMAG_PATH;
    this.PROD_QTD_ATUAL = PROD_QTD_ATUAL;
    this.ZOOM = ZOOM;
  }

  static async findById(id, filial) {
    const produtosSemImagem = await getProdutoById(id, filial);
    if (produtosSemImagem.erro) {
      return produtosSemImagem;
    }
    const produtosImagem = await getProdutosImagem(produtosSemImagem);
    return produtosImagem;
  }

  static async find9(filial) {
    const produtosSemImagem = await getNineProdutos(filial);
    if (produtosSemImagem.erro) {
      return produtosSemImagem;
    }
    const produtosImagem = await getProdutosImagem(produtosSemImagem);
    return produtosImagem;
  }

  static async findAll(pageNumber, categoria, filial) {
    const produtosSemImagem = await getProdutos(pageNumber, categoria, filial);
    if (produtosSemImagem.erro) {
      return produtosSemImagem;
    }
    const produtosImagem = await getProdutosImagem(produtosSemImagem);
    return produtosImagem;
  }

  static async findByDescricao(pageNumber = 1, descricao, filial) {
    const produtosSemImagem = await getProdutosByDescricao(
      pageNumber,
      descricao,
      filial
    );
    if (produtosSemImagem.erro) {
      return produtosSemImagem;
    }
    const produtosImagem = await getProdutosImagem(produtosSemImagem);
    return produtosImagem;
  }

  static async produtosRelacionados(categoria, filial) {
    const produtosSemImagem = await getProdutosRelacionados(categoria, filial);
    const produtosImagem = await getProdutosImagem(produtosSemImagem);
    return produtosImagem;
  }

  static async getProdutosQtd(categoria, filial, descricao) {
    const conexao = await connection;
    const sql = `SELECT COUNT(*) 
        FROM SIAC_TS.VW_PRODUTO pw, siac_ts.vw_subgrupo sg
        WHERE pw.sub_grp_codigo = sg.sub_grp_codigo
        AND pw.FIL_CODIGO = ${filial}
        AND sg.SUB_GRP_DESCRICAO LIKE '${categoria}' 
        AND pw.PROD_DESCRICAO LIKE '%${descricao}%'
        AND PW.PROD_ATIVO = 'S'
        AND pw.PROD_PRECO_VENDA > 0
        ORDER BY PROD_CODIGO DESC`;

    return new Promise(async function (resolve) {
      conexao.execute(sql, [], { autoCommit: true }, function (err, result) {
        if (err) {
          resolve({
            erro: true,
            tit: "Erro Oracle ao solicitar quantidade de prodtudo",
            msg: err.message,
            cod: 207,
          });
        } else {
          if (typeof result.rows[0] === "undefined") {
            resolve(0);
          } else {
            resolve(result.rows[0][0]);
          }
        }
      });
    });
  }
}

async function getProdutos(pageNumber = 1, categoria = "%", filial) {
  const conexao = await connection;
  const sql = `SELECT * FROM
        (
            SELECT a.*, rownum r__
            FROM
            (
                SELECT DISTINCT pw.PROD_CODIGO,pw.PROD_DESCRICAO,pw.PROD_PRECO_VENDA,sg.SUB_GRP_DESCRICAO, pw.PROD_QTD_ATUAL
                FROM SIAC_TS.VW_PRODUTO pw,
                siac_ts.vw_subgrupo sg
                WHERE pw.sub_grp_codigo = sg.sub_grp_codigo
                AND pw.FIL_CODIGO = ${filial}
                AND sg.SUB_GRP_DESCRICAO LIKE '${categoria}' 
                AND PW.PROD_ATIVO = 'S'
                AND pw.PROD_PRECO_VENDA > 0
                ORDER BY PROD_CODIGO DESC
            ) a
            WHERE rownum < ((${pageNumber} * 30) + 1 )
        )
        WHERE r__ >= (((${pageNumber}-1) * 30) + 1)`;

  return new Promise(async function (resolve) {
    await conexao.execute(sql, [], { autoCommit: true }, function (
      err,
      result
    ) {
      if (err) {
        console.log("Erro na paginação de produtos 201: " + err.message);
        resolve({
          erro: true,
          tit: "Erro Oracle",
          msg: err.message,
          cod: 201,
        });
      } else {
        if (typeof result.rows[0] === "undefined") {
          resolve([]);
        } else {
          const objectArray = result.rows.map(function (produto) {
            return {
              codigo: produto[0],
              nome: produto[1],
              preco: produto[2],
              categoria: produto[3],
              qtd: produto[4],
            };
          });

          resolve(objectArray);
        }
      }
    });
  });
}

async function getNineProdutos(filial) {
  const conexao = await connection;
  const sql = `SELECT * FROM (
        SELECT DISTINCT P.PROD_CODIGO, P.PROD_DESCRICAO, p.PROD_PRECO_VENDA, s.sub_grp_descricao, P.PROD_QTD_ATUAL 
        FROM SIAC_TS.VW_PRODUTO P , siac_ts.vw_subgrupo S
        WHERE p.sub_grp_codigo = s.sub_grp_codigo
        AND P.FIL_CODIGO = ${filial}
        AND P.PROD_ATIVO = 'S'
        AND p.PROD_PRECO_VENDA > 0
        ORDER BY dbms_random.value
    )
    where ROWNUM <= 9`;

  return new Promise(async function (resolve) {
    await conexao.execute(sql, [], { autoCommit: true }, function (
      err,
      result
    ) {
      if (err) {
        console.log(
          "Erro oracle na captura dos produtos main 202: " + err.message
        );
        resolve({
          erro: true,
          tit: "Erro Oracle",
          msg: err.message,
          cod: 202,
        });
      } else {
        if (typeof result.rows[0] === "undefined") {
          resolve([]);
        } else {
          const objectArray = result.rows.map(function (produto) {
            return {
              codigo: produto[0],
              nome: produto[1],
              preco: produto[2],
              categoria: produto[3],
              qtd: produto[4],
            };
          });

          resolve(objectArray);
        }
      }
    });
  });
}

async function getProdutosByDescricao(pageNumber, descricao, filial) {
  const conexao = await connection;
  const sql = `SELECT * FROM
    (
        SELECT a.*, rownum r__
        FROM
        (
            SELECT distinct P.PROD_CODIGO, P.PROD_DESCRICAO, p.PROD_PRECO_VENDA, s.sub_grp_descricao, P.PROD_QTD_ATUAL
            FROM SIAC_TS.VW_PRODUTO P , siac_ts.vw_subgrupo S
            WHERE p.sub_grp_codigo = s.sub_grp_codigo
            AND P.FIL_CODIGO = ${filial}
            AND P.PROD_DESCRICAO LIKE '%${descricao}%'
            AND P.PROD_ATIVO = 'S'
            AND p.PROD_PRECO_VENDA > 0
            ORDER BY P.PROD_CODIGO DESC
        ) a
        WHERE rownum < ((${pageNumber} * 30) + 1 )
    )
    WHERE r__ >= (((${pageNumber}-1) * 30) + 1)`;

  return new Promise(async function (resolve) {
    await conexao.execute(sql, [], { autoCommit: true }, function (
      err,
      result
    ) {
      if (err) {
        console.log(
          "Erro oracle ao pegar produtos pela descrição 203: " + err.message
        );
        resolve({
          erro: true,
          tit: "Erro Oracle",
          msg: err.message,
          cod: 203,
        });
      } else {
        if (typeof result.rows[0] === "undefined") {
          resolve([]);
        } else {
          const objectArray = result.rows.map(function (produto) {
            return {
              codigo: produto[0],
              nome: produto[1],
              preco: produto[2],
              categoria: produto[3],
              qtd: produto[4],
            };
          });

          resolve(objectArray);
        }
      }
    });
  });
}

async function getProdutosRelacionados(categorias, filial) {
  const conexao = await connection;
  let sql = `SELECT * FROM (
        SELECT DISTINCT P.PROD_CODIGO, P.PROD_DESCRICAO, p.PROD_PRECO_VENDA, s.sub_grp_descricao, P.PROD_QTD_ATUAL 
        FROM SIAC_TS.VW_PRODUTO P, siac_ts.vw_subgrupo S
        WHERE p.sub_grp_codigo = s.sub_grp_codigo
        AND P.PROD_ATIVO = 'S'
        AND p.PROD_PRECO_VENDA > 0
        AND P.FIL_CODIGO = ${filial} AND (`;
  let control = 1;

  categorias.map(function (categoria) {
    control === 1
      ? (sql += `s.sub_grp_descricao = '${categoria}' `)
      : (sql += `OR s.sub_grp_descricao = '${categoria}' `);

    control++;
  });

  sql += `)ORDER BY dbms_random.value
        )
        where ROWNUM <= 6`;

  return new Promise(async function (resolve) {
    conexao.execute(sql, [], { autoCommit: true }, function (err, result) {
      if (err) {
        console.log(
          "Erro Oracle ao pegar produtos relacionados 204: " + err.message
        );
        resolve([]);
      } else {
        if (typeof result.rows[0] === "undefined") {
          resolve([]);
        } else {
          const objectArray = result.rows.map(function (produto) {
            return {
              codigo: produto[0],
              nome: produto[1],
              preco: produto[2],
              categoria: produto[3],
              qtd: produto[4],
            };
          });
          resolve(objectArray);
        }
      }
    });
  });
}

async function getProdutoById(id, filial) {
  const conexao = await connection;
  const sql = `SELECT DISTINCT P.PROD_CODIGO, P.PROD_DESCRICAO, p.PROD_PRECO_VENDA, s.sub_grp_descricao, P.PROD_QTD_ATUAL
    FROM SIAC_TS.VW_PRODUTO P , siac_ts.vw_subgrupo S
    WHERE p.sub_grp_codigo = s.sub_grp_codigo
    AND P.PROD_ATIVO = 'S' 
    AND p.PROD_PRECO_VENDA > 0
    AND P.FIL_CODIGO = ${filial}
    AND P.PROD_CODIGO = ${id}`;

  return new Promise(async function (resolve) {
    await conexao.execute(sql, [], { autoCommit: true }, function (
      err,
      result
    ) {
      if (err) {
        console.log(
          "Erro oracle ao pegar produto pelo codigo 205: " + err.message
        );
        resolve({
          erro: true,
          tit: "Erro Oracle",
          msg: err.message,
          cod: 205,
        });
      } else {
        if (typeof result.rows[0] === "undefined") {
          console.log("Produto Inexistente");
          resolve({
            erro: true,
            tit: "Produto Inexistente. ",
            msg: "Verifique se a URL está correta e Recarregue a Página",
            cod: 215,
          });
        } else {
          const produtoDados = result.rows[0];
          const produto = {
            codigo: produtoDados[0],
            nome: produtoDados[1],
            preco: produtoDados[2],
            categoria: produtoDados[3],
            qtd: produtoDados[4],
          };
          resolve([produto]);
        }
      }
    });
  });
}

async function getProdutosImagem(produtos) {
  const conexao = await connection;
  let sql;

  const produtosArray = produtos.map(async function (produto) {
    return new Promise(async function (resolve) {
      sql = `SELECT prod_imag_descricao, prod_imag_nome 
            FROM SIAC_TS.vw_produto_imagem
            WHERE prod_codigo = ${produto.codigo}`;
      await conexao.execute(sql, [], { autoCommit: true }, function (
        err,
        result
      ) {
        if (err) {
          console.log(
            "Erro oracle na requisicao das imagens 206: " + err.message
          );
          resolve([]);
        } else {
          if (typeof result.rows[0] === "undefined") {
            resolve(
              new Produto(
                produto.codigo,
                produto.nome,
                formatarMoeda(produto.preco),
                produto.categoria,
                "Produto sem Descrição",
                [
                  "data:image/png;base64,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",
                ],
                produto.qtd,
                ""
              )
            );
          } else {
            const images = result.rows.map(function (imagem) {
              return "http://localhost/imagens/" + imagem[1];
            });
            resolve(
              new Produto(
                produto.codigo,
                produto.nome,
                formatarMoeda(produto.preco),
                produto.categoria,
                result.rows[0][0] || "Produto sem Descrição",
                images,
                produto.qtd,
                "picZoomer"
              )
            );
          }
        }
      });
    });
  });

  let resultado;
  await Promise.all(produtosArray).then(function (results) {
    resultado = results;
  });
  return resultado;
}

module.exports = Produto;
