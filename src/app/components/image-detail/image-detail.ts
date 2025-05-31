import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
export class ImageDetail implements OnInit, OnDestroy {
  image?: ImageItem;
  objectUrl?: string;

  private route = inject(ActivatedRoute);
  private imageService = inject(ImageService);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.image = this.imageService.getImageById(id);
        if (this.image) {
          this.createObjectUrl();
        }
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
        .then(() => alert('URL copied to clipboard!'))
        .catch(err => console.error('Could not copy URL: ', err));
    }
  }

  copyBase64(): void {
    if (this.image?.base64) {
      navigator.clipboard
        .writeText(this.image.base64)
        .then(() => {
          alert('Base64 data copied to clipboard!');
        })
        .catch(err => {
          console.error('Could not copy Base64 data: ', err);
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
  }

  ngOnDestroy(): void {
    // Clean up the object URL to avoid memory leaks
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
  }
}
