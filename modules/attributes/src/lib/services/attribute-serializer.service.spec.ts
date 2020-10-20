import { TestBed } from '@angular/core/testing';

import { AttributeSerializerService } from './attribute-serializer.service';

describe('AttributeSerializerService', () => {
  let service: AttributeSerializerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttributeSerializerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
