const sgMail = require("@sendgrid/mail");
const sendGridAPIkey = process.env.SEND_GRID_API_KEY;

sgMail.setApiKey(sendGridAPIkey);

// TODO:  Add a personalized email that says Hello <username>
const sendWelcomeEmail = (email) => {
  sgMail.send({
    to: email,
    from: process.env.SENDER_EMAIL_ADDRESS,
    subject:
      "Congratulations on taking the first step towards better financial health!",
    text: `Hello,\n\nThank you for joining the Budget App! Reply to this email if you want to share any thoughts, suggestions, or need any help along the way.\n\nYou are unlikely to hit a target you cannot see. So, use this app to keep track of where your money is going and plan a better financial future.\n\nRegards,\nAbhyas Kumar Kanaujia`,
  });
};

const sendFarewellEmail = (email) => {
  sgMail.send({
    to: email,
    from: process.env.SENDER_EMAIL_ADDRESS,
    subject: "We're sorry to see you go!",
    text: "Hello,\n\nWe're sad to see you leave the Budget App. If there's anything we could have done better or if you have any feedback, please reply to this email—we're always looking to improve.\n\nPlease be assured that all your personal information and data have been permanently deleted from our servers to protect your privacy.\n\nWe hope to see you back someday and be a part of your financial journey once again. Until then, we wish you all the best in achieving your financial goals.\n\nWarm regards,\nAbhyas Kumar Kanaujia"
  })
}

module.exports = { sendWelcomeEmail, sendFarewellEmail };
