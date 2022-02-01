const { Client } = require("pg");
var express = require("express");
var app = express();
var cors = require("cors");

var bodyParser = require("body-parser");

const { Sequelize } = require("sequelize");
// const mangrove43 = require('mangrove_43.json');
const fs = require("fs");

app.use(bodyParser.json({ type: "application/json" }));
app.use(bodyParser.urlencoded({ extended: true }));

const sequelize = new Sequelize("gis_data", "admin", "admin", {
  host: "10.10.10.85",
  dialect: "postgres",
});

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}
connectDB();

var server = app.listen(1348, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("start");
});

app.use(cors());

//tambon coordinates latlng 
app.get("/tambon_coords", async (req, res) => {
  const [results, metadata] = await sequelize.query(
    //get centroid of geom and convert to latlng
    "select st_x(st_astext((st_centroid(geom)))) as long, st_y(st_astext((st_centroid(geom)))) as lat, tb_tn, ap_tn, pv_tn from tambon"
  );
  res.json(results);
});
