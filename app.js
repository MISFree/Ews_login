 const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());

/* ✅ SERVE STATIC FILES */
app.use(express.static(path.join(__dirname, "public")));

/* APIs */
app.use("/api", authRoutes);

module.exports = app;


Risk_EWS_Login

http://172.16.3.200:3004 


Client ID
1000.5IYO0XH4CE3BH2Y368OZAQKYVLU77K 
Client Secret
409d81e2abcd6c4fe9b322d6d0361169cc338eb1de