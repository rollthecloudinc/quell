import { async, TestBed } from '@angular/core/testing';
import { AttributesModule } from './attributes.module';

describe('AttributesModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AttributesModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(AttributesModule).toBeDefined();
  });
});
