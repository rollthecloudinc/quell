import { TestBed } from '@angular/core/testing';

import { RulesResolverService } from './rules-resolver.service';

describe('RulesResolverService', () => {
  let service: RulesResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RulesResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
