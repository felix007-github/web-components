export type VALIDATE_TYPE = 'dtd' | 'xsd';

export type HtmlElementPathItem = {
  tagName: string;
  index: number;
};

export type CodeEditorRevealTarget = {
  targetId?: string;
  targetPath?: HtmlElementPathItem[];
  targetText?: string;
};

export interface ValidateIgnore {
  tagName?: string;
  attributeName?: string;
  attributeValue?: string;
}

export type CodeEditorOption = {
  content: string;
  format: boolean;
  language?: string;
  isShowDiff?: boolean;
  readonly: boolean;
  minimap?: unknown;
};

export type KeyWord = {
  content: string;
  type?: string | number;
};

export type CodeEditorMarkerData = {
  message: string;
  severity?: number;
  startLineNumber?: number;
  endLineNumber?: number;
  startColumn?: number;
  endColumn?: number;
};

export type ValidationElement = {
  name: string;
  targetNamespace?: string | null;
  ns?: string | null;
  parent?: ValidationElement;
  children: ValidationElement[];
  attributes: ValidationAttribute[];
};

export type ValidationAttribute = {
  name: string;
  type?: string;
  describe?: string;
  value?: string;
  fixed?: string;
};

export interface ValidationManager {
  get(name: string): ValidationElement | undefined;
  getRoots(): ValidationElement[];
}

export type SchemaData = {
  schemaNode: Element;
  targetNamespace: string;
  ns: string;
};

export type ExternalError = {
  xpath: string;
  message: string;
  target: string;
};

export type ResOtherMarkerData = {
  message: string;
  startLineNumber?: number;
  endLineNumber?: number;
  startColumn?: number;
  endColumn?: number;
  severity?: number;
}
