const Venda = require('../model/Venda');
const Categoria = require('../model/Categoria');
const getCartTotal = require('../utils/getCartTotal');

module.exports = {
    async realizarDav(req, res,next) {

        let obj = JSON.parse(req.body.objProduto)
        let arr = obj.replace('[[', '').replace(']]', '').split('],[').map(substring => substring.split(','));
        const arrayObject = arr.map(function (produto) {
            return {
                codigo: produto[0],
                nome: produto[1],
                preco: produto[2],
                qtd: produto[3],
                subtotal: produto[4]
            }
        });

        if (req.body.formPagt === '11') {
            const nDAV = await Venda.getNDav();
            console.log(nDAV);
            const confirmacaoDav = await Venda.inserirDAV(nDAV, req.user.id, req.body.total, '07.626.6970002-30', '');
            const confirmacaoDavItens = await Venda.inserirDAVItens(nDAV, arrayObject);
            const confirmacaoDaVFormPagt = await Venda.inserirDAVFormaDePagamento(nDAV, 11, 0, req.body.total);

            return next();
        }else{
            const nDAV = await Venda.getNDav();
            console.log(nDAV);
            const confirmacaoDav = await Venda.inserirDAV(nDAV, req.user.id, req.body.total, '07.626.6970002-30', req.body.intervalo);
            const confirmacaoDavItens = await Venda.inserirDAVItens(nDAV, arrayObject);
            const confirmacaoDaVFormPagt = await Venda.inserirDAVFormaDePagamento(nDAV,18,req.body.parcelas,req.body.total);

            return next();
        }
    },

    async confirmarVenda(req,res){
        const categorias = await Categoria.categorias();
        res.render('confirmacao/confirmacao', {
            categories : categorias,
            cartTotal : await getCartTotal(req.user.id)
        });
    }
}