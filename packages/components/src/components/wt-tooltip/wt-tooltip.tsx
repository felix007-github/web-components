import { Component, Element, Event, EventEmitter, Host, Prop, State, Watch, h } from "@stencil/core";
import { WT_TOOLTIP } from "@/utils";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";
export type TooltipTrigger = "hover" | "click" | "manual";
type TooltipStyle = {
  left?: string;
  top?: string;
  maxWidth?: string;
  "--wt-tooltip-arrow-left"?: string;
  "--wt-tooltip-arrow-top"?: string;
};

@Component({
  tag: "wt-tooltip",
  styleUrl: "wt-tooltip.scss",
  shadow: true,
})
export class WtTooltip {
  @Element() el!: HTMLElement;

  /** Tooltip 内容（也可通过 content slot 自定义） */
  @Prop() content: string = "";

  /** 显示位置 */
  @Prop() placement: TooltipPlacement = "top";

  /** 触发方式：hover | click | manual */
  @Prop() trigger: TooltipTrigger = "hover";

  /** 受控显示状态 */
  @Prop({ mutable: true, reflect: true }) open: boolean = false;

  /** 是否禁用 */
  @Prop() disabled: boolean = false;

  /** 是否显示箭头 */
  @Prop() showArrow: boolean = true;

  /** 是否在空间不足时自动调整位置 */
  @Prop() autoAdjust: boolean = true;

  /** 弹层最大宽度 */
  @Prop() maxWidth: string = "240px";

  /** 显示延迟（ms） */
  @Prop() showAfter: number = 120;

  /** 隐藏延迟（ms） */
  @Prop() hideAfter: number = 100;

  @Event({ eventName: "wt-open-change" }) openChange!: EventEmitter<boolean>;
  @Event({ eventName: "updateModelValue" }) updateModelValue!: EventEmitter<boolean>;

  private readonly tooltipId = `wt-tooltip-${Math.random().toString(36).slice(2, 9)}`;
  @State() private actualPlacement: TooltipPlacement = this.placement;
  @State() private tooltipStyle: TooltipStyle = {};

  private showTimer?: number;
  private hideTimer?: number;
  private rafId?: number;
  private triggerEl?: HTMLSpanElement;
  private contentEl?: HTMLSpanElement;

  @Watch("disabled")
  onDisabledChange(nextDisabled: boolean) {
    if (nextDisabled) {
      this.clearTimers();
      this.setOpen(false);
    }
  }

  @Watch("open")
  onOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      this.addPositionListeners();
      this.requestPositionUpdate();
    } else {
      this.removePositionListeners();
    }
  }

  @Watch("placement")
  onPlacementChange(nextPlacement: TooltipPlacement) {
    this.actualPlacement = nextPlacement;
    this.requestPositionUpdate();
  }

  componentDidLoad() {
    document.addEventListener("click", this.handleDocumentClick);
    if (this.open) {
      this.onOpenChange(true);
    }
  }

  componentWillLoad() {
    this.actualPlacement = this.placement;
  }

  disconnectedCallback() {
    this.clearTimers();
    this.cancelPositionUpdate();
    this.removePositionListeners();
    document.removeEventListener("click", this.handleDocumentClick);
  }

  private hasContent() {
    return !!this.content || !!this.el.querySelector('[slot="content"]');
  }

  private clearTimers() {
    if (this.showTimer) {
      window.clearTimeout(this.showTimer);
      this.showTimer = undefined;
    }

    if (this.hideTimer) {
      window.clearTimeout(this.hideTimer);
      this.hideTimer = undefined;
    }
  }

  private setOpen(nextOpen: boolean) {
    if (!this.hasContent()) {
      this.open = false;
      return;
    }

    if (this.disabled) {
      this.open = false;
      return;
    }

    if (this.open === nextOpen) {
      return;
    }

    this.open = nextOpen;
    this.openChange.emit(nextOpen);
    this.updateModelValue.emit(nextOpen);
  }

  private addPositionListeners() {
    window.addEventListener("resize", this.handleViewportChange);
    document.addEventListener("scroll", this.handleViewportChange, true);
  }

  private removePositionListeners() {
    window.removeEventListener("resize", this.handleViewportChange);
    document.removeEventListener("scroll", this.handleViewportChange, true);
  }

  private handleViewportChange = () => {
    this.requestPositionUpdate();
  };

  private cancelPositionUpdate() {
    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
  }

  private requestPositionUpdate() {
    this.cancelPositionUpdate();
    this.rafId = window.requestAnimationFrame(() => {
      this.rafId = undefined;
      this.updatePosition();
    });
  }

  private getPlacementOrder(): TooltipPlacement[] {
    const fallbackMap: Record<TooltipPlacement, TooltipPlacement[]> = {
      top: ["top", "bottom", "right", "left"],
      bottom: ["bottom", "top", "right", "left"],
      left: ["left", "right", "top", "bottom"],
      right: ["right", "left", "top", "bottom"],
    };

    return this.autoAdjust ? fallbackMap[this.placement] : [this.placement];
  }

  private getAvailableSpace(triggerRect: DOMRect, placement: TooltipPlacement) {
    const margin = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const spaceMap: Record<TooltipPlacement, number> = {
      top: triggerRect.top - margin,
      bottom: viewportHeight - triggerRect.bottom - margin,
      left: triggerRect.left - margin,
      right: viewportWidth - triggerRect.right - margin,
    };

    return spaceMap[placement];
  }

  private getPosition(triggerRect: DOMRect, contentRect: DOMRect, placement: TooltipPlacement) {
    const gap = this.showArrow ? 10 : 8;
    const margin = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const minLeft = margin;
    const maxLeft = Math.max(minLeft, viewportWidth - contentRect.width - margin);
    const minTop = margin;
    const maxTop = Math.max(minTop, viewportHeight - contentRect.height - margin);
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const triggerCenterY = triggerRect.top + triggerRect.height / 2;
    let left = triggerCenterX - contentRect.width / 2;
    let top = triggerCenterY - contentRect.height / 2;

    if (placement === "top") {
      top = triggerRect.top - contentRect.height - gap;
    } else if (placement === "bottom") {
      top = triggerRect.bottom + gap;
    } else if (placement === "left") {
      left = triggerRect.left - contentRect.width - gap;
    } else {
      left = triggerRect.right + gap;
    }

    left = Math.min(Math.max(left, minLeft), maxLeft);
    top = Math.min(Math.max(top, minTop), maxTop);

    return {
      left,
      top,
      arrowLeft: Math.min(Math.max(triggerCenterX - left, 12), contentRect.width - 12),
      arrowTop: Math.min(Math.max(triggerCenterY - top, 12), contentRect.height - 12),
    };
  }

  private updatePosition() {
    if (!this.open || !this.triggerEl || !this.contentEl) {
      return;
    }

    const triggerRect = this.triggerEl.getBoundingClientRect();
    const contentRect = this.contentEl.getBoundingClientRect();
    const nextPlacement = this.getPlacementOrder().find(placement => {
      const requiredSpace = placement === "top" || placement === "bottom" ? contentRect.height : contentRect.width;
      return this.getAvailableSpace(triggerRect, placement) >= requiredSpace;
    }) || this.placement;
    const position = this.getPosition(triggerRect, contentRect, nextPlacement);
    const nextStyle = {
      left: `${Math.round(position.left)}px`,
      top: `${Math.round(position.top)}px`,
      maxWidth: this.maxWidth,
      "--wt-tooltip-arrow-left": `${Math.round(position.arrowLeft)}px`,
      "--wt-tooltip-arrow-top": `${Math.round(position.arrowTop)}px`,
    };

    if (this.actualPlacement !== nextPlacement) {
      this.actualPlacement = nextPlacement;
    }

    if (
      this.tooltipStyle.left !== nextStyle.left ||
      this.tooltipStyle.top !== nextStyle.top ||
      this.tooltipStyle.maxWidth !== nextStyle.maxWidth ||
      this.tooltipStyle["--wt-tooltip-arrow-left"] !== nextStyle["--wt-tooltip-arrow-left"] ||
      this.tooltipStyle["--wt-tooltip-arrow-top"] !== nextStyle["--wt-tooltip-arrow-top"]
    ) {
      this.tooltipStyle = nextStyle;
    }
  }

  private scheduleOpen() {
    if (this.disabled || this.trigger !== "hover") {
      return;
    }

    this.clearTimers();
    this.showTimer = window.setTimeout(() => this.setOpen(true), Math.max(0, this.showAfter));
  }

  private scheduleClose() {
    if (this.trigger !== "hover") {
      return;
    }

    this.clearTimers();
    this.hideTimer = window.setTimeout(() => this.setOpen(false), Math.max(0, this.hideAfter));
  }

  private handleDocumentClick = (event: MouseEvent) => {
    if (this.trigger !== "click" || !this.open) {
      return;
    }

    const target = event.target as Node | null;
    if (target && !this.el.contains(target)) {
      this.setOpen(false);
    }
  };

  private handleTriggerClick = (event: MouseEvent) => {
    if (this.disabled) {
      return;
    }

    if (this.trigger === "click") {
      event.stopPropagation();
      this.setOpen(!this.open);
    }
  };

  private handleKeydown = (event: KeyboardEvent) => {
    if (this.disabled) {
      return;
    }

    if (event.key === "Escape") {
      this.setOpen(false);
      return;
    }

    if (this.trigger === "click" && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      this.setOpen(!this.open);
    }
  };

  render() {
    const classes = {
      [WT_TOOLTIP]: true,
      [`${WT_TOOLTIP}--${this.actualPlacement}`]: true,
      [`${WT_TOOLTIP}--open`]: this.open,
      [`${WT_TOOLTIP}--disabled`]: this.disabled,
    };

    return (
      <Host>
        <div
          class={classes}
          onMouseEnter={() => this.scheduleOpen()}
          onMouseLeave={() => this.scheduleClose()}
          onKeyDown={event => this.handleKeydown(event)}
        >
          <span
            class={`${WT_TOOLTIP}__trigger`}
            ref={el => (this.triggerEl = el)}
            tabIndex={this.disabled ? -1 : 0}
            aria-describedby={this.open ? this.tooltipId : undefined}
            onClick={event => this.handleTriggerClick(event)}
          >
            <slot></slot>
          </span>

          <span
            id={this.tooltipId}
            role="tooltip"
            class={`${WT_TOOLTIP}__content`}
            ref={el => (this.contentEl = el)}
            style={{ maxWidth: this.maxWidth, ...this.tooltipStyle }}
            aria-hidden={this.open ? "false" : "true"}
          >
            <slot name="content">{this.content}</slot>
            {this.showArrow ? <span class={`${WT_TOOLTIP}__arrow`}></span> : null}
          </span>
        </div>
      </Host>
    );
  }
}
