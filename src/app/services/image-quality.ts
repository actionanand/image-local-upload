import { Injectable } from '@angular/core';

import { ImageQuality, ReducedImage } from '../models/image.model';

@Injectable({
  providedIn: 'root',
})
export class ImageQualityService {
  /**
   * Reduces the quality of an image based on the selected quality option
   */
  async reduceImageQuality(file: File, quality: ImageQuality): Promise<ReducedImage> {
    // Return original if quality is set to original
    if (quality === 'original') {
      const base64 = await this.fileToBase64(file);
      return {
        blob: file,
        base64,
        originalSize: file.size,
        reducedSize: file.size,
        quality,
        compressionRatio: 1,
      };
    }

    // Set quality levels based on selection
    const qualityLevel = this.getQualityLevel(quality);

    // Create an image from the file
    const image = await this.createImageFromFile(file);

    // Compress the image using canvas
    const { blob, base64 } = await this.compressImage(image, qualityLevel);

    // Calculate compression ratio
    const compressionRatio = blob.size / file.size;

    return {
      blob,
      base64,
      originalSize: file.size,
      reducedSize: blob.size,
      quality,
      compressionRatio,
    };
  }

  private getQualityLevel(quality: ImageQuality): number {
    switch (quality) {
      case 'optimized':
        return 0.85;
      case 'medium':
        return 0.6;
      case 'low':
        return 0.3;
      default:
        return 0.9;
    }
  }

  private createImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private async compressImage(img: HTMLImageElement, quality: number): Promise<{ blob: Blob; base64: string }> {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Set canvas dimensions to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw image onto canvas
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Convert to blob with quality setting
    const blob = await new Promise<Blob>(resolve => {
      canvas.toBlob(
        blob => {
          resolve(blob!);
        },
        'image/jpeg',
        quality,
      );
    });

    // Convert to base64
    const base64 = await this.blobToBase64(blob);

    return { blob, base64 };
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Format bytes to human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
