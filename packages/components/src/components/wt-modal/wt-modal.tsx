import { Component, Host, Prop, h, Event, EventEmitter, Watch } from "@stencil/core";
import { WT_MODAL } from "@/utils";
@Component({
  tag: "wt-modal",
  styleUrl: "wt-modal.scss",
  shadow: true,
})
export class WtModal {
  private dialogEl?: HTMLDialogElement;

  @Prop({ mutable: true, reflect: true }) open: boolean = false;
  @Prop() titleText: string = "Modal Title";
  @Prop() top: string = "20%";
  @Prop() showOverlay: boolean = true;
  @Prop() showCloseIcon: boolean = true;
  /**
   * Function to call before closing the modal. 
   * If provided, the modal won't close automatically.
   */
  @Prop() beforeClose?: (done: () => void) => void;

  @Event({ eventName: "wt-open-change" }) openChange!: EventEmitter<boolean>;
  @Event({ eventName: "updateModelValue" }) updateModelValue!: EventEmitter<boolean>;

  private setOpen(nextOpen: boolean) {
    if (this.open === nextOpen) {
      return;
    }

    this.open = nextOpen;
    this.openChange.emit(nextOpen);
    this.updateModelValue.emit(nextOpen);
  }

  componentDidLoad() {
    this.syncDialogState(this.open);
  }

  @Watch("open")
  onOpenChange(nextOpen: boolean) {
    this.syncDialogState(nextOpen);
  }

  private syncDialogState(nextOpen: boolean) {
    if (!this.dialogEl) {
      return;
    }

    if (nextOpen) {
      if (!this.dialogEl.open) {
        this.dialogEl.showModal();
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${scrollBarWidth}px`;
        document.body.style.overflow = "hidden";
      }
    } else {
      if (this.dialogEl.open) {
        this.dialogEl.close();
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }
    }
  }

  private handleCancel = (event: Event) => {
    event.preventDefault();
    this.attemptClose();
  };

  private handleDialogClick = (event: MouseEvent) => {
    if (event.target === this.dialogEl) {
      this.attemptClose();
    }
  };

  private attemptClose() {
    const done = () => this.setOpen(false);

    // Check if the functional Prop is provided (best for React/Vue)
    if (this.beforeClose) {
      this.beforeClose(done);
      return;
    }

    // Default close
    done();
  }
  
  render() {

    return (
      <Host>
        <dialog
          ref={(element) => {
            this.dialogEl = element;
          }}
          class={{[`${WT_MODAL}__dialog`]: true, [`${WT_MODAL}__dialog--overlay`]: this.showOverlay}}
          onCancel={this.handleCancel}
          onClick={this.handleDialogClick}
        >
          <div class={`${WT_MODAL}__body`}  style={{ top: this.top }}>
            <header class={`${WT_MODAL}__header`}>
              <span class={`${WT_MODAL}__title`}>{this.titleText}</span>
              {this.showCloseIcon && (
                <wt-icon class={`${WT_MODAL}__close-icon`} name="clear" onClick={() => this.attemptClose()}></wt-icon>
              )}
            </header>
            <div class={`${WT_MODAL}__content`}>
              <slot name="content"></slot>
            </div>
            <div class={`${WT_MODAL}__footer`}>
              <slot name="footer"></slot>
            </div>
          </div>
        </dialog>
      </Host>
    )
  }
}