import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';

import { ImageService } from '../../services/image';
import { ImageItem } from '../../models/image.model';

@Component({
  selector: 'app-image-gallery',
  imports: [NgIf, NgFor, DatePipe],
  templateUrl: './image-gallery.html',
  styleUrls: ['./image-gallery.scss'],
})
export class ImageGallery implements OnInit {
  images: ImageItem[] = [];

  private imageService = inject(ImageService);

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

  deleteImage(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this image?')) {
      this.imageService.deleteImage(id);
    }
  }
}
