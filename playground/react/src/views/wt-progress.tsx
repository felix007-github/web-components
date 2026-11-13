import { forwardRef } from "react";
import { WtProgress } from "@mache-hangar/components/react";
export const WtProgressVs = forwardRef<
  HTMLWtProgressElement,
  React.ComponentPropsWithoutRef<"wt-progress">
>((_props, _ref) => {
  return (
    <article className="demo-card">
      <div className="flex-col">
        <WtProgress percentage={0}></WtProgress>
        <WtProgress percentage={50}></WtProgress>
        <WtProgress percentage={100}></WtProgress>
        <WtProgress percentage={60} type="error"></WtProgress>
        <WtProgress percentage={100} type="success"></WtProgress>
      </div>
      <div style={{marginTop: '10px'}} className="flex-col">
        <WtProgress percentage={0} shape="circle"></WtProgress>
        <WtProgress percentage={50} shape="circle"></WtProgress>
        <WtProgress percentage={100} shape="circle"></WtProgress>
        <WtProgress percentage={60} shape="circle" type="error"></WtProgress>
        <WtProgress percentage={100} shape="circle" type="success"></WtProgress>
      </div>
    </article>
  );
});