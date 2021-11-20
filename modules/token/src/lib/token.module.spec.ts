import { TestBed, waitForAsync } from '@angular/core/testing';
import { TokenModule } from './token.module';

describe('TokenModule', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TokenModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(TokenModule).toBeDefined();
  });
});
