import { WtDivider } from "@lpcp/components/react";

export const WtDividerVs = () => {
  return (
    <article className="demo-card" style={{ gap: "20px", display: "flex", flexDirection: "column" }}>
      {/* Row 1 — Horizontal / Variants */}
      <div style={{ gap: "12px", display: "flex", flexDirection: "column" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>
          Horizontal — Variants (default / subdued / strong)
        </p>
        <WtDivider direction="horizontal" variant="default" />
        <WtDivider direction="horizontal" variant="subdued" />
        <WtDivider direction="horizontal" variant="strong" />
      </div>

      {/* Row 2 — Dashed */}
      <div style={{ gap: "12px", display: "flex", flexDirection: "column" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>
          Dashed style
        </p>
        <WtDivider
          direction="horizontal"
          borderStyle="dashed"
          variant="default"
        />
        <WtDivider
          direction="horizontal"
          borderStyle="dashed"
          variant="subdued"
        />
        <WtDivider
          direction="horizontal"
          borderStyle="dashed"
          variant="strong"
        />
      </div>

      {/* Row 3 — Custom Color */}
      <div style={{ gap: "12px", display: "flex", flexDirection: "column" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>
          Custom color
        </p>
        <WtDivider direction="horizontal" color="rgba(108, 133, 248, 1)" />
        <WtDivider
          direction="horizontal"
          color="rgba(75, 171, 82, 1)"
          borderStyle="dashed"
        />
        <WtDivider
          direction="horizontal"
          color="rgba(232, 23, 31, 1)"
          borderWidth="2px"
        />
      </div>

      {/* Row 4 — Custom Width */}
      <div style={{ gap: "12px", display: "flex", flexDirection: "column" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>
          Custom width
        </p>
        <WtDivider direction="horizontal" borderWidth="1px" variant="strong" />
        <WtDivider direction="horizontal" borderWidth="2px" variant="strong" />
        <WtDivider direction="horizontal" borderWidth="4px" variant="strong" />
      </div>

      {/* Row 5 — Vertical */}
      <div style={{ gap: "12px", display: "flex", flexDirection: "column" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>
          Vertical
        </p>
        <div style={{ display: "flex", alignItems: "center", height: "32px" }}>
          <span style={{ fontSize: "13px" }}>Text A</span>
          <WtDivider direction="vertical" variant="default" />
          <span style={{ fontSize: "13px" }}>Text B</span>
          <WtDivider direction="vertical" variant="subdued" />
          <span style={{ fontSize: "13px" }}>Text C</span>
          <WtDivider direction="vertical" variant="strong" />
          <span style={{ fontSize: "13px" }}>Text D</span>
          <WtDivider
            direction="vertical"
            borderStyle="dashed"
            color="rgba(108, 133, 248, 1)"
          />
          <span style={{ fontSize: "13px" }}>Text E</span>
        </div>
      </div>
    </article>
  );
};
