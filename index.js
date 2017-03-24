const fs = require('fs');
const mime = require('mime');
const AWS = require('aws-sdk');
const glob = require('glob');

const UploadToS3 = (config = {}) => {
  const s3 = new AWS.S3(config.s3);

  const apply = (compiler) => {
    compiler.plugin('after-emit', (compilation, callback) => {
      glob('**/*.*', {
        cwd: config.assetsFolder,
      }, (error, files) => {
        if (error) {
          callback(error);
          return;
        }

        let count = 0;
        files.forEach((filename) => {
          const filePath = `${config.assetsFolder}/${filename}`;
          const fileStream = fs.createReadStream(filePath);

          const params = {
            Bucket: config.bucket,
            Key: filename,
            Body: fileStream,
            ACL: 'public-read',
            ContentType: mime.lookup(filePath),
          };

          s3.upload(params, (err) => {
            if (err) {
              callback(err);
              return;
            }

            console.log(`Upload Finished: ${filename}.`);

            // Increment count
            count += 1;

            // Check if we are at the end of the forEach.
            if (files.length === count) {
              callback();
            }
          });
        });
      });
    });
  };

  return {
    apply,
  };
};

module.exports = UploadToS3;
