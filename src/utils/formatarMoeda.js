/**
 * Esta função coloca o formato monetário brasileiro de maneira manual
 */

module.exports = function (valor) {
    if(valor){
        return "R$" + valor.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
    }

}