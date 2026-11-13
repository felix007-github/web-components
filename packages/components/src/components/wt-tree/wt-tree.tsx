import { Component, Event, EventEmitter, h, Host, Method, Prop, State, Watch } from "@stencil/core";
import { WT_TREE, WtTreeNode, WtTreeNodeUpdateDetail } from "@/utils";

@Component({
  tag: "wt-tree",
  styleUrl: "wt-tree.scss",
  shadow: false,
})
export class WtTree {
  @Prop() tree: WtTreeNode[] = [];
  @Prop() filter?: string;
  @Prop() lazy = false;
  @Prop() load?: (data: WtTreeNode) => Promise<WtTreeNode[]>;
  @Prop() showCheckbox = false;
  @Prop({ attribute: "tree-draggable" }) treeDraggable = false;

  @State() private treeData: WtTreeNode[] = [];
  @State() private activeId: string | number | null = null;
  @State() private hasFilterResults = true;

  @Event({ eventName: "nodeUpdate" }) nodeUpdate!: EventEmitter<WtTreeNodeUpdateDetail>;
  @Event({ eventName: "activeChange" }) activeChange!: EventEmitter<string | number>;

  private lastAppliedFilter: string | null = null;

  componentWillLoad() {
    this.updateTreeData(this.tree);
  }

  @Watch("tree")
  protected handleTreeChange(nextTree: WtTreeNode[]) {
    this.updateTreeData(nextTree);
  }

  @Watch("filter")
  protected handleFilterChange(nextFilter?: string) {
    this.updateFilter(nextFilter);
  }

  @Method()
  async getSelectedNodes(): Promise<WtTreeNode[]> {
    return this.collectSelectedNodes(this.treeData);
  }

  @Method()
  async getTreeData(): Promise<WtTreeNode[]> {
    return this.treeData;
  }

  @Method()
  async resetTree(): Promise<void> {
    this.resetNodes(this.treeData);
    this.refreshTree();
    this.emitNodeUpdate();
  }

  private updateTreeData(nextTree: WtTreeNode[] = []) {
    const validData = Array.isArray(nextTree)
      ? nextTree.filter((node) => node && typeof node === "object")
      : [];

    this.treeData = [...validData];
    this.lastAppliedFilter = null;
    this.updateFilter(this.filter);
  }

  private updateFilter(nextFilter?: string) {
    const normalizedFilter = nextFilter ? nextFilter.trim().toLowerCase() : "";

    if (this.lastAppliedFilter === normalizedFilter) {
      return;
    }

    this.lastAppliedFilter = normalizedFilter;
    this.hasFilterResults = this.applyFilter(this.treeData, normalizedFilter);
    this.refreshTree();
  }

  private applyFilter(nodes: WtTreeNode[], filter: string): boolean {
    if (!filter) {
      this.setAllVisible(nodes);
      return nodes.length > 0;
    }

    let hasVisibleNodes = false;

    nodes.forEach((node) => {
      const matches = node.title?.toLowerCase().includes(filter) || false;
      const childMatches = node.childs?.length ? this.applyFilter(node.childs, filter) : false;

      node.visible = matches || childMatches;
      if (childMatches) {
        node.expanded = true;
      }

      if (node.visible) {
        hasVisibleNodes = true;
      }
    });

    return hasVisibleNodes;
  }

  private setAllVisible(nodes: WtTreeNode[]) {
    nodes.forEach((node) => {
      node.visible = true;
      if (node.childs?.length) {
        this.setAllVisible(node.childs);
      }
    });
  }

  private setActiveId(id: string | number) {
    this.activeId = id;
    this.activeChange.emit(id);
  }

  private async expandItem(node: WtTreeNode) {
    if (node.expanded) {
      node.expanded = false;
      this.refreshTree();
      return;
    }

    const hasLoadedChildren = !!node.childs?.length;

    if (this.lazy && this.load && !hasLoadedChildren) {
      node.loading = true;
      this.refreshTree();

      try {
        const children = await this.load(node);
        node.childs = children || [];
      } catch (error) {
        console.error("Failed to load child nodes:", error);
      } finally {
        node.loading = false;
      }
    }

    node.expanded = true;
    this.lastAppliedFilter = null;
    this.updateFilter(this.filter);
  }

  private handleCheckboxChange(node: WtTreeNode, checked: boolean) {
    if (node.disabled) {
      return;
    }

    node.selected = checked;
    node.indeterminate = false;
    this.updateChildrenSelection(node, checked);
    this.updateParentSelection(this.treeData);
    this.refreshTree();
    this.emitNodeUpdate();
  }

  private updateChildrenSelection(node: WtTreeNode, selected: boolean) {
    node.childs?.forEach((child) => {
      if (!child.disabled) {
        child.selected = selected;
        child.indeterminate = false;
        this.updateChildrenSelection(child, selected);
      }
    });
  }

  private updateParentSelection(nodes: WtTreeNode[]) {
    nodes.forEach((node) => {
      if (!node.childs?.length) {
        return;
      }

      this.updateParentSelection(node.childs);

      const enabledChildren = node.childs.filter((child) => !child.disabled);
      if (!enabledChildren.length) {
        return;
      }

      const selectedCount = enabledChildren.filter((child) => child.selected).length;
      const indeterminateCount = enabledChildren.filter((child) => child.indeterminate).length;

      if (selectedCount === enabledChildren.length) {
        node.selected = true;
        node.indeterminate = false;
      } else if (selectedCount > 0 || indeterminateCount > 0) {
        node.selected = false;
        node.indeterminate = true;
      } else {
        node.selected = false;
        node.indeterminate = false;
      }
    });
  }

  private collectSelectedNodes(nodes: WtTreeNode[]): WtTreeNode[] {
    let selectedNodes: WtTreeNode[] = [];

    nodes.forEach((node) => {
      if (node.selected && !node.disabled) {
        selectedNodes.push(node);
      }

      if (node.childs?.length) {
        selectedNodes = selectedNodes.concat(this.collectSelectedNodes(node.childs));
      }
    });

    return selectedNodes;
  }

  private countSelectedNodes(nodes: WtTreeNode[]): number {
    return this.collectSelectedNodes(nodes).length;
  }

  private resetNodes(nodes: WtTreeNode[]) {
    nodes.forEach((node) => {
      if (!node.disabled) {
        node.selected = false;
        node.indeterminate = false;
      }

      if (node.childs?.length) {
        this.resetNodes(node.childs);
      }
    });
  }

  private emitNodeUpdate() {
    this.nodeUpdate.emit({
      tree: this.treeData,
      selectedNum: this.countSelectedNodes(this.treeData),
    });
  }

  private refreshTree() {
    this.treeData = [...this.treeData];
  }

  private onDragStart(node: WtTreeNode, event: DragEvent) {
    event.dataTransfer?.setData("application/json", JSON.stringify(node));

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }

    const dragImage = document.createElement("div");
    dragImage.className = `${WT_TREE}__drag-image`;
    dragImage.innerText = typeof node.title === "string" ? node.title : "";
    document.body.appendChild(dragImage);

    const rect = dragImage.getBoundingClientRect();
    event.dataTransfer?.setDragImage(dragImage, rect.width / 2, rect.height / 2);
    window.setTimeout(() => dragImage.remove(), 0);
  }

  private onDrop(event: DragEvent) {
    event.preventDefault();
  }

  private renderCheckbox(node: WtTreeNode) {
    if (!this.showCheckbox) {
      return null;
    }

    return (
      <span class={`${WT_TREE}__checkbox`}>
        <input
          class={`${WT_TREE}__checkbox-input`}
          type="checkbox"
          checked={!!node.selected}
          disabled={!!node.disabled}
          ref={(element) => {
            if (element) {
              element.indeterminate = !!node.indeterminate;
            }
          }}
          onChange={(event) => this.handleCheckboxChange(node, (event.target as HTMLInputElement).checked)}
        />
      </span>
    );
  }

  private renderToggle(node: WtTreeNode) {
    const canExpand = !!node.childs?.length || !!node.has_children;

    if (!canExpand) {
      return <span class={`${WT_TREE}__toggle ${WT_TREE}__toggle--empty`} aria-hidden="true" />;
    }

    return (
      <button
        class={{
          [`${WT_TREE}__toggle`]: true,
          [`${WT_TREE}__toggle--expanded`]: !!node.expanded,
        }}
        type="button"
        aria-label={node.expanded ? "Collapse" : "Expand"}
        onClick={(event) => {
          event.stopPropagation();
          this.expandItem(node);
        }}
      />
    );
  }

  private renderNode(node: WtTreeNode, fallbackKey: string) {
    if (!node || node.visible === false) {
      return null;
    }

    const nodeKey = String(node.id ?? fallbackKey);

    return (
      <div class={`${WT_TREE}__node`} key={nodeKey}>
        <div
          class={{
            [`${WT_TREE}__node-content`]: true,
            "is-active": this.activeId === node.id,
            "is-disabled": !!node.disabled,
          }}
        >
          <div class={`${WT_TREE}__node-icon`}>
            {this.renderToggle(node)}
            {node.loading ? <span class={`${WT_TREE}__loading`} /> : <span class={`${WT_TREE}__line`} />}
          </div>
          <div class={`${WT_TREE}__node-item`}>
            {this.renderCheckbox(node)}
            <div
              class={`${WT_TREE}__item-area`}
              draggable={this.treeDraggable}
              onClick={() => this.setActiveId(node.id)}
              onDragStart={(event) => {
                if (this.treeDraggable) {
                  this.onDragStart(node, event);
                }
              }}
            >
              <span>{node.title}</span>
            </div>
          </div>
        </div>
        {!!node.childs?.length && node.expanded && (
          <div class={`${WT_TREE}__children`}>
            {node.childs.map((child, childIndex) => this.renderNode(child, `${nodeKey}-${childIndex}`))}
          </div>
        )}
      </div>
    );
  }

  render() {
    const emptyText = this.treeData.length === 0 ? "No data available" : "No matching results found";

    return (
      <Host>
        {this.treeData.length && this.hasFilterResults ? (
          <div class={`${WT_TREE}__wrapper`} onDragOver={(event) => event.preventDefault()} onDragEnter={(event) => event.preventDefault()} onDrop={(event) => this.onDrop(event)}>
            {this.treeData.map((node, index) => this.renderNode(node, String(index)))}
          </div>
        ) : (
          <div class={`${WT_TREE}__empty`}>{emptyText}</div>
        )}
      </Host>
    );
  }
}
