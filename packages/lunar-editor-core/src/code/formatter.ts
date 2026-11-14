
import * as prettier from 'prettier/standalone';
import * as htmlParser from 'prettier/parser-html';
import {
  formatXml as fallbackFormatXml,
  minifyXml,
} from './formatter-util';

const prettierPlugins = [htmlParser];

export class Formatter {
  async minifyXml(xmlString: string) {
    return minifyXml(xmlString);
  }

  async formatXml(xmlString: string) {
    try {
      return prettier.format(xmlString, {
        parser: 'html',
        plugins: prettierPlugins,
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
