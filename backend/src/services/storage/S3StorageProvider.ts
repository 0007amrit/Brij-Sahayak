import { IStorageProvider } from './IStorageProvider.js';

export class S3StorageProvider implements IStorageProvider {
  private bucketName: string;
  private region: string;

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME || 'brajsahayak-assets';
    this.region = process.env.AWS_REGION || 'ap-south-1';
  }

  getAssetUrl(relativePath: string): string {
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${relativePath.replace(/^\//, '')}`;
  }

  async saveAsset(filename: string, content: Buffer): Promise<string> {
    // AWS SDK S3 PutObjectCommand will be executed here during Phase 2
    console.log(`[S3StorageProvider] S3 mock upload for ${filename} to ${this.bucketName}`);
    return this.getAssetUrl(filename);
  }
}
