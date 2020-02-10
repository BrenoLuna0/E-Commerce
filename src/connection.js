const oracledb = require('oracledb');
let connection;
let conexao;

async function connect(){
    try{
        connection = await oracledb.getConnection({
             user : 'csm_mobile',
             password : 'mobile',
             connectString : '187.84.80.162:1521/bdvip01'
        });
        console.log("Successfully connected to Oracle!");
        return connection;
     } catch(err) {
         console.log("Error: ", err);
       }
}

/* async function exportar(){
    conexao = await connect();
} 

module.exports = conexao; */

module.exports = connect();