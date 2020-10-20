import { TestBed } from '@angular/core/testing';

import { WidgetsService } from './widgets.service';

describe('WidgetService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WidgetsService = TestBed.get(WidgetsService);
    expect(service).toBeTruthy();
  });
});
