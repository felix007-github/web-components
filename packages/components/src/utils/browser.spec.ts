import { getBrowserScrollBehavior } from './browser';

describe('browser scroll behavior', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([
    ['Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36', 'instant'],
    ['Mozilla/5.0 Chrome/99.0.0.0 Safari/537.36', 'smooth'],
    ['Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36 Edg/120.0', 'smooth'],
    ['Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36 OPR/106.0', 'smooth'],
    ['Mozilla/5.0 Trident/7.0; rv:11.0', 'smooth'],
  ])('uses the correct behavior for %s', (userAgent, expected) => {
    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
    expect(getBrowserScrollBehavior()).toBe(expected);
  });
});
