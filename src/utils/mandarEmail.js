const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'luna.breno99@gmail.com',
        pass: '%ComeKouzeon1240%'
    }
});

module.exports = async function () {

    const opcoesEmail = {
        from: 'luna.breno99@gmail.com',
        to: 'breno.luna_@hotmail.com',
        subject: 'Teste de email com node',
        text: 'Este é um email de teste'
    };

    transporter.sendMail(opcoesEmail, (err,info)=>{
        if(err){
            console.log(err);
        }else{
            console.log('Email enviado' + info.response);
        }
    })
}



