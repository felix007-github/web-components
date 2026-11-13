import { Component, h, Host, Prop } from '@stencil/core';
import { WT_LOGO } from "@/utils"
@Component({
  tag: 'wt-logo',
  styleUrl: 'wt-logo.scss',
})
export class WtLogo {
  @Prop() size: number = 40;
  @Prop() environment: 'dev' | 'prod' | 'cert' = 'prod';
  @Prop() text: string = 'L+CP';
  render() {
    const logoMap = {
      prod: new URL('./assets/logo.png', import.meta.url).href,
      dev: new URL('./assets/logo-dev.png', import.meta.url).href,
      cert: new URL('./assets/logo-cert.png', import.meta.url).href,
    } as const;

    const currentLogo = logoMap[this.environment];

    return (
      <Host>
        <div class={WT_LOGO}>
          <div class="top-img">
            <img style={{ width: `${this.size}px`, height: `${this.size}px` }} src={currentLogo} alt="logo" />
          </div>
          {this.text && <div class="text">{this.text}</div>}
        </div>
      </Host>
    );
  }
}
