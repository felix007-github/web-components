import { forwardRef } from "react";
import { WtLoading } from "@mache-hangar/components/react";
export const WtLoadingVs = forwardRef<
  HTMLWtLoadingElement,
  React.ComponentPropsWithoutRef<"wt-loading">
>((_props, _ref) => {
  return (
    <article className="demo-card">
      <WtLoading size={60}></WtLoading>
      <WtLoading size={"large"}></WtLoading>
      <WtLoading size={"medium"}></WtLoading>
      <WtLoading size={"small"}></WtLoading>
      <WtLoading text={"Loading text"}></WtLoading>
    </article>
  );
});
