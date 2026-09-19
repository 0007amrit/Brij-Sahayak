import { IStorageProvider } from './IStorageProvider.js';
import { LocalStorageProvider } from './LocalStorageProvider.js';
import { S3StorageProvider } from './S3StorageProvider.js';

export class StorageService {
  private provider: IStorageProvider;

  constructor() {
    const providerType = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();
    if (providerType === 's3') {
      console.log('[StorageService] Initializing S3 Storage Provider');
      this.provider = new S3StorageProvider();
    } else {
      console.log('[StorageService] Initializing Local Storage Provider');
      this.provider = new LocalStorageProvider();
    }
  }

  getUrl(path: string): string {
    return this.provider.getAssetUrl(path);
  }
}

export const storageService = new StorageService();
