/**
 * Função, que dado o código da filia, ela retorna o nome da respectiva filial
 */

const Filial = require('../model/Filial');

module.exports = async function getFilialName(fil_codigo){
    const fil_nome = await Filial.findNameById(fil_codigo);
    if(fil_nome === []){
        return 'Filial não encontrada';
    }
    return fil_nome;
};