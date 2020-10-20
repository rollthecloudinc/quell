import { async, TestBed } from '@angular/core/testing';
import { PagesModule } from './pages.module';

describe('PagesModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [PagesModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(PagesModule).toBeDefined();
  });
});
