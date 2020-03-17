/**
 * Aqui se encontra a estratégia de autenticação para login de usuários
 */

const md5 = require('md5');
const LocalStrategy = require('passport-local').Strategy;
const connection = require('./connection');

module.exports = function (passport) {

    /**
     * As funções <findUser()> e <findUserById()> são as funções base para a nossa estratégia de autenticação.
     * Como seus próprios nomes já dizem, uma vai encontrar o usuário pelo login, e a outra, pelo código.
     * Tudo isso é feito através de consultas no banco de dados.
     */

    async function findUser(username, callback) {
        
        const conexao = await connection;
        const sql = `SELECT CLIE_CODIGO, CLIE_CPFCNPJ, SENHA_MD5 FROM CLIENTE_SENHA WHERE CLIE_CPFCNPJ = '${username}'`;

        await conexao.execute(sql, [], { autoCommit: true }, function (err, result) {
            if (typeof(result.rows[0]) === 'undefined') {
                callback(err, { username: 'a', password: 'b' });
            } else {
                
                const user = {
                    id: result.rows[0][0],
                    username: result.rows[0][1],
                    password: result.rows[0][2],
                };
                callback(err, user);
            }
        });
    }

    async function findUserById(id, callback) {
        const conexao = await connection;
        const sql = `SELECT CLIE_CODIGO, CLIE_CPFCNPJ, SENHA_MD5 FROM CLIENTE_SENHA WHERE CLIE_CODIGO = ${id}`;

        conexao.execute(sql, [], { autoCommit: true }, function (err, result) {
            if (typeof (result.rows[0]) === 'undefined') {
                callback(err, { username: 'a', password: 'b' });
            } else {
                const user = {
                    id: result.rows[0][0],
                    username: result.rows[0][1],
                    password: result.rows[0][2],
                };
                callback(err, user);
            }
        });
    }

    /**
     * As próximas funções são para serializar e desserializar o usuário.
     * Estas funções são necessárias para que o processo de autenticação funcione normalmente
     * Obs.:Peguei tudo isso da internet, não exatamente o que essas funções fazem
     */

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        findUserById(id, function (err, user) {
            done(err, user);
        });
    });

    //ESTRATÉGIA DE AUTENTICAÇÃO
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        filial : 'filial'
    },
        (username, password, done) => {
            //Utilizando a função <finUser()>, achamos o usuário pelo login...
            findUser(username, (err, user) => {
                if (err) { return done(err) }
                
                // usuário inexistente
                if (!user) { return done(null, false) }
                
                // comparando as senhas
                if(md5(password) === user.password){
                    return done(null,user);
                }else{
                    return done(null, false)
                }
                
            })
        }
    ));
}