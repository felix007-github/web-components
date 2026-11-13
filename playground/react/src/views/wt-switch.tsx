import { useState } from "react";
import { WtSwitch } from "@lpcp/components/react";

export const WtSwitchVs = () => {
  const [value1, setValue1] = useState(false);
  const [value2, setValue2] = useState(true);
  const [value3, setValue3] = useState(false);
  const [value4, setValue4] = useState(true);

  return (
    <article className="demo-card">
      {/* Row 1 — Normal size */}
      <div className="flex-col" style={{ gap: "16px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>
          Normal size
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <WtSwitch
            modelValue={value1}
            onUpdateModelValue={(e: CustomEvent<boolean>) => setValue1(e.detail)}
          />
          <WtSwitch
            modelValue={value2}
            onUpdateModelValue={(e: CustomEvent<boolean>) => setValue2(e.detail)}
          />
        </div>
      </div>

      {/* Row 2 — Small size */}
      <div className="flex-col" style={{ gap: "16px", marginTop: "20px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>
          Small size
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <WtSwitch
            size="small"
            modelValue={value3}
            onUpdateModelValue={(e: CustomEvent<boolean>) => setValue3(e.detail)}
          />
          <WtSwitch
            size="small"
            modelValue={value4}
            onUpdateModelValue={(e: CustomEvent<boolean>) => setValue4(e.detail)}
          />
        </div>
      </div>

      {/* Row 3 — Disabled */}
      <div className="flex-col" style={{ gap: "16px", marginTop: "20px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>
          Disabled
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <WtSwitch disabled />
          <WtSwitch disabled />
          <WtSwitch size="small" disabled />
          <WtSwitch size="small" disabled  />
        </div>
      </div>

      <div className="echo-panel" style={{ marginTop: "16px" }}>
        <span className="status-label">Switch 1: </span>
        <strong>{value1 ? "ON" : "OFF"}</strong>
        <span className="status-label" style={{ marginLeft: "16px" }}>
          Switch 2:{" "}
        </span>
        <strong>{value2 ? "ON" : "OFF"}</strong>
      </div>
    </article>
  );
};
