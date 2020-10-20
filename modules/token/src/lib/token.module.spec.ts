import { async, TestBed } from '@angular/core/testing';
import { TokenModule } from './token.module';

describe('TokenModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TokenModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(TokenModule).toBeDefined();
  });
});
