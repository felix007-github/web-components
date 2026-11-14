import { newSpecPage } from '@stencil/core/testing';
import { WtSwitch } from './wt-switch';

describe('wt-switch', () => {
  it('toggles with the keyboard and emits the new model value', async () => {
    const page = await newSpecPage({ components: [WtSwitch], html: '<wt-switch></wt-switch>' });
    const update = jest.fn();
    page.root!.addEventListener('updateModelValue', update);
    const control = page.root!.querySelector('[role="switch"]')!;
    control.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
    await page.waitForChanges();
    expect(control.getAttribute('aria-checked')).toBe('true');
    expect(update).toHaveBeenCalledTimes(1);
    expect(update.mock.calls[0][0].detail).toBe(true);
  });

  it('reflects external values and blocks changes while disabled', async () => {
    const page = await newSpecPage({ components: [WtSwitch], html: '<wt-switch></wt-switch>' });
    page.root!.modelValue = true;
    page.root!.disabled = true;
    await page.waitForChanges();
    const update = jest.fn();
    page.root!.addEventListener('updateModelValue', update);
    const control = page.root!.querySelector<HTMLElement>('[role="switch"]')!;
    control.click();
    control.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await page.waitForChanges();
    expect(control.getAttribute('aria-checked')).toBe('true');
    expect(control.getAttribute('aria-disabled')).toBe('true');
    expect(control.getAttribute('tabindex')).toBe('-1');
    expect(update).not.toHaveBeenCalled();
  });
});
