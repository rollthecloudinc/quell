import { TestBed, waitForAsync } from '@angular/core/testing';
import { ContextModule } from './context.module';

describe('ContextModule', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ContextModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ContextModule).toBeDefined();
  });
});
