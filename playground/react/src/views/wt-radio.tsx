import { forwardRef, useState } from "react";
import { WtRadio } from "@lpcp/components/react";

export const WtRadioVs = forwardRef<
  HTMLWtRadioElement,
  React.ComponentPropsWithoutRef<"wt-radio">
>((_props, _ref) => {
  const [selectedValue, setSelectedValue] = useState("option1");
  const [selectedSize, setSelectedSize] = useState("medium");
  const [disabledValue, setDisabledValue] = useState("enabled");

  return (
    <article className="demo-card">
      {/* Row 1 — Basic radio group */}
      <div className="flex-col" style={{ gap: "16px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>
          Basic radio group (Medium size)
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <WtRadio
            name="basic-group"
            value="option1"
            modelValue={selectedValue}
            onUpdateModelValue={(e) => setSelectedValue(e.detail)}
          />
          <WtRadio
            name="basic-group"
            value="option2"
            modelValue={selectedValue}
            onUpdateModelValue={(e) => setSelectedValue(e.detail)}
          />
          <WtRadio
            name="basic-group"
            value="option3"
            modelValue={selectedValue}
            onUpdateModelValue={(e) => setSelectedValue(e.detail)}
          />
        </div>
      </div>

      {/* Row 3 — Large size */}
      <div className="flex-col" style={{ gap: "16px", marginTop: "20px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>size</p>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <WtRadio
            size="small"
            name="small-group"
            value="small1"
            modelValue={selectedSize}
            onUpdateModelValue={(e) => setSelectedSize(e.detail)}
          />
          <WtRadio
            size="medium"
            name="small-group"
            value="medium"
            modelValue={selectedSize}
            onUpdateModelValue={(e) => setSelectedSize(e.detail)}
          />
          <WtRadio
            size="large"
            name="large-group"
            value="large2"
            modelValue={selectedSize}
            onUpdateModelValue={(e) => setSelectedSize(e.detail)}
          />
        </div>
      </div>

      {/* Row 4 — Disabled state */}
      <div className="flex-col" style={{ gap: "16px", marginTop: "20px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>
          Disabled state
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <WtRadio
            disabled
            name="disabled-group"
            value="disabled1"
            modelValue={disabledValue}
          />
          <WtRadio
            disabled
            name="disabled-group"
            value="disabled2"
            modelValue={disabledValue}
            onUpdateModelValue={(e) => setDisabledValue(e.detail)}
          />
          <WtRadio
            disabled
            name="disabled-group"
            value="disabled3"
            modelValue="disabled3"
          />
        </div>
      </div>
    </article>
  );
});

WtRadioVs.displayName = "WtRadio";
