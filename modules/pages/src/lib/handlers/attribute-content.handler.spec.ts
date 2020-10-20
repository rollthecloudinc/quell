import { TestBed } from '@angular/core/testing';

import { AttributeContentHandler } from './attribute-content.handler';

describe('AttributeContentHandler', () => {
  let service: AttributeContentHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttributeContentHandler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
