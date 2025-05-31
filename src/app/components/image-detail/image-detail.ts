import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageService, ImageItem } from '../../services/image.service';

@Component({
  selector: 'app-image-detail',
  templateUrl: './image-detail.component.html',
  styleUrls: ['./image-detail.component.scss'],
})
export class ImageDetailComponent implements OnInit {
  image?: ImageItem;

  private route = inject(ActivatedRoute);
  private imageService = inject(ImageService);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.image = this.imageService.getImageById(id);
      }
    });
  }

  downloadImage(): void {
    if (!this.image) return;

    const link = document.createElement('a');
    link.href = this.image.base64;
    link.download = this.image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
