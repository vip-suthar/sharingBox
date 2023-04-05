const nodemailer = require("nodemailer");

let transporterCached = null;
module.exports = () => {
    if(transporterCached) return transporterCached;

    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL, // generated ethereal user
            pass: process.env.SMTP_PASSWORD, // generated ethereal password
        }
    });

    return transporter.verify().then(() => {
        transporterCached = transporter;
        return async ({ from, to, subject, text, html }) => {
            // send mail with defined transport object
            return await transporter.sendMail({
                from: `sharingBox <${from}>`, // sender address
                to: to, // list of receivers
                subject: subject, // Subject line
                text: text, // plain text body
                html: html, // html body
            });
        }
    }).catch((err) => {
        console.error("Mail Server Error: " + err.message);
        return transporterCached = null;
    });
}