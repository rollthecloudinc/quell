import { TestBed } from '@angular/core/testing';

import { MediaContentHandler } from './media-content.handler';

describe('MediaContentHandler', () => {
  let service: MediaContentHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaContentHandler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
