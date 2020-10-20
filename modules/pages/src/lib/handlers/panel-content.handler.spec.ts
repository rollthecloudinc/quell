import { TestBed } from '@angular/core/testing';

import { PanelContentHandler } from './panel-content.handler';

describe('PanelContentHandler', () => {
  let service: PanelContentHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PanelContentHandler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
