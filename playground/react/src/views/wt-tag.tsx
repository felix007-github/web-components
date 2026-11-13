import { forwardRef } from "react";
import { WtTag } from "@mache-hangar/components/react";
export const WtTagVs = forwardRef<
  HTMLWtTagElement,
  React.ComponentPropsWithoutRef<"wt-tag">
>((_props, _ref) => {
  return (
    <article className="demo-card">
      <div className="flex-col">
        <WtTag type="primary">primary</WtTag>
        <WtTag type="primary">primary</WtTag>
        <WtTag type="success">success</WtTag>
        <WtTag type="warning">warning</WtTag>
        <WtTag type="info">info</WtTag>
        <WtTag type="error">error</WtTag>
      </div>
      <div style={{marginTop: "20px"}} className="flex-col">
        <WtTag variant="outlined" type="primary">primary</WtTag>
        <WtTag variant="outlined" type="success">success</WtTag>
        <WtTag variant="outlined" type="warning">warning</WtTag>
        <WtTag variant="outlined" type="info">info</WtTag>
        <WtTag variant="outlined" type="error">error</WtTag>
      </div>
    </article>
  );
});