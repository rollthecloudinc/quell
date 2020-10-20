import { TestBed } from '@angular/core/testing';

import { RestContentHandlerService } from './rest-content-handler.service';

describe('RestContentHandlerService', () => {
  let service: RestContentHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestContentHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
