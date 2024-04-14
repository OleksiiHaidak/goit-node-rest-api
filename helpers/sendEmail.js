import sgMail from '@sendgrid/mail';
import "dotenv/config";

const { SENDGRID_API_KEY } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = data => {
    sgMail.send(data)
    .then(() => {
        console.log('Email sent');
    })
    .catch((error) => {
        console.error(error);
    })
};

export default sendEmail;