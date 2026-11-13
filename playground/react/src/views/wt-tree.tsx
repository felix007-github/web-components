import { forwardRef, useState } from "react";
import { WtTree, WtTreeNode } from "@mache-hangar/components/react";
export const WtTreeVs = forwardRef<
  HTMLWtTreeElement,
  React.ComponentPropsWithoutRef<"wt-tree">
>((_props, _ref) => {
  const [treeData] = useState<WtTreeNode[]>([
    {
      id: "node1",
      title: "Node 1",
      value: "node1",
      expanded: true,
      childs: [
        { id: "node1-1", title: "Node 1-1", value: "node1-1", childs: [] },
        { id: "node1-2", title: "Node 1-2", value: "node1-2", childs: [] },
      ],
    },
    {
      id: "node2",
      title: "Node 2",
      value: "node2",
      expanded: true,
      childs: [
        { id: "node2-1", title: "Node 2-1", value: "node2-1", childs: [] },
        { id: "node2-2", title: "Node 2-2", value: "node2-2", childs: [] },
      ],
    },
  ]);
  const [treeData1] = useState<WtTreeNode[]>([
  {
    id: "node1",
    title: "Node 1",
    value: "node1",
    expanded: true,
    childs: [
      { id: "node1-1", title: "Node 1-1", value: "node1-1", childs: [] },
      { id: "node1-2", title: "Node 1-2", value: "node1-2", expanded: true, childs: [
        { id: "node1-2-1", title: "Node 1-2-1", value: "node1-2-1", expanded: true, childs: [
          { id: "node1-2-1-1", title: "Node 1-2-1-1", value: "node1-2-1-1", childs: [] },
          { id: "node1-2-1-2", title: "Node 1-2-1-2", value: "node1-2-1-2", childs: [] },
        ] },
        { id: "node1-2-2", title: "Node 1-2-2", value: "node1-2-2", childs: [] },
      ] },
    ],
  },
  {
    id: "node2",
    title: "Node 2",
    value: "node2",
    expanded: true,
    childs: [
      { id: "node2-1", title: "Node 2-1", value: "node2-1", expanded: true, childs: [
        { id: "node2-1-1", title: "Node 2-1-1", value: "node2-1-1", childs: [] },
        { id: "node2-1-2", title: "Node 2-1-2", value: "node2-1-2", expanded: true, childs: [
          { id: "node2-1-2-1", title: "Node 2-1-2-1", value: "node2-1-2-1", childs: [] },
          { id: "node2-1-2-2", title: "Node 2-1-2-2", value: "node2-1-2-2", childs: [] },
        ] },
      ] },
      { id: "node2-2", title: "Node 2-2", value: "node2-2", childs: [] },
    ],
  },
  {
    id: "node3",
    title: "Node 3",
    value: "node3",
    expanded: true,
    childs: [
      { id: "node3-1", title: "Node 3-1", value: "node3-1", childs: [] },
      { id: "node3-2", title: "Node 3-2", value: "node3-2", childs: [] },
    ],
  }
]);
  return (
    <article className="demo-card">
      <div className="flex-col">
        <WtTree tree={treeData}></WtTree>
      </div>
      <div className="flex-col" style={{ marginTop: 20 }}>
        <WtTree tree={treeData1}></WtTree>
      </div>
    </article>
  );
});