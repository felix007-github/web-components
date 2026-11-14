
import {
  formatXml as fallbackFormatXml,
  minifyXml,
} from './formatter-util';

export class Formatter {
  async minifyXml(xmlString: string) {
    return minifyXml(xmlString);
  }

  async formatXml(xmlString: string) {
    try {
      const [standalone, htmlParser] = await Promise.all([
        import('prettier/standalone.js'),
        import('prettier/parser-html.js'),
      ]);
      const prettier = standalone.default ?? standalone;
      return prettier.format(xmlString, {
        parser: 'html',
        plugins: [htmlParser.default ?? htmlParser],
        printWidth: 120,
        tabWidth: 2,
        useTabs: false,
        htmlWhitespaceSensitivity: 'ignore',
        bracketSameLine: false,
      });
    } catch {
      return fallbackFormatXml(xmlString);
    }
  }
}

export const formatter = new Formatter();
export { fallbackFormatXml as formatXml, minifyXml };
