import * as fromPageBuilder from './page-builder.actions';

describe('loadPageBuilders', () => {
  it('should return an action', () => {
    expect(fromPageBuilder.loadPageBuilders().type).toBe('[PageBuilder] Load PageBuilders');
  });
});
