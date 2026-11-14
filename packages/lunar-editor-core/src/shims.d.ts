declare module 'prettier/standalone' {
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
}

declare module 'prettier/parser-html' {
  import type { Plugin } from 'prettier/standalone';

  const plugin: Plugin;
  export = plugin;
}
