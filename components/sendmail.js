const nodemailer = require("nodemailer");

function sendMail(useremail, token) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "consistenttrade2@gmail.com",
      pass: "mlle ankc zpel hygw",
    },
  });

  const mailOptions = {
    from: "consistenttrade2@gmail.com",
    to: useremail,
    subject: "Sending Email using Node.js",
    text: "That was easy!",
    html: `<h5>Click below link to verify your email</h5><h6><a href='http://localhost:3000/verifyemail?token=${token}'>Click here</a></h6>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

module.exports = sendMail;
