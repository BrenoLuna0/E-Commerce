/**
 * Esta função calcula o valor total atual do carrinho sempre que é chamada
 */

const Carrinho = require('../model/Carrinho');
const formatarMoeda = require('./formatarMoeda');

module.exports = async function getCartTotal(id, filial) {

    //Primeiro requisita os produtos do carrinho
    const produtosCarrinho = await Carrinho.getProdutos(id, filial); 

    //Logo em seguida faz o teste para ver se houve algum erro
    if(produtosCarrinho.erro){
        return produtosCarrinho;
    } else if (!produtosCarrinho) {
        return '';
    } else {

        //É pego informações adicionais dos produtos para se calcular o total
        const produtosFinais = await Carrinho.getProdutosSemImagem(produtosCarrinho, filial);
        let parcial = 0;
        produtosFinais.map(function (produto) {
            parcial += parseFloat(produto.subtotal);
        });

        //O valor final é formatado usando a máscara monetária
        const final = formatarMoeda(parcial);

        return final;
    }

}