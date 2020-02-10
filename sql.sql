--pegar produtos
SELECT DISTINCT pw.PROD_CODIGO,pw.PROD_DESCRICAO,pw.PROD_PRECO_01,sg.SUB_GRP_DESCRICAO
FROM PRODUTO_WEB pw,
siac_ts.vw_subgrupo sg
WHERE pw.sub_grp_codigo = sg.sub_grp_codigo
AND pw.FIL_CODIGO = 
AND sg.SUB_GRP_DESCRICAO LIKE 
ORDER BY PROD_CODIGO DESC;

--pegar imagem
SELECT DISTINCT	prod_imag_path, prod_imag_descricao
FROM SIAC_TS.vw_produto_imagem 
WHERE prod_codigo = 440500
ORDER BY prod_codigo DESC;

--lista de categorias
SELECT DISTINCT sg.SUB_GRP_DESCRICAO
FROM siac_ts.vw_subgrupo sg, PRODUTO_WEB pw
WHERE PW.SUB_GRP_CODIGO = SG.SUB_GRP_CODIGO;

--pegar user pelo login
SELECT FUNC_CODIGO, LOGIN, SENHA
FROM SIAC_TS.VW_FUNCIONARIO
WHERE LOGIN = 'FABIO';

--pegar user pelo id
SELECT FUNC_CODIGO, LOGIN, SENHA
FROM SIAC_TS.VW_FUNCIONARIO
WHERE FUNC_CODIGO = 157;