const Carrinho = require('../model/Carrinho');

module.exports = {
    async total(req,res){
        const produtosCarrinho = await Carrinho.getProdutos(req.user.id);
        if (!produtosCarrinho) {
            console.log('Carrinho vazio');
            res.json(false);
        } else {
            const produtosFinais = await Carrinho.getProdutosDetalhe(produtosCarrinho);
            const total = await Carrinho.getCartTotal(produtosFinais);
            res.json(total);
        }
    }
}