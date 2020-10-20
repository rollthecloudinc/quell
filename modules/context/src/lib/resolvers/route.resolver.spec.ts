import { TestBed } from '@angular/core/testing';

import { RouteResolver } from './route.resolver';

describe('RouteResolver', () => {
  let service: RouteResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteResolver);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
