const oracledb = require('oracledb');
const CronJob = require('cron').CronJob;
let connection;
let conexao = connect();

const job = new CronJob('*/7 * * * *',async function(){
    (await conexao).execute('SELECT COUNT(*) FROM DUAL',[], {autoCommit : true}, function(err, result){
        if(err){
            console.log('Erro na tarefa cron job');
        }
    });
});
job.start();

async function connect(){
    try{
        connection = await oracledb.getConnection({
             user : 'csm_mobile',
             password : 'mobile',
             connectString : '187.84.80.162:1521/bdvip01'
        });
        console.log("Successfully connected to Oracle!" + connection);
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