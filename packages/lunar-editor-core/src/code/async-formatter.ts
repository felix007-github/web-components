import { formatter } from './formatter';

const waitForPaint = () =>
  new Promise<void>((resolve) => {
    if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
      resolve();
      return;
    }

    window.requestAnimationFrame(() => {
      window.setTimeout(resolve, 0);
    });
  });

export async function formatXmlAfterPaint(xmlString: string) {
  await waitForPaint();
  return formatter.formatXml(xmlString);
}
