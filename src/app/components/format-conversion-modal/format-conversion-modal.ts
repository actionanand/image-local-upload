import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';

import { ImageFormat, ImageItem } from '../../models/image.model';
import { ImageConverterService } from '../../services/image-converter';
import { ToastService } from '../../services/toast';
import { ConfirmationService } from '../../services/confirmation';

@Component({
  selector: 'app-format-conversion-modal',
  imports: [NgIf, NgFor],
  templateUrl: './format-conversion-modal.html',
  styleUrl: './format-conversion-modal.scss',
})
export class FormatConversionModal {
  @Input() isOpen = false;
  @Input() image: ImageItem | null = null;
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() close = new EventEmitter<void>();
  @Output() converted = new EventEmitter<ImageItem>();

  selectedFormat: ImageFormat | null = null;
  isConverting = false;

  availableFormats = [
    { value: 'jpeg' as ImageFormat, label: 'JPEG', icon: '🖼️' },
    { value: 'png' as ImageFormat, label: 'PNG', icon: '📊' },
    { value: 'webp' as ImageFormat, label: 'WebP', icon: '🌐' },
    { value: 'gif' as ImageFormat, label: 'GIF', icon: '🎭' },
  ];

  private imageConverter = inject(ImageConverterService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  getCurrentFormat(): string {
    if (!this.image) return '';

    const format = this.imageConverter.getFormatFromMimeType(this.image.type);
    return format.toUpperCase();
  }

  isCurrentFormat(format: ImageFormat): boolean {
    if (!this.image) return false;
    const currentFormat = this.imageConverter.getFormatFromMimeType(this.image.type);
    return currentFormat === format;
  }

  selectFormat(format: ImageFormat): void {
    this.selectedFormat = format;
  }

  closeModal(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }

  onClose() {
    this.close.emit();
  }

  async convertImage(): Promise<void> {
    if (!this.image || !this.selectedFormat || this.isConverting) return;

    this.isConverting = true;

    try {
      // First try regular conversion
      const result = await this.imageConverter.convertImage(this.image.base64, this.selectedFormat);

      // Check if size exceeds localStorage limits (typically around 5MB)
      const MAX_RECOMMENDED_SIZE = 4 * 1024 * 1024; // 4MB
      if (result.convertedSize > MAX_RECOMMENDED_SIZE) {
        this.isConverting = false; // Pause the conversion

        // Ask user for confirmation to reduce quality
        const confirmed = await this.confirmationService.confirm(
          `The converted image (${this.formatSize(result.convertedSize)}) is too large for storage. Would you like to reduce its quality to fit?`,
        );

        if (!confirmed) {
          this.toastService.info('Conversion cancelled');
          return; // Cancel the operation
        }

        // User confirmed, restart conversion with reduced quality
        this.isConverting = true;

        // Convert again with reduced quality/dimensions
        const reducedResult = await this.imageConverter.convertImageWithReducedQuality(
          this.image.base64,
          this.selectedFormat,
          MAX_RECOMMENDED_SIZE,
        );

        // Create the image with reduced quality
        const convertedImage: ImageItem = {
          id: Date.now().toString(),
          name: this.generateNewFilename(this.image.name, this.selectedFormat),
          base64: reducedResult.base64,
          type: reducedResult.mimeType,
          date: new Date(),
          originalSize: reducedResult.originalSize,
          reducedSize: reducedResult.convertedSize,
          quality: 'medium', // Mark as reduced quality
          compressionRatio: reducedResult.convertedSize / reducedResult.originalSize,
        };

        this.converted.emit(convertedImage);
        this.toastService.success(`Image converted and resized to fit storage limits`);
        this.close.emit();
      } else {
        // Size is acceptable, proceed normally
        const convertedImage: ImageItem = {
          id: Date.now().toString(),
          name: this.generateNewFilename(this.image.name, this.selectedFormat),
          base64: result.base64,
          type: result.mimeType,
          date: new Date(),
          originalSize: result.originalSize,
          reducedSize: result.convertedSize,
          quality: 'original',
          compressionRatio: result.convertedSize / result.originalSize,
        };

        this.converted.emit(convertedImage);
        this.toastService.success(`Image converted to ${this.selectedFormat.toUpperCase()}`);
        this.close.emit();
      }
    } catch (error) {
      console.error('Conversion error:', error);
      this.toastService.error('Failed to convert image');
    } finally {
      this.isConverting = false;
    }
  }

  // Helper method to format file size
  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private generateNewFilename(originalName: string, format: ImageFormat): string {
    // Remove the original extension
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const extension = this.imageConverter.getExtensionFromFormat(format);
    return `${baseName}-converted.${extension}`;
  }
}
