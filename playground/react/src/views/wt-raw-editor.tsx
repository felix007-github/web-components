import { forwardRef } from "react";
import { WtRawEditor } from "@lpcp/raw-editor/react";
import xml from "../assets/test.xml?raw";
export const WtRawEditorVs = forwardRef<
  HTMLWtRawEditorElement,
  React.ComponentPropsWithoutRef<typeof WtRawEditor>
>((_props, _ref) => {
  return (
    <article className="demo-card">
      <div className="flex-col" style={{height: "calc(100% - 45px)"}}>
        <div className="xml-raw-container">
          <WtRawEditor content={xml}></WtRawEditor>
        </div>
      </div>
    </article>
  );
});