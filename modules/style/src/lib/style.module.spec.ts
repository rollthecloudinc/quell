import { async, TestBed } from '@angular/core/testing';
import { StyleModule } from './style.module';

describe('StyleModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StyleModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(StyleModule).toBeDefined();
  });
});
