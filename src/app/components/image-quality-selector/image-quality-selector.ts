import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ImageQuality } from '../../models/image.model';

@Component({
  selector: 'app-image-quality-selector',
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './image-quality-selector.html',
  styleUrl: './image-quality-selector.scss',
})
export class ImageQualitySelector {
  @Input() showSelector = false;
  @Input() selectedQuality: ImageQuality = 'original';
  @Output() qualitySelected = new EventEmitter<ImageQuality>();

  qualityOptions = [
    {
      value: 'original' as ImageQuality,
      label: 'Original',
      description: 'Keep the original image quality',
    },
    {
      value: 'optimized' as ImageQuality,
      label: 'Optimized',
      description: 'Good quality with moderate file size reduction',
    },
    {
      value: 'medium' as ImageQuality,
      label: 'Medium',
      description: 'Medium quality with better compression',
    },
    {
      value: 'low' as ImageQuality,
      label: 'Low',
      description: 'Low quality with maximum compression',
    },
  ];

  selectQuality(quality: ImageQuality): void {
    this.selectedQuality = quality;
    this.qualitySelected.emit(quality);
  }
}
