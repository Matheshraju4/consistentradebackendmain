const express = require("express");
const cors = require("cors");
const app = express();
var CryptoJS = require("crypto-js");
const { User, Trade, Tradetarget } = require("./Db/db");
app.use(cors());

app.use(express.json());

const jwt = require("jsonwebtoken");
const { jwtsecret } = require("../config");
const authmiddleware = require("./Middleware/middleware");
const autoCompoundingCalculatorfordays = require("./components/autocompounding");
const sendMail = require("./components/sendmail");
const { encrypt, decrypt } = require("./components/Eandd");
app.get("/", function (req, res) {
  res.send("Hello World");
});

app.post("/signup", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;
  const isthereemail = await User.findOne({ email: email });
  const istherusername = await User.findOne({ username: username });
  if (!isthereemail && !istherusername) {
    const user = await User.create({
      email: email,
      password: password,
      username: username,
      isActive: false,
      trades: Trade._id,
    });
    const token = encrypt(user.email);
    await sendMail(user.email, token);

    res.send({
      message: "User Created Successfully",
      message2: "check Your Mail to Login",
    });
  } else {
    res.send("user already exists");
  }
});

app.post("/signin", async (req, res) => {
  const password = req.body.password;
  const username = req.body.username;
  const user = await User.findOne({
    username: username,
    password: password,
    isActive: true,
  });

  if (user) {
    const token = jwt.sign({ username: user.username }, jwtsecret);
    res.send({ user, token });
  } else {
    res.send("User not found");
  }
});

app.post("/autocompoundingcalculator", authmiddleware, async (req, res) => {
  const initialInvestment = req.body.initialInvestment;
  const numberofdays = req.body.numberofdays;
  const interestRate = req.body.interestRate;
  const finalTarget = req.body.finalTarget;
  const profit = req.body.profit;
  const target = req.body.target;
  if (initialInvestment >= 1000001) {
    res.send("initial investment is greater than 1million");
  } else {
    const user = await User.findOne({ username: req.username });
    const response = await autoCompoundingCalculatorfordays(
      initialInvestment,
      numberofdays,
      interestRate
    );
    res.send({
      response: response[0],
      tabledata: response[1],
      perdaytarget: response[2],
    });
  }
});

app.listen(3000, () => console.log("App is listening on port 3000"));

app.post("/createtrade", authmiddleware, async (req, res) => {
  try {
    const initialInvestment = req.body.response.initialInvestment;
    const NumberofDays = req.body.response.NumberofDays;
    const interestRate = req.body.response.interestRate;

    const responsedata = {
      initialInvestment: initialInvestment,
      NumberofDays: NumberofDays,
      interestRate: interestRate,
    };
    const FinalAmount = req.body.response.FinalAmount;
    const totalbalance = req.body.tabledata;
    const perdaytarget = req.body.perdaytarget;

    const user = await User.findOne({ username: req.username });
    const trade = await Trade.create({
      heading: "autocompoundingcalculator",
      initialInvestment: initialInvestment,
      NumberofDays: NumberofDays,
      interestRate: interestRate,
      finalTarget: FinalAmount,
      profit: 0,
      target: Tradetarget._id,
    });
    user.trades = trade._id;
    await user.save();

    const datatosend = [];
    const currentdate = new Date();
    for (let i = 0; i < totalbalance.length; i++) {
      let settingdate = new Date(currentdate);
      settingdate.setDate(currentdate.getDate() + i);
      //need tobe fixed
      datatosend[i] = {
        perdaytarget: parseFloat(perdaytarget[i]).toFixed(2),
        amount: parseFloat(totalbalance[i]).toFixed(2),
        iswon: null,
        date: settingdate.toDateString(),
      };
    }
    const target = await Tradetarget.create({
      dataArray: datatosend,
    });
    trade.target = target._id;
    await trade.save();

    res.send({
      message: "you came inside",
      datatosend: datatosend,
    });
  } catch (error) {
    console.log("something Went wrong on /createtrade", error);
  }
});

app.get("/verifyemail", async (req, res) => {
  // Encrypt
  console.log(req.query.token);
  const token = req.query.token;
  const token2 = token.replace(/ /g, "+");
  console.log("token2:", token2);
  const useremail = decrypt(token2);
  console.log(useremail);
  const user = await User.findOne({ email: useremail });
  console.log(user);
  if (user) {
    user.isActive = true;
    await user.save();
    res.send("user verified");
  } else {
    res.send("user not found");
  }
});

app.put("/updatewon/", authmiddleware, async (req, res) => {
  try {
    const id = req.query.id;
    const setiswon = req.query.iswon;
    const username = req.username;

    const user = await User.findOne({ username: username }).populate("trades");
    const trade = await Trade.findOne({ _id: user.trades }).populate("target");

    const tradetarget = await Tradetarget.findOne({
      _id: trade.target,
    });

    tradetarget.dataArray[id].iswon = setiswon === "true" ? true : false;
    const response = await tradetarget.save();

    const dataArray = response.dataArray;
    let profit = 0;
    dataArray.map((data) => {
      if (data.iswon == true) {
        profit = profit + data.perdaytarget;
      } else if (data.iswon == false) {
        profit = profit - data.perdaytarget;
      }
    });
    trade.profit = profit;
    const anotherres = await trade.save();

    res.send({
      response: response,
      profit: anotherres.profit,
    });
  } catch (error) {
    console.log("something Went wrong on /updatewon", error);
  }
});

app.post("/dashboard", authmiddleware, async (req, res) => {
  try {
    const username = req.username;
    // const user = await User.findOne({ username: username });
    // const trades = await Trade.findOne({ _id: user.trades });
    const user = await User.findOne({ username: username }).populate("trades");
    const trades = await Trade.findOne({ _id: user.trades._id }).populate(
      "target"
    );
    console.log(trades.target.dataArray);

    res.send({
      finalTarget: trades.finalTarget,
      profit: trades.profit,
      initialInvestment: trades.initialInvestment,
      message: trades.target.dataArray,
    });
  } catch (error) {
    console.log("something Went wrong on /dashboard", error);
  }

  // const target = await Tradetarget.findOne({ _id: user.trades._id }).populate(
  //   "target"
  // );
  // const user = await User.findOne({ username: username })
  // .populate({
  //     path: 'trades',
  //     populate: { path: 'target' }
  // });

  // res.send({
  //   message: target,
  // });
});
// });
// const trades = await Trade.create({
//   heading: "autocompoundingcalculator",
//   initialInvestment: initialInvestment,
//   interestRate: interestRate,
//   finalTarget: finalTarget,
//   profit: profit,
//   target: target._id,
// });

// user.trades = trades._id;
// await user.save();
// res.send({ message: "you came inside", response: trades._id });
