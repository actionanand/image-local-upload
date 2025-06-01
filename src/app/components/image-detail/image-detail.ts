import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, NgIf } from '@angular/common';

import { ImageService } from '../../services/image';
import { ImageItem, ImageQuality } from '../../models/image.model';
import { ToastService } from '../../services/toast';
import { ImageQualityService } from '../../services/image-quality';

@Component({
  selector: 'app-image-detail',
  imports: [NgIf, DatePipe],
  templateUrl: './image-detail.html',
  styleUrls: ['./image-detail.scss'],
})
export class ImageDetail implements OnInit, OnDestroy {
  image?: ImageItem;
  objectUrl?: string;
  imageNotFound = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private imageService = inject(ImageService);
  private toastService = inject(ToastService);
  private imageQualityService = inject(ImageQualityService);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.image = this.imageService.getImageById(id);
        if (this.image) {
          this.createObjectUrl();
          this.imageNotFound = false;
        } else {
          this.imageNotFound = true; // Set flag when image not found
        }
      } else {
        this.imageNotFound = true;
      }
    });
  }

  createObjectUrl(): void {
    if (!this.image) return;

    // Convert base64 to Blob
    const base64Response = fetch(this.image.base64);
    base64Response
      .then(res => res.blob())
      .then(blob => {
        // Create object URL from Blob
        this.objectUrl = URL.createObjectURL(blob);
      });
  }

  openInNewTab(): void {
    if (this.objectUrl) {
      window.open(this.objectUrl, '_blank');
    }
  }

  copyObjectUrl(): void {
    if (this.objectUrl) {
      navigator.clipboard
        .writeText(this.objectUrl)
        .then(() => this.toastService.success('URL copied to clipboard!'))
        .catch(err => {
          console.error('Could not copy URL: ', err);
          this.toastService.error('Failed to copy URL');
        });
    }
  }

  copyBase64(): void {
    if (this.image?.base64) {
      navigator.clipboard
        .writeText(this.image.base64)
        .then(() => {
          this.toastService.success('Base64 data copied to clipboard!');
        })
        .catch(err => {
          console.error('Could not copy Base64 data: ', err);
          this.toastService.error('Failed to copy Base64 data');
        });
    }
  }

  downloadImage(): void {
    if (!this.image) return;

    const link = document.createElement('a');
    link.href = this.image.base64;
    link.download = this.image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.info('Download started');
  }

  getQualityLabel(quality: ImageQuality): string {
    switch (quality) {
      case 'optimized':
        return 'Optimized';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return 'Original';
    }
  }

  formatSize(bytes: number): string {
    return this.imageQualityService.formatFileSize(bytes);
  }

  getSavingsPercentage(image: ImageItem): string {
    if (image.quality === 'original' || !image.compressionRatio) {
      return '0';
    }

    return ((1 - image.compressionRatio) * 100).toFixed(0);
  }

  returnToGallery(): void {
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    // Clean up the object URL to avoid memory leaks
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
  }
}
