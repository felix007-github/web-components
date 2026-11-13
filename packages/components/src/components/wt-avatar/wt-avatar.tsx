import { Prop, Component, h, Host } from '@stencil/core';
import { WT_AVATAR, Size, AvatarShape } from "@/utils";
@Component({
  tag: 'wt-avatar',
  styleUrl: 'wt-avatar.scss',
})
export class WtAvatar {
  @Prop() src: string = '';
  @Prop() alt: string = '';
  @Prop() text: string = 'User';
  @Prop() size: Size = 'medium';
  @Prop() shape: AvatarShape = 'circle';
  @Prop() styles: { [key: string]: string } = {};
  render() {
    const showText = () => {
      if (!this.text) return '';

      // 如果是中文，取前两个字符
      if (/[\u4e00-\u9fa5]/.test(this.text)) {
        return this.text.slice(0, 2);
      }

      // 如果是英文，取首字母大写
      const words = this.text.trim().split(/\s+/);
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      } else {
        return words[0].slice(0, 2).toUpperCase();
      }
    };

    const classes = {
      'is-image': !!this.src,
      [`${WT_AVATAR}--content`]: true,
      [this.size]: true, // small | medium | large
      // 形状类
      [`${WT_AVATAR}--${this.shape}`]: true, // circle | square
    };

    return (
      <Host>
        <div class={WT_AVATAR}>
          <div class={classes} style={this.styles}>
            {/*  图像模式  */}
            {this.src ? <img class="img" src={this.src} alt={this.alt} /> : null}
            {/*  文字模式  */}
            {this.text && !this.src ? <span class="avatar-text">{showText()}</span> : null}
            {/* slot模式 */}
            {!this.src && !this.text ? <slot></slot> : null}
          </div>
        </div>
      </Host>
    );
  }
}
