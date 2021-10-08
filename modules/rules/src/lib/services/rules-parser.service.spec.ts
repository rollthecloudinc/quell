import { TestBed } from '@angular/core/testing';

import { RulesParserService } from './rules-parser.service';

describe('RulesParserService', () => {
  let service: RulesParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RulesParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
