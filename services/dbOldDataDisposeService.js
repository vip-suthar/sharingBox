const fs = require('fs');
const DBService = require('./dbService');
const File = require('../models/file');

// Get all records older than 24 hours 
async function fetchData() {
    try {

        const db = await DBService();
        if (!db) return;

        const files = await File.find({ createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
        if (files.length) {
            for (const file of files) {
                try {
                    fs.unlinkSync(file.path);
                    await file.remove();
                    console.log(`successfully deleted ${file.filename}`);
                } catch (err) {
                    console.log(`error while deleting file ${err} `);
                }
            }
        }
        console.log('Job done!');
    } catch (error) {
        console.log("Error While deleting Old Data");
        return;
    }

}

fetchData().then(process.exit);