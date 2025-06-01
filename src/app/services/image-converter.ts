import { Injectable } from '@angular/core';

import { ConversionResult, ImageFormat } from '../models/image.model';

@Injectable({
  providedIn: 'root',
})
export class ImageConverterService {
  async convertImage(imageData: string, format: ImageFormat): Promise<ConversionResult> {
    // Create an image element from the base64 data
    const img = await this.createImageFromBase64(imageData);

    // Convert the image to the desired format
    const mimeType = this.getMimeType(format);
    const { blob, base64 } = await this.convertToFormat(img, format, mimeType);

    // Get original image size (approximate from base64)
    const originalSize = Math.ceil((imageData.length * 3) / 4);

    return {
      blob,
      base64,
      originalSize,
      convertedSize: blob.size,
      format,
      mimeType,
    };
  }

  private getMimeType(format: ImageFormat): string {
    switch (format) {
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'gif':
        return 'image/gif';
      default:
        return 'image/jpeg';
    }
  }

  private createImageFromBase64(base64Data: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = base64Data;
    });
  }

  private convertToFormat(
    img: HTMLImageElement,
    format: ImageFormat,
    mimeType: string,
  ): Promise<{ blob: Blob; base64: string }> {
    return new Promise((resolve, reject) => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Convert to desired format
        canvas.toBlob(blob => {
          if (!blob) {
            reject(new Error('Failed to convert image'));
            return;
          }

          // Convert blob to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              blob,
              base64: reader.result as string,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }, mimeType);
      } catch (err) {
        reject(err);
      }
    });
  }

  getFormatFromMimeType(mimeType: string): ImageFormat {
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpeg';
    if (mimeType.includes('png')) return 'png';
    if (mimeType.includes('webp')) return 'webp';
    if (mimeType.includes('gif')) return 'gif';
    return 'jpeg'; // Default
  }

  getExtensionFromFormat(format: ImageFormat): string {
    switch (format) {
      case 'jpeg':
        return 'jpg';
      default:
        return format;
    }
  }
}
