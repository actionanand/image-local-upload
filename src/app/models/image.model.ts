export interface ImageItem {
  id: string;
  name: string;
  base64: string;
  type: string;
  date: Date;
  originalSize: number;
  reducedSize: number;
  quality: ImageQuality;
  compressionRatio: number;
}

export interface ConfirmationRequest {
  message: string;
  resolve: (result: boolean) => void;
}

export interface ReducedImage {
  blob: Blob;
  base64: string;
  originalSize: number;
  reducedSize: number;
  quality: ImageQuality;
  compressionRatio: number;
}

export type ImageQuality = 'original' | 'optimized' | 'medium' | 'low';
export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'gif';

export interface UploadOptions {
  file: File;
  base64: string;
  quality: ImageQuality;
  originalSize: number;
  reducedSize: number;
  compressionRatio: number;
}

export interface ConversionResult {
  blob: Blob;
  base64: string;
  originalSize: number;
  convertedSize: number;
  format: ImageFormat;
  mimeType: string;
}
