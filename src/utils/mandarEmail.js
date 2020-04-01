const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'luna.breno99@gmail.com',
        pass: '%ComeKouzeon1240%'
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = async function (emailDestino, produtos, venda) {
    let htmlVenda = `<h1>Informações da venda ${venda.nDav}</h1>

    <div class="container center">
                <ul>
                    <li>
                        <p>Número do Pedido</p>
                        <p><strong>${venda.nDav}</strong></p>
                    </li>
                    <li>
                        <p>Data</p>
                        <p><strong>${venda.data}</strong></p>
                    </li>
                    <li>
                        <p>Total</p>
                        <p><strong>${venda.total}</strong></p>
                    </li>
                    <li>
                        <p>Método de Pagamento</p>
                        <p><strong>${venda.formPagt}</strong></p>
                    </li>
                </ul>
    </div>
            
        <hr>`;

    let htmlProdutos = `<div class="container center">
    <div class="row container center">
        <div class="col-sm-12 col-md-10 col-md-offset-1">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th class="text-center">Preço</th>
                        <th class="text-center">SubTotal</th>
                    </tr>
                </thead>
                <tbody>`;
    
    produtos.map(function(produto){
        htmlProdutos += `<tr>
        <td class="col-sm-8 col-md-6">
            <div class="media">
                <div class="media-body">
                    <h5 class="media-heading">
                        <strong>${produto.nome}</strong></h5>
                </div>
            </div>
        </td>
        <td class="col-sm-1 col-md-1" style="text-align: center">
            <strong>
                <p>${produto.qtd}</p>
            </strong>

        </td>
        <td class="col-sm-1 col-md-1 text-center" style="text-align: center">
            <strong>${produto.preco}</strong>
        </td>
        <td class="col-sm-1 col-md-1 text-center" style="text-align: center">
            <strong>${produto.subtotal}</strong>
        </td>

    </tr>`
    });

    htmlProdutos += `<tr>
                    <td>   </td>
                    <td> </td>
                    <td>
                        <h3>Total</h3>
                    </td>
                    <td class="text-right">
                        <h3><strong>${venda.total}</strong>
                        </h3>
                    </td>
                </tr>
                </tbody>
                </table>


                </div>
                </div>
                </div>`


    let html = htmlVenda + htmlProdutos;

    const opcoesEmail = {
        from: 'luna.breno99@gmail.com',
        to: emailDestino,
        subject: 'DAV Realizado no Site',
        html
    };

    let result;

    transporter.sendMail(opcoesEmail, (err,info)=>{
        if(err){
            console.log(err);
            result = false;
        }else{
            console.log('Email enviado' + info.response);
            result = true; 
        }
    });

    return result;
}



