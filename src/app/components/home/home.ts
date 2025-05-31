import { Component } from '@angular/core';

import { ImageUpload } from '../image-upload/image-upload';
import { ImageGallery } from '../image-gallery/image-gallery';

@Component({
  selector: 'app-home',
  imports: [ImageUpload, ImageGallery],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
