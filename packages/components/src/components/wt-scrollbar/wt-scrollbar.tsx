import { Component, Host, Prop, Event, EventEmitter, h, Method } from '@stencil/core';

@Component({
  tag: 'wt-scrollbar',
  styleUrl: 'wt-scrollbar.scss',
  shadow: false,
})
export class WtScrollbar {
  /**
   * 尺寸大小
   */
  @Prop() size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * 是否总是显示滚动条
   */
  @Prop() always: boolean = false;

  @Prop() wrapperClass: { [key: string]: boolean } = {};

  /**
   * 滚动事件
   */
  @Event({ eventName: 'wt-scroll' }) scrollEvent!: EventEmitter<{
    scrollTop: number;
    scrollLeft: number;
    originalEvent: Event;
  }>;

  private scrollTimer: ReturnType<typeof setTimeout> | null = null;
  private scrollRafId: number | null = null;
  private latestScrollEvent: Event | null = null;
  private _wrapperRef: HTMLDivElement | null = null;

  componentDidLoad() {
    // 确保 scroll 事件绑定正确
    if (this._wrapperRef) {
      this._wrapperRef.addEventListener('scroll', this.handleScroll, { passive: true });
    }
  }

  componentWillUnload() {
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = null;
    }
    if (this.scrollRafId !== null) {
      cancelAnimationFrame(this.scrollRafId);
      this.scrollRafId = null;
    }
    if (this._wrapperRef) {
      this._wrapperRef.removeEventListener('scroll', this.handleScroll);
    }
  }

  private handleScroll = (event: Event) => {
    this.latestScrollEvent = event;
    this.scheduleScrollEmit();

    if (!this.always) {
      this._wrapperRef?.classList.add('is-scrolling');
      if (this.scrollTimer) {
        clearTimeout(this.scrollTimer);
      }
      this.scrollTimer = setTimeout(() => {
        this._wrapperRef?.classList.remove('is-scrolling');
        this.scrollTimer = null;
      }, 1000); // 1秒后隐藏滚动条
    }
  };

  private scheduleScrollEmit() {
    if (this.scrollRafId !== null) return;

    this.scrollRafId = requestAnimationFrame(() => {
      this.scrollRafId = null;
      const target = this._wrapperRef;
      const originalEvent = this.latestScrollEvent;
      this.latestScrollEvent = null;
      if (!target || !originalEvent) return;

      this.scrollEvent.emit({
        scrollTop: target.scrollTop,
        scrollLeft: target.scrollLeft,
        originalEvent,
      });
    });
  }

  /**
   * 滚动到指定位置，参数为一个对象，可以同时设置 left 和 top。
   */
  @Method()
  async wtScrollTo(options: { left?: number; top?: number }): Promise<void> {
    if (this._wrapperRef) {
      this._wrapperRef.scrollTo(options);
    }
  }

  /**
   * 设置竖向滚动条滚动到指定位置。
   */
  @Method()
  async wtSetScrollTop(top: number): Promise<void> {
    if (this._wrapperRef) {
      this._wrapperRef.scrollTop = top;
    }
  }

  /**
   * 设置横向滚动条滚动到指定位置。
   */
  @Method()
  async wtSetScrollLeft(left: number): Promise<void> {
    if (this._wrapperRef) {
      this._wrapperRef.scrollLeft = left;
    }
  }

  /**
   * 获取滚动元素的引用，可以通过该引用访问滚动元素的属性和方法。
   */
  @Method()
  async wtWrapRef(): Promise<HTMLDivElement | null> {
    return this._wrapperRef;
  }

  render() {
    const wrapClass = {
      'wt-scrollbar-wrap': true,
      'is-always': this.always,
      [`size-${this.size}`]: true,
      ...this.wrapperClass,
    };

    return (
      <Host>
        <div
          class={wrapClass}
          ref={(el) => (this._wrapperRef = el as HTMLDivElement)}
        >
          <div class="wt-scrollbar-view">
            <slot />
          </div>
        </div>
      </Host>
    );
  }
}
