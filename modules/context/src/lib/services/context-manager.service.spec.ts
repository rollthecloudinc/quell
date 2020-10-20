import { TestBed } from '@angular/core/testing';

import { ContextManagerService } from './context-manager.service';

describe('ContextManagerService', () => {
  let service: ContextManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContextManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
