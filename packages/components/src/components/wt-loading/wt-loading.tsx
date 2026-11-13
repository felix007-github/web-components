import { Component, h, Prop, Host } from "@stencil/core";
import { Size, WT_LOADING } from "@/utils";

@Component({
  tag: "wt-loading",
  styleUrl: "wt-loading.scss",
})
export class WtLoading {
  @Prop() size: number | Size = 24;
  @Prop() showText: boolean = true;
  @Prop() text: string = "Loading...";

  private get getText() {
    return this.showText ? this.text : "";
  }
  private get sizeStyle() {
    return typeof this.size === "number" ? { width: this.size + "px", height: this.size + "px" } : {};
  }

  render() {
    return (
      <Host>
        <div class={WT_LOADING}>
          <div class={`${WT_LOADING}__container`}>
            <div class={`${WT_LOADING}-icon loading ${WT_LOADING}-icon--${this.size}`} style={this.sizeStyle}>
              <svg class={`${WT_LOADING}-svg`} viewBox="0 0 24 24" fill="none">
                <g clip-path="url(#clip0_4445_171072)">
                  <path d="M11.2 0.799999C11.2 0.358171 11.5582 0 12 0C12.4418 0 12.8 0.358172 12.8 0.8V5.6H11.2V0.799999Z"
                    fill="#616161" />
                  <g opacity="0.1">
                    <path d="M7.09282 22.0995C6.87191 22.4821 6.38264 22.6132 6 22.3923C5.61737 22.1714 5.48627 21.6821 5.70718 21.2995L8.10718 17.1426L9.49282 17.9426L7.09282 22.0995Z" fill="#616161" />
                  </g>
                  <g opacity="0.2">
                    <path d="M2.70052 18.2928C2.31788 18.5137 1.82861 18.3826 1.6077 18C1.38678 17.6174 1.51788 17.1281 1.90052 16.9072L6.05744 14.5072L6.85744 15.8928L2.70052 18.2928Z" fill="#616161" />
                  </g>
                  <g opacity="0.4">
                    <path d="M0.799999 12.8C0.358171 12.8 0 12.4418 0 12C0 11.5582 0.358172 11.2 0.8 11.2L5.6 11.2V12.8L0.799999 12.8Z" fill="#616161" />
                  </g>
                  <g opacity="0.6">
                    <path d="M1.90051 7.09281C1.51788 6.8719 1.38678 6.38262 1.6077 5.99999C1.82861 5.61736 2.31788 5.48626 2.70052 5.70717L6.85744 8.10717L6.05744 9.49281L1.90051 7.09281Z" fill="#616161" />
                  </g>
                  <g opacity="0.8">
                    <path d="M5.70718 2.70051C5.48626 2.31788 5.61736 1.8286 6 1.60769C6.38263 1.38678 6.87191 1.51788 7.09282 1.90051L9.49282 6.05743L8.10718 6.85743L5.70718 2.70051Z" fill="#616161" />
                  </g>
                </g>
                <defs>
                  <clipPath id="clip0_4445_171072">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            {this.showText && <div class={`${WT_LOADING}-text`}>{this.getText}</div>}
          </div>
        </div>
      </Host>
    )
  }
}