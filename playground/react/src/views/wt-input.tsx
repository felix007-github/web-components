import { forwardRef, useState } from "react";
import { WtInput } from "@mache-hangar/components/react";
export const WtInputVs = forwardRef<
  HTMLWtInputElement,
  React.ComponentPropsWithoutRef<"wt-input">
>((_props, _ref) => {
  const [inputValue, setInputValue] = useState("");
  return (
    <article className="demo-card">
      <WtInput
        modelValue={inputValue}
        placeholder="Stencil + React"
        size="medium"
        onUpdateModelValue={(event) => setInputValue(event.detail)}
      >
        <wt-icon name="search" slot="after"></wt-icon>
      </WtInput>
      <div className="echo-panel">
        <span className="status-label">React state mirror</span>
        <code>{inputValue || "Empty"}</code>
      </div>
    </article>
  );
});
