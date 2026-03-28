import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV,
  mongoUri: process.env.MONGODB_URI,
  jwt: {
    secret: process.env.JWT_SECRET || "changeme",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "changeme_refresh",
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.AWS_BUCKET_NAME,
    region: process.env.AWS_REGION,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      "https://api.mememart.in/api/auth/google/callback",
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  allowedOrigins: (
    process.env.ALLOWED_ORIGINS ||
    "http://localhost:3000,https://mememart.in,https://www.mememart.in"
  )
    .split(",")
    .map((url) => url.trim()),
  admin: {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
    email: process.env.ADMIN_EMAIL,
  },
};

// Validate AWS configuration on startup
function validateAWSConfig() {
  const missingVars: string[] = [];

  if (!env.aws.accessKeyId) {
    missingVars.push("AWS_ACCESS_KEY_ID");
  }
  if (!env.aws.secretAccessKey) {
    missingVars.push("AWS_SECRET_ACCESS_KEY");
  }
  if (!env.aws.bucketName) {
    missingVars.push("AWS_BUCKET_NAME");
  }

  if (missingVars.length > 0) {
    console.warn(
      `[ENV] Missing AWS configuration variables: ${missingVars.join(", ")}`,
    );
    console.warn("[ENV] S3 uploads will fail until these variables are set");
  } else {
    console.log(
      "[ENV] AWS configuration validated - all required variables are present",
    );
    console.log(`[ENV] AWS Bucket: ${env.aws.bucketName}`);
    console.log(`[ENV] AWS Region: ${env.aws.region}`);
  }
}

validateAWSConfig();
