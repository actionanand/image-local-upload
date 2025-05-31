import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ImageItem {
  id: string;
  name: string;
  base64: string;
  type: string;
  date: Date;
}

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

  uploadImage(file: File): Promise<ImageItem> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = event => {
        const base64 = event.target?.result as string;

        const newImage: ImageItem = {
          id: Date.now().toString(),
          name: file.name,
          base64: base64,
          type: file.type,
          date: new Date(),
        };

        this.images.push(newImage);
        this.saveImages();
        resolve(newImage);
      };

      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
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
