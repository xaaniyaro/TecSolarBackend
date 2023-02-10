const express = require("express");
const CryptoJS = require("crypto-js");
const axios = require("axios");
const app = express();

const port = process.env.PORT || 3001;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.ORIGIN || "*");
  express.json();
  next();
});

app.get("/", (req, res) => res.send("Hello World!"));

app.get("/current", async (req, res) => {
  try {
    let ts = Math.round(new Date().getTime() / 1000);
    let claveapi = "cmktt6j4diosqgfidj0f9u0twtvmofzi";
    let plainText = "api-key" + claveapi + "station-id101004t" + ts;
    let secretKey = "rxidkkcbjxdjh293omoownp3f9qoe2no";
    let signature = CryptoJS.HmacSHA256(plainText, secretKey).toString(
      CryptoJS.enc.Hex
    );

    const { data } = await axios.get(
      "https://api.weatherlink.com/v2/current/101004",
      {
        params: {
          "api-key": claveapi,
          "api-signature": signature,
          t: ts,
        },
      }
    );
    //console.log(data);
    res.send(data);
    //res.send('Check the console');
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
});

app.get("/historic", async (req, res) => {
  try {
    //Objeto fecha
    let before = new Date();
    before.setHours(before.getHours() - 2);
    //Convirtiendo a UNIX timestamp la diferencia calculada
    let first = Math.round(before.getTime() / 1000);
    //Convirtiendo a UNIX timestamp la fecha actual
    let last = Math.round(new Date().getTime() / 1000);
    let claveapi = "cmktt6j4diosqgfidj0f9u0twtvmofzi";

    let plainText =
      "api-key" +
      claveapi +
      "end-timestamp" +
      last +
      "start-timestamp" +
      first +
      "station-id101004t" +
      last;
    let secretKey = "rxidkkcbjxdjh293omoownp3f9qoe2no";
    let signature = CryptoJS.HmacSHA256(plainText, secretKey).toString(
      CryptoJS.enc.Hex
    );

    const { data } = await axios.get(
      "https://api.weatherlink.com/v2/historic/101004",
      {
        params: {
          "api-key": claveapi,
          "api-signature": signature,
          t: last,
          "start-timestamp": first,
          "end-timestamp": last,
        },
      }
    );
    //console.log(data);
    res.send(data);
    //res.send('Check the console');
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
});

app.post("/tir", function (req, res) {
  const inversion = req.query.inversion;
  const flujo = req.query.flujo;

  const arr = [];
  for (let i = 0; i < 26; i++) {
    if (i === 0) {
      arr.push(-inversion);
    } else {
      arr.push(flujo);
    }
  }
  let NPV = 0;
  let min = 0.0;
  let max = 1.0;
  let guest = 0;
  do {
    guest = (min + max) / 2;
    NPV = 0;
    for (var j = 0; j < arr.length; j++) {
      NPV += arr[j] / Math.pow(1 + guest, j);
    }
    if (NPV > 0) {
      min = guest;
    } else {
      max = guest;
    }
  } while (Math.abs(NPV) > 0.000001);
  let result = guest * 100;

  res.send({
    tir: result.toFixed(2)
  });
});

app.listen(port, () => console.log(`http://localhost:${port}`));
