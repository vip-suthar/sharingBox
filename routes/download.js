const router = require('express').Router();
const File = require('../models/file');
const DBService = require('../services/dbService');
const MegaService = require('../services/megaStorageService');

router.get('/:uuid', async (req, res) => {
   try {

      const db = await DBService();
      const megaClient = await MegaService();

      if (!(db && megaClient)) {
         return res.status(500).json({ error: "Server Error; Please Try again later" });
     }

      // Extract link and get file from storage send download stream 
      const file = await File.findOne({ uuid: req.params.uuid });
      // Link expired
      if (!file) {
         return res.render('download', { error: 'Link has been expired.' });
      }

      let found = false;
      for (const item of megaClient?.root?.children) {
         if (item.name === file.cloudFilename) {
            found = true;
            const downloadUrl = item.shareURL;
            res.set('Content-disposition', 'attachment; filename=' + file.originalFilename);
            res.set('Content-type', item.attributes.type);
            item.download().pipe(res);
         }
      }

      if (!found) res.render('download', { error: 'Link has been expired.' });
   } catch (error) {
      res.render('download', { error: 'Some Error Occured.' });
   }
});


module.exports = router;