import { TestBed, waitForAsync } from '@angular/core/testing';
import { MediaModule } from './media.module';

describe('MediaModule', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MediaModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(MediaModule).toBeDefined();
  });
});
