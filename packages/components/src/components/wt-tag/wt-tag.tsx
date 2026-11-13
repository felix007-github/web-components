import { Component, Prop, State, h, Host } from "@stencil/core";
import { WT_TAG, TagType } from "@/utils";

@Component({
  tag: "wt-tag",
  styleUrl: "wt-tag.scss",
})
export class WtTag {
  @Prop() type: TagType = "primary";

  @Prop() variant: "solid" | "outlined" = "solid"

  @State() entered = false;

  componentDidLoad() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.entered = true;
      });
    });
  }

  render() {
    return (
      <Host>
        <div class={`${WT_TAG} ${WT_TAG}--${this.type} ${this.variant} ${this.entered ? `${WT_TAG}--entered` : ""}`.trim()}>
          <span class={`${WT_TAG}-span`}>
            <slot></slot>
          </span>
        </div>
      </Host>
    )
  }
}