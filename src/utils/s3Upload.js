const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getS3Client } = require("../config/s3");

const buildObjectKey = ({ folder = "uploads", originalName = "file" }) => {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  return `${folder}/${timestamp}-${random}-${safeName}`;
};

const uploadBuffer = async (buffer, options = {}) => {
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  const key = buildObjectKey({
    folder: options.folder,
    originalName: options.originalName,
  });

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: options.contentType,
  });

  await getS3Client().send(command);

  return {
    key,
    url: `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
  };
};

module.exports = { uploadBuffer };
