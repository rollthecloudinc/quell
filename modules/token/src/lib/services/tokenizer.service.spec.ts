import { TestBed } from '@angular/core/testing';

import { TokenizerService } from './tokenizer.service';

describe('TokenizerService', () => {
  let service: TokenizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
