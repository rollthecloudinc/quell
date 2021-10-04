import { TestBed } from '@angular/core/testing';

import { AuthWebStorageService } from './auth-web-storage.service';

describe('AuthWebStorageService', () => {
  let service: AuthWebStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthWebStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
