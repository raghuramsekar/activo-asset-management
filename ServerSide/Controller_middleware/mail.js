var smtpPool = require('nodemailer-smtp-pool');
var nodemailer = require('nodemailer');

function Mail(assetTag, empId, empName, email) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'skavanode@gmail.com',
      pass: `Skava@123`,
    },
  });
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log('Server is ready to take our messages');
    }
  });
  const mailOptions = {
    from: 'skavanode@gmail.com',
    to: email,
    subject: 'Asset allocated',
    text:
      `The asset ` +
      assetTag +
      ` has been assigned to ` +
      empId +
      `(` +
      empName +
      `).`,
  };
  console.log('mail sending');
  transporter.sendMail(mailOptions, (err, response) => {
    if (err) console.error(err.message);
    else {
      console.log('success');
      return;
      //   res.status(200).json('mail sent');
    }
  });
}

module.exports = Mail;
