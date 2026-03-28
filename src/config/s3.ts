import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env';
import { logger } from '../utils/logger';

logger.info('[S3Config] Initializing S3 client...');
logger.debug(`[S3Config] Region: ${env.aws.region}`);
logger.debug(`[S3Config] Bucket: ${env.aws.bucketName}`);
logger.debug(`[S3Config] Access Key ID present: ${!!env.aws.accessKeyId}`);
logger.debug(`[S3Config] Secret Access Key present: ${!!env.aws.secretAccessKey}`);

export const s3Client = new S3Client({
  region: env.aws.region!,
  credentials: {
    accessKeyId: env.aws.accessKeyId!,
    secretAccessKey: env.aws.secretAccessKey!,
  },
});

logger.info('[S3Config] S3 client initialized successfully');
