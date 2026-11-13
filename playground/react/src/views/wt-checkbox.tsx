import { forwardRef, useState } from "react";
import { WtCheckbox } from "@lpcp/components/react";

export const WtCheckboxVs = forwardRef<
  HTMLWtCheckboxElement,
  React.ComponentPropsWithoutRef<"wt-checkbox">
>((_props, _ref) => {
  const [checkedValue, setCheckedValue] = useState(true);
  const [customValue, setCustomValue] = useState("yes");

  return (
    <article className="demo-card">
      <div className="flex-col">
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <WtCheckbox
            checked={checkedValue}
            label="Boolean Value"
            onUpdateModelValue={(event) => setCheckedValue(event.detail)}
          ></WtCheckbox>
          <WtCheckbox
            label={customValue === "yes" ? "Custom 'yes'" : "Custom 'no'"}
            modelValue={customValue}
            trueValue="yes"
            falseValue="no"
            onUpdateModelValue={(event) => setCustomValue(event.detail)}
          ></WtCheckbox>
        </div>
      </div>

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
        className="flex-col"
      >
        <WtCheckbox size="small" label="Small"></WtCheckbox>
        <WtCheckbox size="medium" label="Medium"></WtCheckbox>
        <WtCheckbox size="large" label="Large"></WtCheckbox>
      </div>

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
        className="flex-col"
      >
        <WtCheckbox label="Checked" checked></WtCheckbox>
        <WtCheckbox label="Partially selected" indeterminate></WtCheckbox>
      </div>
      <div 
        style={{
          marginTop: "16px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
        className="flex-col">
        <WtCheckbox label="Disabled option" disabled></WtCheckbox>
        <WtCheckbox label="Disabled checked" disabled checked></WtCheckbox>
        <WtCheckbox
          label="Disabled indeterminate"
          disabled
          indeterminate
        ></WtCheckbox>
      </div>
      <div className="echo-panel">
        <span className="status-label">React state mirror</span>
        <code>
          {checkedValue ? "Checked" : "Unchecked"} | Custom: {customValue}
        </code>
      </div>
    </article>
  );
});
