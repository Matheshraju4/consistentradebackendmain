const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://matheshraju:Mathesh%401@matheshmangodb.zqr9kuu.mongodb.net/consistenttrade"
  )
  .then(() => console.log("Connected!"));

const UserSchema = mongoose.Schema({
  email: String,
  username: String,
  password: String,
  isActive: Boolean,
  trades: { type: mongoose.Schema.Types.ObjectId, ref: "Trade" },
});

const TradeSchema = mongoose.Schema([
  {
    heading: String,
    initialInvestment: Number,
    NumberofDays: Number,
    interestRate: Number,
    finalTarget: Number,
    profit: Number,
    target: { type: mongoose.Schema.Types.ObjectId, ref: "Tradetarget" },
  },
]);
const TradetargetSchema = mongoose.Schema({
  dataArray: [
    {
      perdaytarget: Number,
      amount: Number,
      iswon: Boolean,
      date: String,
    },
  ],
});

const User = mongoose.model("User", UserSchema);
const Trade = mongoose.model("Trade", TradeSchema);
const Tradetarget = mongoose.model("Tradetarget", TradetargetSchema);
module.exports = {
  User,
  Trade,
  Tradetarget,
};
