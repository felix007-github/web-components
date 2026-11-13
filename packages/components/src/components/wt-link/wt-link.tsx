import { Component, Host, Prop, h } from '@stencil/core';
import { Size, WT_LINK } from '@/utils';

@Component({
  tag: 'wt-link',
  styleUrl: 'wt-link.scss',
  shadow: false,
})
export class WtLink {
  @Prop() href = '';

  @Prop() target: '_self' | '_blank' | '_parent' | '_top' = '_self';

  @Prop() rel = '';

  @Prop() size: Size = 'medium';

  @Prop() underline = false;

  @Prop() disabled = false;

  @Prop() color = 'rgba(69, 90, 100, 1)';

  @Prop() text = '';

  private handleClick(event: MouseEvent) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (!this.href) {
      event.preventDefault();
    }
  }

  render() {
    const linkClasses = {
      [WT_LINK]: true,
      [`${WT_LINK}--${this.size}`]: true,
      'is-underline': this.underline,
      'is-disabled': this.disabled,
    };

    const safeRel = this.target === '_blank' ? this.rel || 'noopener noreferrer' : this.rel || undefined;

    return (
      <Host style={{ '--wt-link-color': this.color }}>
        <a
          class={linkClasses}
          href={this.disabled ? undefined : this.href || '#'}
          target={this.disabled ? undefined : this.target}
          rel={this.disabled ? undefined : safeRel}
          aria-disabled={this.disabled ? 'true' : undefined}
          tabIndex={this.disabled ? -1 : 0}
          onClick={(event) => this.handleClick(event)}
        >
          <slot>{this.text}</slot>
        </a>
      </Host>
    );
  }
}
