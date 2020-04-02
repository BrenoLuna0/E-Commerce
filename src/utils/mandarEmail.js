//Este é o arquivo responsável por enviar o email

const nodemailer = require('nodemailer');

//Primeiro é definida as configurações do email que será o remetente e colocado dentro da variavel <transporter>
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    logger: false,
    debug: false, // include SMTP traffic in the logs
    tls: {
        rejectUnauthorized: false
    }
});

/**
 * Aqui se encontra a função em si que irá mandar o email
 * O texto enviado no email é um html, que é formatado dependendo dos parâmetros recebidos da função
 */
module.exports = async function (emailDestino, produtos, venda) {

    //Este é o html referente às informações da venda e do cabeçalho do email
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

    //Este é o html que faz a exibição dos produtos em formato de tabela como é feito no site
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

    produtos.map(function (produto) {
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


    //Esses dois HTMLs são concatenados
    let html = htmlVenda + htmlProdutos;

    //Aqui estão as informações que vão no email, como remetente, destinatario, o assunto do email e o corpo (html)
    const opcoesEmail = {
        from: 'pedido@vipinformatica.com.br',
        to: emailDestino,
        subject: 'DAV Realizado no Site',
        html
    };

    /*const opcoesEmail = {
        from: 'pedido@vipinformatica.com.br',
        to: 'breno.luna_@hotmail.com',
        subject: 'DAV Realizado no Site',
        text : 'PEGOUUU'
    };*/

    let result;

    //O email é enviado
    transporter.sendMail(opcoesEmail, (err, info) => {
        if (err) {
            console.log(err);
            result = false;
        } else {
            console.log('Email enviado' + info.response);
            result = true;
        }
    });

    return result;
}



