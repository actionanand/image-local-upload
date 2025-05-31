import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

import { ImageUpload } from './components/image-upload/image-upload';
import { ImageGallery } from './components/image-gallery/image-gallery';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgIf, ImageUpload, ImageGallery],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'Image Local Upload';

  protected router = inject(Router);
}
