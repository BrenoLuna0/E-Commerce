const connection = require("knex")({
  client: "oracledb",
  connection: {
    connectString: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  },
});

module.exports = connection;
