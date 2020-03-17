/**
 * Aqui se encontra as configurações para a conexão com o banco de dados
 * !!FALHA DE SEGURANÇA!!
 * O nome de usuário, senha e ip do banco de dados estão visíveis para todos. Utilizando o um arquivo .env resolve isso
 */

const oracledb = require('oracledb');
const CronJob = require('cron').CronJob;
let connection;
let conexao = connect();

/**
 * Criação de uma tarefa Cron, para que a conexão não se feche por inatividade em casos onde há um espaço muito grande entre o usu do site
 */
const job = new CronJob('*/7 * * * *',async function(){
    (await conexao).execute('SELECT COUNT(*) FROM DUAL',[], {autoCommit : true}, function(err, result){
        if(err){
            console.log('Erro na tarefa cron job');
        }
    });
});
job.start();

//Esta função cria a conexão com o banco de dados
async function connect(){
    try{
        //São definidos o usuário, senha e ip do banco de dados
        connection = await oracledb.getConnection({
             user : 'csm_mobile',
             password : 'mobile',
             connectString : '187.84.80.162:1521/bdvip01'
        });
        console.log("Successfully connected to Oracle!" + connection);
        //retornamos a conexão para que todas as models usem apenas uma conexão, ao invés de abrir uma conexão por consulta
        return connection;
     } catch(err) {
         console.log("Error: ", err);
       }
}

/* async function exportar(){
    conexao = await connect();
} 

module.exports = conexao; */

module.exports = conexao;