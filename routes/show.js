const router = require('express').Router();
const File = require('../models/file');
const runScript = require('../services/runDisposingService');

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
        const APP_BASE_URL = process.env.APP_BASE_URL || req.protocol + "://" + req.get('host');
        
        const file = await File.findOne({ uuid: req.params.uuid });
        // Link expired
        if (!file) {
            return res.render('download', { error: 'Link has been expired.' });
        }
        return res.render('download', { uuid: file.uuid, fileName: file.filename, fileSize: file.size, downloadLink: `${APP_BASE_URL}/files/download/${file.uuid}` });
    } catch (err) {
        return res.render('download', { error: 'Something went wrong.' });
    }
});


module.exports = router;