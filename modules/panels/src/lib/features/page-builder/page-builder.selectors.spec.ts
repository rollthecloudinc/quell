import * as fromPageBuilder from './page-builder.reducer';
import { selectPageBuilderState } from './page-builder.selectors';

describe('PageBuilder Selectors', () => {
  it('should select the feature state', () => {
    const result = selectPageBuilderState({
      [fromPageBuilder.pageBuilderFeatureKey]: {}
    });

    expect(result).toEqual({});
  });
});
