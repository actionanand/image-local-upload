import { Component, inject } from '@angular/core';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
})
export class ImageUploadComponent {
  isUploading = false;
  errorMessage = '';

  private imageService = inject(ImageService);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select an image file';
      return;
    }

    this.errorMessage = '';
    this.isUploading = true;

    this.imageService
      .uploadImage(file)
      .then(() => {
        this.isUploading = false;
        // Reset input
        input.value = '';
      })
      .catch((error: Error) => {
        console.error('Upload error:', error);
        this.errorMessage = 'Failed to upload image';
        this.isUploading = false;
      });
  }
}
