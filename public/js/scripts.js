var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

$('.alert').hide();
function adicionarNoCarrinho(idProduto, qtd = 1) {
    console.log('track 1' + qtd);
    let alertName = '#alert' + idProduto;
    console.log(alertName);
    let postObject = {
        produto: idProduto,
        qtd: qtd,
        dif: true
    };

    $.post("/carrinho/add", postObject, function (data) {
        if (data) {
            document.getElementsByClassName('fas fa-shopping-cart')[0].innerHTML = 'Carrinho' + data;
            $(alertName).show();
        } else {
            alert('Erro na Inserção deste Produto no Carrinho. Tente Novamente Mais Tarde');
        }
    });
}

function updateURLParameter(url, param, paramVal = 1) {
    if (paramVal === 'NaN') {
        paramVal = 2
    }
    console.log(paramVal);
    var newAdditionalURL = "";
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var additionalURL = tempArray[1];
    var temp = "";
    if (additionalURL) {
        tempArray = additionalURL.split("&");
        for (var i = 0; i < tempArray.length; i++) {
            if (tempArray[i].split('=')[0] != param) {
                newAdditionalURL += temp + tempArray[i];
                temp = "&";
            }
        }
    }

    var rows_txt = temp + "" + param + "=" + paramVal;
    return baseURL + "?" + newAdditionalURL + rows_txt;
}

function showProduct(id,flag){
    window.location.href = `/produto/${id}`;
}