import { TestBed } from '@angular/core/testing';
import { InlineContextResolverService } from './inline-context-resolver.service';

describe('InlineContextResolverService', () => {
  let service: InlineContextResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InlineContextResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
