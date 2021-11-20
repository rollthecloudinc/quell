import { TestBed, waitForAsync } from '@angular/core/testing';
import { ContentModule } from './content.module';

describe('ContentModule', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ContentModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ContentModule).toBeDefined();
  });
});
