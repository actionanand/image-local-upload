import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';

import { ImageService } from '../../services/image';
import { ImageItem } from '../../models/image.model';
import { ConfirmationService } from '../../services/confirmation';
import { ToastService } from '../../services/toast';
import { FormatConversionModal } from '../format-conversion-modal/format-conversion-modal';

@Component({
  selector: 'app-image-gallery',
  imports: [NgIf, NgFor, DatePipe, FormatConversionModal],
  templateUrl: './image-gallery.html',
  styleUrls: ['./image-gallery.scss'],
})
export class ImageGallery implements OnInit {
  images: ImageItem[] = [];

  private imageService = inject(ImageService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  isConversionModalOpen = false;
  selectedImageForConversion: ImageItem | null = null;

  ngOnInit(): void {
    this.imageService.images$.subscribe(images => {
      this.images = images;
    });
  }

  openInNewWindow(image: ImageItem): void {
    // Create URL to detail view
    const url = `/detail/${image.id}`;
    window.open(url, '_blank');
  }

  async deleteImage(id: string, event: Event): Promise<void> {
    event.stopPropagation();

    const confirmed = await this.confirmationService.confirm('Are you sure you want to delete this image?');

    if (confirmed) {
      this.imageService.deleteImage(id);
      this.toastService.success('Image deleted successfully');
    }
  }

  openFormatConversion(image: ImageItem, event: Event): void {
    event.stopPropagation(); // Prevent opening detail view
    this.selectedImageForConversion = image;
    this.isConversionModalOpen = true;
  }

  closeFormatConversion(): void {
    this.isConversionModalOpen = false;
    this.selectedImageForConversion = null;
  }

  onImageConverted(convertedImage: ImageItem): void {
    this.imageService.addConvertedImage(convertedImage);
  }
}
