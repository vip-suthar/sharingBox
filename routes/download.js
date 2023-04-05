const router = require('express').Router();
const File = require('../models/file');
const megaClient = require('../services/megaStorageService');

router.get('/:uuid', async (req, res) => {
   // Extract link and get file from storage send download stream 
   const file = await File.findOne({ uuid: req.params.uuid });
   // Link expired
   if (!file) {
      return res.render('download', { error: 'Link has been expired.' });
   }

   try {
      let found = false;
      for (const item of (await megaClient.ready).root.children) {
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
      console.log(error.message)
      res.render('download', { error: 'Some Error Occured.' });
   }
});


module.exports = router;