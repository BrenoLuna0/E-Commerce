require("dotenv").config();
const express = require("express");
const path = require("path");
const passport = require("passport");
const session = require("express-session");

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(
  session({
    secret: "secret", //configure um segredo seu aqui
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + "/public"));
app.use("/images", express.static("C:/inetpub/wwwroot/imagens"));

app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "ejs");

app.use("/", require("./src/routes"));
app.listen(process.env.PORT || 5000, () => {
  console.log("Servidor ouvindo na porta 5000");
});
