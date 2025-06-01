import { TestBed } from '@angular/core/testing';

import { ImageQuality } from './image-quality';

describe('ImageQuality', () => {
  let service: ImageQuality;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageQuality);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
