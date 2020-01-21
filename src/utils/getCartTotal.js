const Carrinho = require('../model/Carrinho');

module.exports = async function getCartTotal(id) {
    const produtosCarrinho = await Carrinho.getProdutos(id);
        if (!produtosCarrinho) {
            return '';
        } else {
            const produtosFinais = await Carrinho.getProdutosDetalhe(produtosCarrinho);
            let parcial = 0;
            produtosFinais.map(function (produto) {
                parcial += parseFloat(produto.subtotal);
            });

            return `(R$${parcial})`;
        }

}