const Carrinho = require('../model/Carrinho');

module.exports = async function getCartTotal(id, filial) {
    const produtosCarrinho = await Carrinho.getProdutos(id, filial); 

    if(produtosCarrinho.erro){
        return produtosCarrinho;
    } else if (!produtosCarrinho) {
        return '';
    } else {
        const produtosFinais = await Carrinho.getProdutosDetalhe(produtosCarrinho, filial);
        let parcial = 0;
        produtosFinais.map(function (produto) {
            parcial += parseFloat(produto.subtotal);
        });

        return parcial.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    }

}