const router = require('express').Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/file');
const MailService = require('../services/mailService');
const MegaService = require('../services/megaStorageService');
const DBService = require('../services/dbService');

let upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
}).single('myfile');

router.post('/', upload, async (req, res) => {
  try {

    const db = await DBService();
    const megaClient = await MegaService();

    if (!(db && megaClient)) {
      return res.status(500).json({ error: "Server Error; Please Try again later" });
    }
    console.log("here");

    const APP_BASE_URL = req.headers.origin;
    const uuid = uuidv4();
    const megaOpts = {
      name: uuid + "." + req.file.originalname.split(".").pop(),
      attributes: { type: req.file.mimetype }
    };

    megaClient.upload(megaOpts, req.file.buffer, async (err, uploadedFile) => {
      if (err) {
        res.status(500).json({ error: err.message });
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
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server Error; Please Try again later" });
  }
});

router.post('/send', async (req, res) => {

  // Get data from db 
  try {

    const db = await DBService();
    const sendMail = await MailService();

    if (!(db && sendMail)) {
      return res.status(500).json({ error: "Server Error; Please Try again later" });
    }

    const { uuid, emailTo, emailFrom, expiresIn } = req.body;
    if (!uuid || !emailTo || !emailFrom) {
      return res.status(422).json({ error: 'All fields are required except expiry.' });
    }
    const APP_BASE_URL = req.headers.origin;

    const file = await File.findOne({ uuid: uuid });
    if (file.sent) {
      return res.status(422).json({ error: 'Email already sent once.' });
    }

    // send mail
    await sendMail({
      from: emailFrom,
      to: emailTo,
      subject: 'sharingBox file sharing',
      text: `${emailFrom} shared a file with you.`,
      html: require('../templates/emailTemplate')({
        emailFrom,
        downloadLink: `${APP_BASE_URL}/files/${file.uuid}?source=email`,
        size: parseInt(file.size / 1000) + ' KB',
        expires: '24 hours',
        appBaseUrl: APP_BASE_URL
      })
    });

    await file.updateOne({ sent: true, sender: emailFrom, receiver: emailTo });
    return res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server Error; Please Try again later" });
  }
});

module.exports = router;