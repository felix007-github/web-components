const NEW_LINE = '\r\n';
const INDENT = '  ';
const sensitiveTextTags = new Set(['script', 'pre', 'textarea']);
const voidHtmlTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

type HtmlToken =
  | { type: 'tag'; value: string; name?: string; closing: boolean; selfClosing: boolean }
  | { type: 'text'; value: string };

const getHtmlTagInfo = (value: string): HtmlToken => {
  const match = value.match(/^<\s*(\/?)\s*([a-zA-Z][\w:-]*)\b[\s\S]*?(\/?)\s*>$/);
  if (!match || value.startsWith('<!--') || value.startsWith('<!') || value.startsWith('<?')) {
    return { type: 'tag', value, closing: false, selfClosing: true };
  }

  const name = match[2].toLowerCase();
  return {
    type: 'tag',
    value,
    name,
    closing: Boolean(match[1]),
    selfClosing: Boolean(match[3]) || /\/>$/.test(value) || voidHtmlTags.has(name),
  };
};

const tokenizeHtml = (html: string): HtmlToken[] => {
  const tokens: HtmlToken[] = [];
  const tagPattern = /(<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<\/?[^>]+>)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(html))) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: html.slice(lastIndex, match.index) });
    }
    tokens.push(getHtmlTagInfo(match[0]));
    lastIndex = tagPattern.lastIndex;
  }

  if (lastIndex < html.length) {
    tokens.push({ type: 'text', value: html.slice(lastIndex) });
  }

  return tokens;
};

const previousToken = (tokens: HtmlToken[], index: number) => {
  for (let current = index - 1; current >= 0; current--) {
    if (tokens[current].value) {
      return tokens[current];
    }
  }
  return undefined;
};

const nextToken = (tokens: HtmlToken[], index: number) => {
  for (let current = index + 1; current < tokens.length; current++) {
    if (tokens[current].value) {
      return tokens[current];
    }
  }
  return undefined;
};

const normalizeTextToken = (tokens: HtmlToken[], index: number) => {
  const token = tokens[index];
  if (token.type !== 'text' || !/[\r\n]/.test(token.value)) {
    return token.value;
  }

  if (/^[\t\n\r ]+$/.test(token.value)) {
    return '';
  }

  let value = token.value
    .replace(/[ \t]*[\r\n]+[ \t]*/g, ' ')
    .replace(/ {2,}/g, ' ');
  const previous = previousToken(tokens, index);
  const next = nextToken(tokens, index);

  if (previous?.type !== 'text' && previous?.closing !== true) {
    value = value.trimStart();
  }
  if (next?.type !== 'text' && next?.closing === true) {
    value = value.trimEnd();
  }

  return value;
};

export const normalizeFormattedTextWhitespace = (html: string) => {
  const tokens = tokenizeHtml(html);
  const sensitiveStack: string[] = [];

  return tokens
    .map((token, index) => {
      if (token.type === 'text') {
        return sensitiveStack.length ? token.value : normalizeTextToken(tokens, index);
      }

      if (token.name && sensitiveTextTags.has(token.name)) {
        if (token.closing) {
          const stackIndex = sensitiveStack.lastIndexOf(token.name);
          if (stackIndex >= 0) {
            sensitiveStack.splice(stackIndex, 1);
          }
        } else if (!token.selfClosing) {
          sensitiveStack.push(token.name);
        }
      }

      return token.value;
    })
    .join('');
};

const createIndent = (length: number) => INDENT.repeat(Math.max(length, 0));

export const formatXml = (html: string): string => {
  const tokens = tokenizeHtml(normalizeFormattedTextWhitespace(html).replace(/\t/g, INDENT));
  const lines: string[] = [];
  let depth = 0;

  for (const token of tokens) {
    if (token.type === 'text') {
      const text = token.value
        .replace(/[ \t]*[\r\n]+[ \t]*/g, ' ')
        .replace(/ {2,}/g, ' ')
        .trim();
      if (text) {
        lines.push(`${createIndent(depth)}${text}`);
      }
      continue;
    }

    const tag = token.value.trim();
    if (!tag) {
      continue;
    }

    if (token.closing) {
      depth = Math.max(depth - 1, 0);
      lines.push(`${createIndent(depth)}${tag}`);
      continue;
    }

    lines.push(`${createIndent(depth)}${tag}`);
    if (token.name && !token.selfClosing) {
      depth += 1;
    }
  }

  return lines.join(NEW_LINE) + NEW_LINE;
};

export const minifyXml = (html: string) => {
  return tokenizeHtml(normalizeFormattedTextWhitespace(html).replace(/\t/g, INDENT))
    .map((token) => (token.type === 'tag' ? token.value.trim() : token.value))
    .join('')
    .replace(/>\s+</g, '><')
    .trim();
};
