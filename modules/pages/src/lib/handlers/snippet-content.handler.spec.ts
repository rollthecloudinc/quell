import { TestBed } from '@angular/core/testing';

import { SnippetContentHandler } from './snippet-content.handler';

describe('SnippetContentHandler', () => {
  let service: SnippetContentHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SnippetContentHandler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
