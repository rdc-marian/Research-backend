const { S3Client } = require("@aws-sdk/client-s3");

const isS3Configured = () =>
  Boolean(
    process.env.AWS_REGION &&
      process.env.AWS_S3_BUCKET &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
  );

let s3Client;

const configureS3 = () => {
  if (!isS3Configured()) {
    return false;
  }

  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  return true;
};

const getS3Client = () => {
  if (!s3Client) {
    throw new Error("S3 client is not configured");
  }
  return s3Client;
};

module.exports = { configureS3, getS3Client, isS3Configured };
