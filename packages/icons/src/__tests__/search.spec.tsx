import { newSpecPage } from '@stencil/core/testing';
import { VtIconSearch } from '../components/search';

describe('search icon', () => {
  it('keeps its viewBox and inherits the consumer color and dimensions', async () => {
    const page = await newSpecPage({ components: [VtIconSearch], html: '<wt-icon-search style="color:red;width:32px"></wt-icon-search>' });
    const svg = page.root!.querySelector('svg')!;
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.hasAttribute('width')).toBe(false);
    expect(svg.hasAttribute('height')).toBe(false);
    expect(svg.querySelector('path')!.getAttribute('fill')).toBe('currentColor');
    expect(page.root!.classList.contains('wt-svg')).toBe(true);
  });
});
