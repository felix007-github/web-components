export class ControllerEvent<T> {
  private listeners = new Set<(detail: T) => void>();
  private latest?: { detail: T };

  constructor(private readonly remember = false) {}

  emit(detail: T) {
    if (this.remember) this.latest = { detail };
    this.listeners.forEach((listener) => listener(detail));
  }

  subscribe(listener: (detail: T) => void) {
    this.listeners.add(listener);
    if (this.latest) listener(this.latest.detail);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

/** Framework-independent view notifications. Document state remains in the
 * editor engines and HtmlEditorSession; React only subscribes to UI changes. */
export class EditorController {
  private viewRevision = 0;
  private listeners = new Set<() => void>();
  private frames = new Map<number, (() => void) | undefined>();
  private timers = new Set<number>();

  readonly subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  readonly getSnapshot = () => this.viewRevision;

  protected notifyView() {
    this.viewRevision++;
    this.listeners.forEach((listener) => listener());
  }

  protected requestFrame(
    callback: FrameRequestCallback,
    onCancel?: () => void
  ) {
    const id = window.requestAnimationFrame((time) => {
      this.frames.delete(id);
      callback(time);
    });
    this.frames.set(id, onCancel);
    return id;
  }

  protected nextFrame() {
    return new Promise<void>((resolve) =>
      this.requestFrame(() => resolve(), resolve)
    );
  }

  async whenReady() {}

  protected setDelay(callback: () => void, delay: number) {
    const id = window.setTimeout(() => {
      this.timers.delete(id);
      callback();
    }, delay);
    this.timers.add(id);
    return id;
  }

  protected clearDelay(id: number) {
    window.clearTimeout(id);
    this.timers.delete(id);
  }

  dispose() {
    this.frames.forEach((onCancel, id) => {
      window.cancelAnimationFrame(id);
      onCancel?.();
    });
    this.frames.clear();
    this.timers.forEach((id) => window.clearTimeout(id));
    this.timers.clear();
  }
}
