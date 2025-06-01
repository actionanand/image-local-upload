import { Injectable } from '@angular/core';

import { ConversionResult, ImageFormat } from '../models/image.model';

@Injectable({
  providedIn: 'root',
})
export class ImageConverterService {
  async convertImage(imageData: string, format: ImageFormat): Promise<ConversionResult> {
    try {
      // Create an image element from the base64 data
      const img = await this.createImageFromBase64(imageData);

      // Get MIME type for target format
      const mimeType = this.getMimeType(format);

      // Special handling for GIF to prevent large files
      if (format === 'gif') {
        return await this.convertToOptimizedFormat(img, format, mimeType, true);
      }

      // Regular conversion for other formats
      return await this.convertToOptimizedFormat(img, format, mimeType, false);
    } catch (error) {
      console.error('Conversion error:', error);
      throw new Error('Failed to convert image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
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

  async convertImageWithReducedQuality(
    imageData: string,
    format: ImageFormat,
    maxSizeBytes: number,
  ): Promise<ConversionResult> {
    // Create an image element from the base64 data
    const img = await this.createImageFromBase64(imageData);

    // Start with high quality and keep reducing until we get below target size
    let quality = 0.8;
    let scale = 1.0;
    let result: { blob: Blob; base64: string };
    let attempts = 0;
    const maxAttempts = 5;

    do {
      if (attempts > 0) {
        // Reduce quality and scale on subsequent attempts
        quality = Math.max(0.1, quality - 0.15);

        if (attempts > 2) {
          // After reducing quality twice, start reducing dimensions too
          scale = scale * 0.8;
        }
      }

      // Create a scaled canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Apply scaling to dimensions
      canvas.width = Math.floor(img.width * scale);
      canvas.height = Math.floor(img.height * scale);

      // Draw image at scaled size
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Get mime type
      const mimeType = this.getMimeType(format);

      // Convert to blob with reduced quality
      result = await new Promise<{ blob: Blob; base64: string }>((resolve, reject) => {
        canvas.toBlob(
          blob => {
            if (!blob) {
              reject(new Error('Failed to convert image'));
              return;
            }

            // Convert blob to base64
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                blob,
                base64: reader.result as string,
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          },
          mimeType,
          quality,
        );
      });

      attempts++;
    } while (result.blob.size > maxSizeBytes && attempts < maxAttempts);

    // Get original image size (approximate from base64)
    const originalSize = Math.ceil((imageData.length * 3) / 4);

    return {
      blob: result.blob,
      base64: result.base64,
      originalSize,
      convertedSize: result.blob.size,
      format,
      mimeType: this.getMimeType(format),
    };
  }

  private async convertToOptimizedFormat(
    img: HTMLImageElement,
    format: ImageFormat,
    mimeType: string,
    isGif: boolean,
  ): Promise<ConversionResult> {
    // For GIF, we use much more aggressive optimization
    const maxDimension = isGif ? 300 : 1200;
    const quality = isGif ? 0.7 : 0.9;

    // Scale down if needed
    let width = img.width;
    let height = img.height;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round(height * (maxDimension / width));
        width = maxDimension;
      } else {
        width = Math.round(width * (maxDimension / height));
        height = maxDimension;
      }
    }

    // Create canvas with specified dimensions
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // Draw image to canvas
    ctx.drawImage(img, 0, 0, width, height);

    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        b => {
          if (!b) reject(new Error('Failed to create blob'));
          else resolve(b);
        },
        mimeType,
        quality,
      );
    });

    // Convert to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Get original size (estimation)
    const originalSize = new Blob([img.src]).size;

    return {
      blob,
      base64,
      originalSize,
      convertedSize: blob.size,
      format,
      mimeType,
    };
  }
}
