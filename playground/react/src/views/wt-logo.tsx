import { forwardRef } from "react";
import { WtLogo } from "@mache-hangar/components/react";
export const WtLogoVs = forwardRef<
  HTMLWtLogoElement,
  React.ComponentPropsWithoutRef<"wt-logo">
>((_props, _ref) => {
  return (
    <article className="demo-card">
      <div className="flex-col">
        <WtLogo environment="dev"></WtLogo>
        <WtLogo environment="cert"></WtLogo>
        <WtLogo environment="prod"></WtLogo>
        <WtLogo environment="dev" text="Lexis+ CP"></WtLogo>
      </div>
    </article>
  );
});