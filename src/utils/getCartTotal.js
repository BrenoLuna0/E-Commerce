const Carrinho = require('../model/Carrinho');

module.exports = async function getCartTotal(id) {
    const produtosCarrinho = await Carrinho.getProdutos(id);
        if (!produtosCarrinho) {
            return '';
        } else {
            const produtosFinais = await Carrinho.getProdutosDetalhe(produtosCarrinho);
            let parcial = 0;
            const total = produtosFinais.map(function (produto) {
                return parcial += parseInt(produto.subtotal);
            });

            return `(R$${total})`;
        }

}