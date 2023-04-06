const router = require('express').Router();
const File = require('../models/file');
const runScript = require('../services/runDisposingService');
const DBService = require('../services/dbService');

router.get('/:uuid', async (req, res) => {

    // Now we can run a script and invoke a callback when complete, e.g.
    try {
        runScript('./services/dbOldDataDisposeService.js', function (err) {
            if (err) throw err;
            console.log('finished running dbOldDataDisposeService.js');
        });
    } catch (error) {
        console.error("error running dbOldDataDisposeService.js");
    }


    try {

        const db = await DBService();

        if (!db) {
            return res.status(500).json({ error: "Server Error; Please Try again later" });
        }

        // const APP_BASE_URL = req.headers.origin;
        // console.log("here",req.headers)
        const file = await File.findOne({ uuid: req.params.uuid });
        // Link expired
        if (!file) {
            return res.render('download', { error: 'Link has been expired.' });
        }
        return res.render('download', { uuid: file.uuid, fileName: file.originalFilename, fileSize: file.size, downloadLink: `/files/download/${file.uuid}` });
    } catch (err) {
        return res.render('download', { error: 'Something went wrong.' });
    }
});


module.exports = router;