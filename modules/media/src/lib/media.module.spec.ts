import { async, TestBed } from '@angular/core/testing';
import { MediaModule } from './media.module';

describe('MediaModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MediaModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(MediaModule).toBeDefined();
  });
});
