import { Component, inject, OnInit } from '@angular/core';
import { ImageService, ImageItem } from '../../services/image.service';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss'],
})
export class ImageGalleryComponent implements OnInit {
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
