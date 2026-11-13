export type Size = "small" | "medium" | "large";
export type Direction = "left" | "right";
export type AvatarShape = "circle" | "square";
export type ProgressShape = "line" | "circle";
export type MsgType = "primary" | "success" | "info" | "warning" | "error";
export type TagType = "primary" | "success" | "info" | "warning" | "error";
export type AvatarItem = {
  src?: string;
  alt?: string;
  text?: string;
  styles?: { [key: string]: string };
};

export type WtHeatBarExpose = {
  getHeatBarInstance?: () => Promise<unknown>;
  mounted?: () => Promise<void>;
};

export type WtTabBarListItem = {
  label: string;
  value: string;
}

export interface WtTreeNode {
  id: number | string;
  title: string;
  expanded?: boolean;
  selected?: boolean;
  indeterminate?: boolean;
  has_children?: boolean;
  childs: WtTreeNode[] | null;
  disabled?: boolean;
  locked?: boolean;
  visible?: boolean;
  level?: number;
  loading?: boolean;
  data?: any;
  [key: string]: any;
}

export interface WtTreeNodeUpdateDetail {
  tree: WtTreeNode[];
  selectedNum: number;
}