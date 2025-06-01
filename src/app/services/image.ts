import { inject, Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { ImageItem, UploadOptions } from '../models/image.model';
import { ToastService } from './toast';
import { environment as env } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private images: ImageItem[] = [];
  private imagesSubject = new BehaviorSubject<ImageItem[]>([]);

  images$ = this.imagesSubject.asObservable();

  private toastService = inject(ToastService);

  // Track if storage is in error state
  private storageErrorState = false;

  constructor() {
    // Load images from localStorage on service initialization
    this.loadImages();
  }

  private loadImages(): void {
    try {
      const storedImages = localStorage.getItem('uploadedImages');
      if (storedImages) {
        this.images = JSON.parse(storedImages);
        this.imagesSubject.next([...this.images]);
      }
      // Reset error state on successful load
      this.storageErrorState = false;
    } catch (error) {
      console.error('Failed to load images from storage', error);
      this.toastService.error('Failed to load saved images');
      this.images = [];
      this.imagesSubject.next([]);
    }
  }

  private saveImages(): boolean {
    try {
      localStorage.setItem('uploadedImages', JSON.stringify(this.images));
      this.imagesSubject.next([...this.images]);
      return true;
    } catch (error) {
      console.error('Failed to save images to storage', error);

      // Show appropriate error message
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.toastService.error('Storage limit reached. Please delete some images first.');
      } else {
        this.toastService.error('Failed to save images.');
      }

      return false;
    }
  }

  isFileTooLarge(file: File): boolean {
    const MAX_FILE_SIZE_MB = env.MAX_FILE_SIZE_MB || 5;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    return file.size > MAX_FILE_SIZE_BYTES;
  }

  uploadImage(options: UploadOptions): Promise<ImageItem | null> {
    return new Promise(resolve => {
      try {
        // Double check size constraint if file is provided
        if (options.file && this.isFileTooLarge(options.file)) {
          this.toastService.error(`File is too large. Maximum size is 5 MB.`);
          resolve(null);
          return;
        }

        const newImage: ImageItem = {
          id: Date.now().toString(),
          name: options.file.name,
          base64: options.base64,
          type: options.file.type,
          date: new Date(),
          originalSize: options.originalSize,
          reducedSize: options.reducedSize,
          quality: options.quality,
          compressionRatio: options.compressionRatio,
        };

        // First check if adding this would exceed quota (before we try to add it)
        const testArray = [...this.images, newImage];
        const testString = JSON.stringify(testArray);
        const estimatedSize = new Blob([testString]).size;
        const MAX_SAFE_SIZE = 4 * 1024 * 1024; // 4MB to be safe

        if (estimatedSize > MAX_SAFE_SIZE) {
          console.warn('Image too large for storage', estimatedSize);
          this.toastService.error('Image is too large for storage. Try a smaller image or different format.');
          resolve(null);
          return;
        }

        // Try to save the image
        this.images.push(newImage);

        try {
          localStorage.setItem('uploadedImages', JSON.stringify(this.images));
          this.imagesSubject.next([...this.images]);
          resolve(newImage);
        } catch (error) {
          console.error('Failed to save images to storage', error);

          // Remove the image we just tried to add
          this.images.pop();
          this.imagesSubject.next([...this.images]);

          // Show error message
          if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            this.toastService.error('Storage limit reached. Please delete some images first.');
          } else {
            this.toastService.error('Failed to save image.');
          }

          // Return null to indicate failure
          resolve(null);
        }
      } catch (error) {
        console.error('Error in uploadImage:', error);
        this.toastService.error('Failed to process image upload.');
        resolve(null);
      }
    });
  }

  getImages(): ImageItem[] {
    return [...this.images];
  }

  getImageById(id: string): ImageItem | undefined {
    return this.images.find(img => img.id === id);
  }

  deleteImage(id: string): void {
    this.images = this.images.filter(img => img.id !== id);
    this.saveImages();
  }

  addConvertedImage(convertedImage: ImageItem): boolean {
    // Check if we're in an error state first
    if (this.storageErrorState) {
      this.toastService.error(
        'Cannot save image - storage limit reached. Please delete some images and refresh the page.',
      );
      return false;
    }

    // Check size before attempting to save
    try {
      // Quick test to see if this would exceed quota
      const testArray = [...this.images, convertedImage];
      const testString = JSON.stringify(testArray);

      // Estimate size (in bytes) - localStorage typically has 5-10MB limit
      const estimatedSize = new Blob([testString]).size;
      const MAX_SAFE_SIZE = 4 * 1024 * 1024; // 4MB to be safe

      if (estimatedSize > MAX_SAFE_SIZE) {
        this.toastService.error('Image is too large for storage. Try a different format or smaller image.');
        return false;
      }

      // If we get here, it might fit
      this.images.push(convertedImage);
      const saved = this.saveImages();

      if (!saved) {
        // If save failed, remove the item we just added
        this.images.pop();
      }

      return saved;
    } catch (error) {
      console.error('Error checking or saving image:', error);
      this.toastService.error('Failed to save converted image');
      return false;
    }
  }

  clearStorageErrorState(): void {
    this.storageErrorState = false;
  }
}
