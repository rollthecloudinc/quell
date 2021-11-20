import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { PageBuilderEffects } from './page-builder.effects';

describe('PageBuilderEffects', () => {
  let actions$: Observable<any>;
  let effects: PageBuilderEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PageBuilderEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<PageBuilderEffects>(PageBuilderEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
