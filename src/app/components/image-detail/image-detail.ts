import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, NgIf } from '@angular/common';

import { ImageService } from '../../services/image';
import { ImageItem } from '../../models/image.model';

@Component({
  selector: 'app-image-detail',
  imports: [NgIf, DatePipe],
  templateUrl: './image-detail.html',
  styleUrls: ['./image-detail.scss'],
})
export class ImageDetail implements OnInit {
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
