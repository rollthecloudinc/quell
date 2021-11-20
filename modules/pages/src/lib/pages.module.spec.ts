import { TestBed, waitForAsync } from '@angular/core/testing';
import { PagesModule } from './pages.module';

describe('PagesModule', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PagesModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(PagesModule).toBeDefined();
  });
});
