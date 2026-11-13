import { WtBadge } from "@lpcp/components/react";

export const WtBadgeVs = () => {
  return (
    <article className="demo-card">
      {/* Row 1 — Types */}
      <div className="flex-col" style={{ gap: "12px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>Types</p>
        <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
          <WtBadge value={5} type="danger">
            <div style={{ width: 40, height: 40, background: "#f5f5f5", borderRadius: 8, border: "1px solid #e0e0e0" }} />
          </WtBadge>
          <WtBadge value={5} type="warning">
            <div style={{ width: 40, height: 40, background: "#f5f5f5", borderRadius: 8, border: "1px solid #e0e0e0" }} />
          </WtBadge>
          <WtBadge value={5} type="primary">
            <div style={{ width: 40, height: 40, background: "#f5f5f5", borderRadius: 8, border: "1px solid #e0e0e0" }} />
          </WtBadge>
          <WtBadge value={5} type="success">
            <div style={{ width: 40, height: 40, background: "#f5f5f5", borderRadius: 8, border: "1px solid #e0e0e0" }} />
          </WtBadge>
          <WtBadge value={5} type="info">
            <div style={{ width: 40, height: 40, background: "#f5f5f5", borderRadius: 8, border: "1px solid #e0e0e0" }} />
          </WtBadge>
        </div>
      </div>

      {/* Row 2 — Max value */}
      <div className="flex-col" style={{ gap: "12px", marginTop: "20px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>Max value (max=99)</p>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <WtBadge value={50} max={99} type="danger">
            <div style={{ width: 40, height: 40, background: "#f5f5f5", borderRadius: 8, border: "1px solid #e0e0e0" }} />
          </WtBadge>
          <WtBadge value={100} max={99} type="danger">
            <div style={{ width: 40, height: 40, background: "#f5f5f5", borderRadius: 8, border: "1px solid #e0e0e0" }} />
          </WtBadge>
          <WtBadge value={200} max={99} type="warning">
            <div style={{ width: 40, height: 40, background: "#f5f5f5", borderRadius: 8, border: "1px solid #e0e0e0" }} />
          </WtBadge>
        </div>
      </div>

      {/* Row 3 — Dot mode */}
      <div className="flex-col" style={{ gap: "12px", marginTop: "20px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>Dot mode (is-dot)</p>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <WtBadge isDot type="danger">
            <div style={{ width: 40, height: 40, background: "#f5f5f5", borderRadius: 8, border: "1px solid #e0e0e0" }} />
          </WtBadge>
          <WtBadge isDot type="warning">
            <div style={{ width: 40, height: 40, background: "#f5f5f5", borderRadius: 8, border: "1px solid #e0e0e0" }} />
          </WtBadge>
          <WtBadge isDot type="success">
            <div style={{ width: 40, height: 40, background: "#f5f5f5", borderRadius: 8, border: "1px solid #e0e0e0" }} />
          </WtBadge>
        </div>
      </div>

      {/* Row 4 — String value */}
      <div className="flex-col" style={{ gap: "12px", marginTop: "20px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>String value</p>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <WtBadge value="new" type="danger">
            <div style={{ width: 40, height: 40, background: "#f5f5f5", borderRadius: 8, border: "1px solid #e0e0e0" }} />
          </WtBadge>
          <WtBadge value="hot" type="warning">
            <div style={{ width: 40, height: 40, background: "#f5f5f5", borderRadius: 8, border: "1px solid #e0e0e0" }} />
          </WtBadge>
        </div>
      </div>

      {/* Row 5 — Hidden */}
      <div className="flex-col" style={{ gap: "12px", marginTop: "20px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>Hidden</p>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <WtBadge value={5} hidden type="danger">
            <div style={{ width: 40, height: 40, background: "#f5f5f5", borderRadius: 8, border: "1px solid #e0e0e0" }} />
          </WtBadge>
          <WtBadge isDot hidden type="danger">
            <div style={{ width: 40, height: 40, background: "#f5f5f5", borderRadius: 8, border: "1px solid #e0e0e0" }} />
          </WtBadge>
        </div>
      </div>
    </article>
  );
};
