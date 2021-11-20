import { TestBed, waitForAsync } from '@angular/core/testing';
import { StyleModule } from './style.module';

describe('StyleModule', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [StyleModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(StyleModule).toBeDefined();
  });
});
