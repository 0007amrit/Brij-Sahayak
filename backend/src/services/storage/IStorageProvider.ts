export interface IStorageProvider {
  getAssetUrl(relativePath: string): string;
  saveAsset(filename: string, content: Buffer): Promise<string>;
}
