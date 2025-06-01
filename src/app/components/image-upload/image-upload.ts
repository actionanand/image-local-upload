import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';

import { ImageService } from '../../services/image';
import { ImageQuality } from '../../models/image.model';
import { ImageQualityService } from '../../services/image-quality';
import { ToastService } from '../../services/toast';
import { ImageQualitySelector } from '../image-quality-selector/image-quality-selector';
import { FileSizePipe } from '../../shared/pipes/file-size-pipe';

@Component({
  selector: 'app-image-upload',
  imports: [NgIf, ImageQualitySelector, FileSizePipe],
  templateUrl: './image-upload.html',
  styleUrls: ['./image-upload.scss'],
})
export class ImageUpload {
  isUploading = false;
  errorMessage = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  selectedQuality: ImageQuality = 'original';

  private imageService = inject(ImageService);
  private imageQualityService = inject(ImageQualityService);
  private toastService = inject(ToastService);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select an image file';
      return;
    }

    this.errorMessage = '';
    this.selectedFile = file;

    // Create preview
    this.createPreview(file);
  }

  private createPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = e => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onQualitySelected(quality: ImageQuality): void {
    this.selectedQuality = quality;
  }

  async uploadImage(): Promise<void> {
    if (!this.selectedFile) {
      return;
    }

    this.isUploading = true;

    try {
      // Process the image with selected quality
      const reducedImage = await this.imageQualityService.reduceImageQuality(this.selectedFile, this.selectedQuality);

      // Upload the processed image
      await this.imageService.uploadImage({
        file: this.selectedFile,
        base64: reducedImage.base64,
        quality: this.selectedQuality,
        originalSize: reducedImage.originalSize,
        reducedSize: reducedImage.reducedSize,
        compressionRatio: reducedImage.compressionRatio,
      });

      // Display success message with size info
      const originalSizeFormatted = this.imageQualityService.formatFileSize(reducedImage.originalSize);
      const reducedSizeFormatted = this.imageQualityService.formatFileSize(reducedImage.reducedSize);

      if (this.selectedQuality !== 'original') {
        const savingPercentage = ((1 - reducedImage.compressionRatio) * 100).toFixed(0);
        this.toastService.success(
          `Image uploaded! Size reduced from ${originalSizeFormatted} to ${reducedSizeFormatted} (${savingPercentage}% saved)`,
        );
      } else {
        this.toastService.success(`Image uploaded! Size: ${originalSizeFormatted}`);
      }

      // Reset the form
      this.resetForm();
    } catch (error) {
      console.error('Upload error:', error);
      this.errorMessage = 'Failed to upload image';
      this.toastService.error('Failed to upload image');
    } finally {
      this.isUploading = false;
    }
  }

  cancelUpload(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.selectedQuality = 'original';
    this.errorMessage = '';

    // Reset file input
    const input = document.getElementById('file-input') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }
}
