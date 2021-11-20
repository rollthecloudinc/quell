import { TestBed, waitForAsync } from '@angular/core/testing';
import { AttributesModule } from './attributes.module';

describe('AttributesModule', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AttributesModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(AttributesModule).toBeDefined();
  });
});
