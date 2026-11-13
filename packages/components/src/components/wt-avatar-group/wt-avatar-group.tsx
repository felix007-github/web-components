import { Component, Element, Prop, State, h, Host } from "@stencil/core";
import { Size, AvatarShape, AvatarItem, WT_AVATAR_GROUP } from "@/utils";

@Component({
  tag: "wt-avatar-group",
  styleUrl: "wt-avatar-group.scss",
})
export class WtAvatarGroup {
  @Element() host!: HTMLElement;
  @Prop() max: number = 5;
  @Prop() size: Size = "medium";
  @Prop() list: AvatarItem[] = [];
  @Prop() shape: AvatarShape = "circle";

  @State() private slotOverflowCount = 0;

  private slotEl?: HTMLSlotElement;

  private get normalizedMax() {
    return Number.isFinite(this.max) ? Math.max(0, Math.trunc(this.max)) : 0;
  }

  componentDidRender() {
    if (!this.list.length) {
      this.syncSlottedAvatars();
      return;
    }

    if (this.slotOverflowCount !== 0) {
      this.slotOverflowCount = 0;
    }
  }

  private getVisibleItems() {
    return this.list.slice(0, this.normalizedMax);
  }

  private getOverflowCount() {
    return Math.max(this.list.length - this.normalizedMax, 0);
  }

  private syncSlottedAvatars() {
    if (!this.slotEl) {
      return;
    }

    const avatars = this.slotEl
      .assignedElements()
      .filter((element) => element.tagName.toLowerCase() === "wt-avatar") as HTMLElement[];
    const hiddenCount = Math.max(avatars.length - this.normalizedMax, 0);

    avatars.forEach((avatar, index) => {
      const resolvedShape = (avatar.getAttribute("shape") as AvatarShape) || this.shape;
      const isVisible = index < this.normalizedMax;

      avatar.style.display = isVisible ? "inline-block" : "none";
      avatar.style.position = "relative";
      avatar.style.zIndex = String(Math.max(1, avatars.length + index));
      avatar.style.marginInlineStart = index === 0 ? "0" : "calc(var(--wt-avatar-group-overlap) * -1)";
      avatar.style.padding = "1px";
      avatar.style.verticalAlign = "middle";
      avatar.style.background = "linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.92) 100%)";
      avatar.style.boxShadow = "0 0 0 1px rgba(148, 163, 184, 0.18), 0 10px 22px rgba(15, 23, 42, 0.08)";
      avatar.style.borderRadius = resolvedShape === "square" ? "calc(var(--wt-radius-lg) + 2px)" : "var(--wt-radius-full)";
      avatar.style.transition = "transform var(--wt-transition-transform), box-shadow var(--wt-transition-shadow)";
    });

    if (this.slotOverflowCount !== hiddenCount) {
      this.slotOverflowCount = hiddenCount;
    }
  }

  private handleSlotChange = () => {
    this.syncSlottedAvatars();
  };

  private renderOverflow(count: number) {
    return (
      <div
        class={{
          [this.size]: true,
          [`${WT_AVATAR_GROUP}__overflow`]: true,
          [`${WT_AVATAR_GROUP}__overflow--${this.shape}`]: true,
        }}
        aria-label={`+${count} more avatars`}
      >
        <span class={`${WT_AVATAR_GROUP}__overflow-text`}>+{count}</span>
      </div>
    );
  }

  render() {
    const hasList = this.list.length > 0;
    const visibleItems = hasList ? this.getVisibleItems() : [];
    const overflowCount = hasList ? this.getOverflowCount() : this.slotOverflowCount;

    return (
      <Host>
        <main class={WT_AVATAR_GROUP}>
          <div class={`${WT_AVATAR_GROUP}__content`}>
            {hasList
              ? visibleItems.map((item, index) => (
                  <div
                    class={{
                      [`${WT_AVATAR_GROUP}__item`]: true,
                      [`${WT_AVATAR_GROUP}__item--${this.shape}`]: true,
                    }}
                    style={{ zIndex: `${visibleItems.length + index - 1}` }}
                  >
                    <wt-avatar
                      key={index}
                      src={item.src || ""}
                      alt={item.alt || ""}
                      text={item.text || ""}
                      size={this.size}
                      shape={this.shape}
                      styles={item.styles || {}}
                    />
                  </div>
                ))
              : (
                  <slot
                    ref={(element) => {
                      this.slotEl = element as HTMLSlotElement;
                    }}
                    onSlotchange={this.handleSlotChange}
                  ></slot>
                )}
            {overflowCount > 0 ? this.renderOverflow(overflowCount) : null}
          </div>
        </main>
      </Host>
    );
  }
}