import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { isDevMode } from '@angular/core';

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
  private router = inject(Router);

  isConversionModalOpen = false;
  selectedImageForConversion: ImageItem | null = null;

  ngOnInit(): void {
    this.imageService.images$.subscribe(images => {
      this.images = images;
    });
  }

  openInNewWindow(image: ImageItem): void {
    // Create URL to detail view with the proper base URL
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}/detail/${image.id}`;

    /*
    const urlTree = this.router.createUrlTree(['/detail', image.id]);
    const url = window.location.origin + this.router.serializeUrl(urlTree);
    */

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
    // Pass the converted image to the service, which returns success/failure
    const success = this.imageService.addConvertedImage(convertedImage);

    if (success) {
      // Only show success message if storage succeeded
      if (convertedImage.quality === 'medium') {
        this.toastService.success(`Image converted and resized to fit storage limits`);
      } else {
        this.toastService.success(`Image converted to ${convertedImage.type.split('/')[1].toUpperCase()}`);
      }
    }
    // The error case is handled by the image service

    // Always close the modal
    this.closeFormatConversion();
  }

  onImagePreviewKeyup(event: KeyboardEvent, image: ImageItem): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.openInNewWindow(image);
    }
  }

  private getBaseUrl(): string {
    // In dev mode use root path, in production determine from location
    if (isDevMode()) {
      return '';
    }

    // For GitHub Pages, extract the repository name from the URL
    const pathArray = window.location.pathname.split('/');

    // If deployed to a subdirectory (like a GitHub repo name)
    if (pathArray.length > 1 && pathArray[1] !== '') {
      return `/${pathArray[1]}`;
    }

    return '';
  }
}
