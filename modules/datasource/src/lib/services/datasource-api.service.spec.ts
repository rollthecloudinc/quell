import { TestBed } from '@angular/core/testing';

import { DatasourceApiService } from './datasource-api.service';

describe('DatasourceApiService', () => {
  let service: DatasourceApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatasourceApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
