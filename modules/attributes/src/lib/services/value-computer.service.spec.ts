import { TestBed } from '@angular/core/testing';

import { ValueComputerService } from './value-computer.service';

describe('ValueComputerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ValueComputerService = TestBed.get(ValueComputerService);
    expect(service).toBeTruthy();
  });
});
