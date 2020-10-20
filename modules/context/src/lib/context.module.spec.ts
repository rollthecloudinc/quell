import { async, TestBed } from '@angular/core/testing';
import { ContextModule } from './context.module';

describe('ContextModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ContextModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ContextModule).toBeDefined();
  });
});
