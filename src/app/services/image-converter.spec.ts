import { TestBed } from '@angular/core/testing';

import { ImageConverter } from './image-converter';

describe('ImageConverter', () => {
  let service: ImageConverter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageConverter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
