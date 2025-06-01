import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormatConversionModal } from './format-conversion-modal';

describe('FormatConversionModal', () => {
  let component: FormatConversionModal;
  let fixture: ComponentFixture<FormatConversionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormatConversionModal],
    }).compileComponents();

    fixture = TestBed.createComponent(FormatConversionModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
