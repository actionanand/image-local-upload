import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ImageQuality } from '../../models/image.model';

@Component({
  selector: 'app-image-quality-selector',
  imports: [NgFor, FormsModule],
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

  onOptionKeydown(event: KeyboardEvent, quality: ImageQuality, index: number): void {
    // For space or enter, select the option
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectQuality(quality);
      return;
    }

    // Handle arrow navigation
    let nextIndex = -1;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      nextIndex = (index + 1) % this.qualityOptions.length;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      nextIndex = (index - 1 + this.qualityOptions.length) % this.qualityOptions.length;
    }

    // Focus the next element if navigation happened
    if (nextIndex >= 0) {
      const nextElement = document.getElementById(`quality-option-${nextIndex}`);
      if (nextElement) {
        nextElement.focus();
        // Optionally also select it
        this.selectQuality(this.qualityOptions[nextIndex].value);
      }
    }
  }

  // Additional helper method to handle focus management
  focusSelectedOption(): void {
    setTimeout(() => {
      const index = this.qualityOptions.findIndex(option => option.value === this.selectedQuality);
      if (index >= 0) {
        const element = document.getElementById(`quality-option-${index}`);
        if (element) {
          element.focus();
        }
      }
    }, 0);
  }

  selectQuality(quality: ImageQuality): void {
    this.selectedQuality = quality;
    this.qualitySelected.emit(quality);
  }
}
