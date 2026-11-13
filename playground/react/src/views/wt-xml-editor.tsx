import { forwardRef } from "react";
import { WtXmlEditor } from "@lpcp/xml-editor/react";
import xml from "../assets/test.xml?raw";

export const WtXmlEditorVs = forwardRef<
  HTMLWtXmlEditorElement,
  React.ComponentPropsWithoutRef<typeof WtXmlEditor>
>((_props, _ref) => {
  return (
    <article className="demo-card">
      <div className="xml-container" style={{ borderTop: "1px solid #e0e0e0" }}>
        <WtXmlEditor
          showTag={true}
          content={xml}
          heatBarOption={{
            show: false,
            position: "left",
          }}
        ></WtXmlEditor>
      </div>
    </article>
  );
});
