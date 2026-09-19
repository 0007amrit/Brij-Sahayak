import { IStorageProvider } from './IStorageProvider.js';
import path from 'path';
import fs from 'fs';

export class LocalStorageProvider implements IStorageProvider {
  private baseDir: string;
  private publicUrlPrefix: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), 'public/assets');
    this.publicUrlPrefix = '/assets';
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  getAssetUrl(relativePath: string): string {
    // If it's already an absolute or web URL, return it
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    return `${this.publicUrlPrefix}/${relativePath.replace(/^\//, '')}`;
  }

  async saveAsset(filename: string, content: Buffer): Promise<string> {
    const destPath = path.join(this.baseDir, filename);
    fs.writeFileSync(destPath, content);
    return `${this.publicUrlPrefix}/${filename}`;
  }
}
