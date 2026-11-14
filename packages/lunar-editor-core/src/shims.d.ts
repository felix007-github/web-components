declare module 'prettier/standalone.js' {
  export type Parser = 'html';

  export type Plugin = Record<string, unknown>;

  export type Options = {
    bracketSameLine?: boolean;
    htmlWhitespaceSensitivity?: 'css' | 'strict' | 'ignore';
    parser: Parser;
    plugins: Plugin[];
    printWidth?: number;
    tabWidth?: number;
    useTabs?: boolean;
  };

  export function format(source: string, options: Options): string;

  const standalone: { format: typeof format };
  export default standalone;
}

declare module 'prettier/parser-html.js' {
  import type { Plugin } from 'prettier/standalone.js';

  const plugin: Plugin;
  export = plugin;
}
