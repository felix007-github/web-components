import { Component, Prop, Event, EventEmitter, Host, h } from '@stencil/core';
import { MsgType, WT_NOTIFICATION } from '@/utils';
@Component({
  tag: 'wt-notification',
  styleUrl: 'wt-notification.scss',
})
export class WtNotification {
  @Prop() type: MsgType = 'info';
  @Prop() message: string = '';
  @Prop() titleText: string = '';
  @Prop() actionLabel: string = '';
  @Prop() isFullWidth: boolean = false;
  @Prop() showClose: boolean = true;
  @Event({ eventName: 'wt-close' }) close!: EventEmitter; // 自定义关闭事件
  @Event({ eventName: 'wt-action' }) action!: EventEmitter; // 自定义操作事件

  private handleClose() {
    this.close.emit();
  }

  private handleAction() {
    this.action.emit();
  }

  render() {
    return (
      <Host>
        <div class={`${WT_NOTIFICATION} ${this.isFullWidth ? `${WT_NOTIFICATION}--full-width` : ''}`}>
          <div class={`${WT_NOTIFICATION}__content`}>
            <div class={`${WT_NOTIFICATION}__message ${WT_NOTIFICATION}__message--${this.type}`}>
              <div class="left-box">
                {this.type === 'success' && <wt-icon name="check_circle_filled"></wt-icon>}
                {this.type === 'error' && <wt-icon name="cross_circle_outline"></wt-icon>}
                {this.type === 'info' && <wt-icon name="critical_filled"></wt-icon>}
                {this.type === 'warning' && <wt-icon name="warning_filled"></wt-icon>}
                <div class="line"></div>
                <div class="msg-wrapper">
                  {this.titleText && <div class="msg-title">{this.titleText}</div>}
                  <div class="msg-text">{this.message}</div>
                  {this.actionLabel && !this.isFullWidth && (
                    <div class="msg-action" onClick={() => this.handleAction()}>
                      {this.actionLabel}
                    </div>
                  )}
                </div>
              </div>
              <div class="right-box">
                {this.actionLabel && this.isFullWidth && (
                  <div class="msg-action" onClick={() => this.handleAction()}>
                    {this.actionLabel}
                  </div>
                )}
                {this.showClose && (
                  <div class="close-btn" onClick={() => this.handleClose()}>
                    <wt-icon name="clear"></wt-icon>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
