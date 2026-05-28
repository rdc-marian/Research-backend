const streamifier = require("streamifier");
const { cloudinary } = require("../config/cloudinary");

const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

module.exports = { uploadBuffer };
