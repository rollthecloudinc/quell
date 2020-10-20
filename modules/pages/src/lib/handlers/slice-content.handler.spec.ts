import { TestBed } from '@angular/core/testing';

import { SliceContentHandler } from './slice-content.handler';

describe('SliceContentHandler', () => {
  let service: SliceContentHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SliceContentHandler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
