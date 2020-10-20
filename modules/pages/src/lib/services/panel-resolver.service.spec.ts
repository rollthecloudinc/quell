import { TestBed } from '@angular/core/testing';

import { PanelResolverService } from './panel-resolver.service';

describe('PanelResolverService', () => {
  let service: PanelResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PanelResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
