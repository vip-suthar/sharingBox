const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/file');
const MailService = require('../services/mailService');
const megaClient = require('../services/megaStorageService');

let upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
}).single('myfile');

router.post('/', upload, async (req, res) => {
  const APP_BASE_URL = req.headers.origin;
  const uuid = uuidv4();
  const megaOpts = {
    name: uuid + "." + req.file.originalname.split(".").pop(),
    attributes: { type: req.file.mimetype }
  };

  megaClient.upload(megaOpts, req.file.buffer, async (err, uploadedFile) => {
    if (err) {
      res.status(500).send({ error: err.message });
    } else {
      const file = new File({
        cloudFilename: uploadedFile.name,
        originalFilename: req.file.originalname,
        type: req.file.mimetype,
        uuid: uuid,
        path: await uploadedFile.link(),
        size: req.file.size
      });
      const response = await file.save();
      res.json({ file: new URL(`${APP_BASE_URL}/files/${uuid}`) });
    }
  });
});

router.post('/send', async (req, res) => {
  const { uuid, emailTo, emailFrom, expiresIn } = req.body;
  if (!uuid || !emailTo || !emailFrom) {
    return res.status(422).send({ error: 'All fields are required except expiry.' });
  }
  // Get data from db 
  try {
    const APP_BASE_URL = req.headers.origin;

    const file = await File.findOne({ uuid: uuid });
    if (file.sent) {
      return res.status(422).send({ error: 'Email already sent once.' });
    }

    // send mail
    const sendMail = await MailService();
    if (sendMail) {
      await sendMail({
        from: emailFrom,
        to: emailTo,
        subject: 'sharingBox file sharing',
        text: `${emailFrom} shared a file with you.`,
        html: require('../services/emailTemplate')({
          emailFrom,
          downloadLink: `${APP_BASE_URL}/files/${file.uuid}?source=email`,
          size: parseInt(file.size / 1000) + ' KB',
          expires: '24 hours',
          appBaseUrl: APP_BASE_URL
        })
      });

      await file.updateOne({ sent: true, sender: emailFrom, receiver: emailTo });
      return res.json({ success: true });
    } else {
      return res.status(500).send({ error: 'Something went wrong.' });
    }
  } catch (err) {
    return res.status(500).send({ error: 'Something went wrong.' });
  }
});

module.exports = router;