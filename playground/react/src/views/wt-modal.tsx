import { forwardRef, useState } from "react";
import { WtModal, WtButton } from "@mache-hangar/components/react";
export const WtModalVs = forwardRef<
  HTMLWtModalElement,
  React.ComponentPropsWithoutRef<"wt-modal">
>((_props, _ref) => {

  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);

  const beforeCloseHandler = (done: () => void) => {
    if (confirm("确定关闭？")) {
      done();
    }
  }
  
  return (
    <article className="demo-card">
      <div className="flex-col">
        <WtButton onClick={() => setIsOpen(true)}>open modal1</WtButton>
        <WtButton onClick={() => setIsOpen2(true)}>open modal2</WtButton>
        <WtModal
          open={isOpen}
          showOverlay={true}
          titleText={"Custom Modal Title"}
          beforeClose={beforeCloseHandler}
          onUpdateModelValue={(event) => setIsOpen(event.detail)}
        >
          <div slot="content">
            <p>This is the content of the modal.</p>
          </div>
          <div slot="footer" className="button-stack">
            <WtButton size="medium" plain onClick={() => setIsOpen(false)}>Cancel</WtButton>
            <WtButton size="medium" onClick={() => setIsOpen(false)}>Confirm</WtButton>
          </div>
        </WtModal>
        <WtModal
          open={isOpen2}
          showOverlay={true}
          showCloseIcon={false}
          titleText={"Custom Modal Title"}
          onUpdateModelValue={(event) => setIsOpen2(event.detail)}
        >
          <div slot="content">
            <p>This is the content of the modal.</p>
          </div>
          <div slot="footer" className="button-stack">
            <WtButton size="medium" plain onClick={() => setIsOpen2(false)}>Cancel</WtButton>
            <WtButton size="medium" onClick={() => setIsOpen2(false)}>Confirm</WtButton>
          </div>
        </WtModal>
      </div>
    </article>
  );
});