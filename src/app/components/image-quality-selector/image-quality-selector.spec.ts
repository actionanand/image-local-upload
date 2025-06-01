import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageQualitySelector } from './image-quality-selector';

describe('ImageQualitySelector', () => {
  let component: ImageQualitySelector;
  let fixture: ComponentFixture<ImageQualitySelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageQualitySelector],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageQualitySelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
