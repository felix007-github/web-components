# wt-tree

<!-- Auto Generated Below -->

## Properties

| Property        | Attribute        | Description | Type                                          | Default     |
| --------------- | ---------------- | ----------- | --------------------------------------------- | ----------- |
| `filter`        | `filter`         |             | `string`                                      | `undefined` |
| `lazy`          | `lazy`           |             | `boolean`                                     | `false`     |
| `load`          | --               |             | `(data: WtTreeNode) => Promise<WtTreeNode[]>` | `undefined` |
| `showCheckbox`  | `show-checkbox`  |             | `boolean`                                     | `false`     |
| `tree`          | --               |             | `WtTreeNode[]`                                | `[]`        |
| `treeDraggable` | `tree-draggable` |             | `boolean`                                     | `false`     |

## Events

| Event          | Description | Type                                  |
| -------------- | ----------- | ------------------------------------- |
| `activeChange` |             | `CustomEvent<number \| string>`       |
| `nodeUpdate`   |             | `CustomEvent<WtTreeNodeUpdateDetail>` |

## Methods

### `getSelectedNodes() => Promise<WtTreeNode[]>`

#### Returns

Type: `Promise<WtTreeNode[]>`

### `getTreeData() => Promise<WtTreeNode[]>`

#### Returns

Type: `Promise<WtTreeNode[]>`

### `resetTree() => Promise<void>`

#### Returns

Type: `Promise<void>`

---

_Built with [StencilJS](https://stenciljs.com/)_
