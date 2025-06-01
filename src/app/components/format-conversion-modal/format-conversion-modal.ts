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

  async convertImage(): Promise<void> {
    if (!this.image || !this.selectedFormat || this.isConverting) return;

    this.isConverting = true;

    try {
      const result = await this.imageConverter.convertImage(this.image.base64, this.selectedFormat);

      // Create a new image with converted format
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
    } catch (error) {
      console.error('Conversion error:', error);
      this.toastService.error('Failed to convert image');
    } finally {
      this.isConverting = false;
    }
  }

  private generateNewFilename(originalName: string, format: ImageFormat): string {
    // Remove the original extension
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const extension = this.imageConverter.getExtensionFromFormat(format);
    return `${baseName}-converted.${extension}`;
  }
}
