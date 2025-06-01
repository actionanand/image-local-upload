import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';

import { ImageFormat, ImageItem } from '../../models/image.model';
import { ImageConverterService } from '../../services/image-converter';
import { ToastService } from '../../services/toast';

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
  private imageConverterService = inject(ImageConverterService);
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

  closeModal(event: Event): void {
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
    // const MAX_RECOMMENDED_SIZE = 4 * 1024 * 1024; // 4MB

    try {
      // First attempt conversion
      const result = await this.imageConverterService.convertImage(this.image.base64, this.selectedFormat);

      // Create a properly formatted image object
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

      // Just emit the converted image - let parent component handle success/failure
      this.converted.emit(convertedImage);
      this.close.emit();
    } catch (error) {
      console.error('Error during conversion:', error);
      this.toastService.error('Failed to convert image format');
      this.close.emit();
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
