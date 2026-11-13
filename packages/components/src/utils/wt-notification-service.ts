import { MsgType } from './types';
import { preFix, WT_NOTIFICATION } from "@/utils";
export interface WtNotificationOptions {
  type?: MsgType;
  title?: string;
  message?: string;
  text?: string;
  actionLabel?: string;
  actionText?: string;
  showClose?: boolean;
  duration?: number;
  onActionClick?: () => void;
  onClose?: () => void;
}

export interface WtNotificationHandle {
  element: HTMLWtNotificationElement;
  close: () => void;
}

export const WtNotificationService = {
  open(options: WtNotificationOptions = {}): WtNotificationHandle {
    let bottom = "20px";
    const className = `${preFix}notification-service__container`;
    const existingContainer = document.querySelectorAll(`.${className}`);
    if (existingContainer.length > 0) {
      const maxHeightFromBottom = Array.from(existingContainer).reduce((maxHeight, item) => {
        const itemHeight = item.getBoundingClientRect().height;
        const itemBottom = parseFloat(getComputedStyle(item).bottom) || 0;
        return Math.max(maxHeight, itemHeight + itemBottom);
      }, 0);
      const totalHeight = maxHeightFromBottom + 10;
      bottom = `${totalHeight}px`;
    }
    const container = document.createElement('div');
    container.className = className;
    container.setAttribute('style', `bottom: ${bottom}`);
    document.body.appendChild(container);

    const notification = document.createElement(WT_NOTIFICATION) as HTMLWtNotificationElement;
    notification.type = options.type ?? 'info';
    notification.titleText = options.title ?? '';
    notification.message = options.message ?? options.text ?? '';
    notification.actionLabel = options.actionLabel ?? options.actionText ?? '';
    notification.showClose = options.showClose ?? true;

    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const cleanup = () => {
      if (disposed) {
        return;
      }

      disposed = true;

      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }

      notification.removeEventListener(`${preFix}action`, handleAction);
      notification.removeEventListener(`${preFix}close`, handleClose);

      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };

    const handleAction = () => {
      options.onActionClick?.();
    };

    const handleClose = () => {
      if (disposed) {
        return;
      }

      options.onClose?.();
      cleanup();
    };

    notification.addEventListener(`${preFix}action`, handleAction);
    notification.addEventListener(`${preFix}close`, handleClose);
    container.appendChild(notification);

    if ((options.duration ?? 0) > 0) {
      timer = setTimeout(() => {
        handleClose();
      }, options.duration);
    }

    return {
      element: notification,
      close: handleClose,
    };
  },
};
