import {
  ControllerEvent,
  type EditorController,
} from '@mache-hangar/lunar-editor-core/controllers/controller';
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';

export function useController<T extends EditorController>(create: () => T) {
  const [controller] = useState(create);
  useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  return controller;
}

export function useControllerProps<T>(
  controller: { updateProps(props: T): Promise<void> },
  props: T
) {
  useLayoutEffect(() => {
    void controller.updateProps(props);
  }, [controller, props]);
}

export function useControllerEvents(
  controller: object,
  props: object,
  events: readonly string[]
) {
  const latest = useRef(props);
  useLayoutEffect(() => {
    latest.current = props;
  });
  useLayoutEffect(() => {
    const teardowns = events.map((name) => {
      const channel = Reflect.get(controller, name) as ControllerEvent<unknown>;
      return channel.subscribe((detail) => {
        const callback = Reflect.get(
          latest.current,
          `on${name[0].toUpperCase()}${name.slice(1)}`
        );
        if (typeof callback === 'function') callback(detail);
      });
    });
    return () => {
      teardowns.forEach((teardown) => teardown());
    };
  }, [controller, events]);
}
