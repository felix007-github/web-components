import { Component, Prop, Host, h } from '@stencil/core';
import { warmupIconsRegistration, WT_ICON } from '@/utils';

@Component({
  tag: 'wt-icon', // 组件标签名（必须小写、含连字符）
  styleUrl: 'wt-icon.scss', // 样式文件
  shadow: false,
})
export class WtIcon {
  /**
   * 字体图标名称
   */
  @Prop() name!: string;
  /**
   * icon 尺寸 默认 20
   */
  @Prop() size: string = ""
  /**
   * color 颜色
   */
  @Prop() color: string = "";
  /**
   * styles 传入的css样式
   */
  @Prop() styles: object = {};
  /**
   * 传入的class名称
   */
  @Prop() classNames: string = '';
  /**
   * 旋转的角度
   */
  @Prop() rotate: number = 0;
  /**
   * 是否自动旋转
   */
  @Prop() spin: boolean = false;

  componentWillLoad() {
    warmupIconsRegistration();
  }

  render() {
    const style = Object.assign(
      {
        color: this.color,
      },
      this.styles || {},
    ) as Record<string, string>;

    if (this.size) {
      const value = !Number.isNaN(Number(this.size)) ? this.size + 'px' : this.size;
      style.width = value;
      style.height = value;
    }

    if (this.rotate && Number.isSafeInteger(this.rotate)) {
      style.transform = `rotate(${this.rotate}deg)`;
    }
    const IconName = this.name ? `${WT_ICON}-${this.name}` : 'slot';

    return (
      <Host class={`${WT_ICON}`}>
        <IconName class={`${this.classNames} ${this.spin ? 'spin' : ''}`} style={style}></IconName>
      </Host>
    );
  }
}
