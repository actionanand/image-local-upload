import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { ImageItem, UploadOptions } from '../models/image.model';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private images: ImageItem[] = [];
  private imagesSubject = new BehaviorSubject<ImageItem[]>([]);

  images$ = this.imagesSubject.asObservable();

  constructor() {
    // Load images from localStorage on service initialization
    this.loadImages();
  }

  private loadImages(): void {
    const storedImages = localStorage.getItem('uploadedImages');
    if (storedImages) {
      this.images = JSON.parse(storedImages);
      this.imagesSubject.next([...this.images]);
    }
  }

  private saveImages(): void {
    localStorage.setItem('uploadedImages', JSON.stringify(this.images));
    this.imagesSubject.next([...this.images]);
  }

  uploadImage(options: UploadOptions): Promise<ImageItem> {
    return new Promise(resolve => {
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

      this.images.push(newImage);
      this.saveImages();
      resolve(newImage);
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
}
