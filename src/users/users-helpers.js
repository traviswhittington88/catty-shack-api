exports.uploadImage = (req, res) => {
  const BusBoy = require('busboy');
  const multer = require('multer');const { requireAuth } = require('../middleware/jwt-auth')
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    // my.image.png
    console.log(fieldname);
    console.log(filename);
    console.log(mimetype);
    const imageExtension = filename.split('.')[filename.split('.').length -1];
    const imageFileName = `${Math.round(Math.random()*1000000000000)}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on('finish', () => {

  })
}