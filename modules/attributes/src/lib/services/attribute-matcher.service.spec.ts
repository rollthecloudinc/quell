import { TestBed } from '@angular/core/testing';

import { AttributeMatcherService } from './attribute-matcher.service';

describe('AttributeMatcherService', () => {
  let service: AttributeMatcherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttributeMatcherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
