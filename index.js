const express = require('express');
const router = express.Router();
const cors = require('cors');
const morgan = require('morgan');
const nodemailer = require('nodemailer');
const Joi = require('joi');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/', router);

const contactEmail = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

contactEmail.verify((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log('Ready to Send');
  }
});

async function validateUser(req, res, next) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(300).required(),
    email: Joi.string().email().required(),
    message: Joi.string().required(),
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const err = error.details.map((detail) => ({
      message: detail.message,
      field: detail.context.key,
    }));
    return res.status(400).send({
      err,
    });
  }
}

router.post('/contact', validateUser, (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const message = req.body.message;
  const mail = {
    from: name,
    to: 'mariusgudinas@gmail.com',
    subject: 'Contact Form Submission',
    html: `<p>Name: ${name}</p>
             <p>Email: ${email}</p>
             <p>Message: ${message}</p>`,
  };
  contactEmail.sendMail(mail, (error) => {
    if (error) {
      res.json({ status: toString(error) });
    } else {
      res.json({ status: 'Message Sent' });
    }
  });
});

app.listen(5000, () => console.log('Server Running'));
