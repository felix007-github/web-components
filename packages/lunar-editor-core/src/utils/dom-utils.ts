export type ScrollWithinContainerOptions = {
  behavior?: ScrollBehavior;
  block?: 'start' | 'center';
};

export function clearEditorSelection(editorEl?: HTMLElement) {
  if (!editorEl) {
    return;
  }

  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLElement && editorEl.contains(activeElement)) {
    activeElement.blur();
  }

  const selection = window.getSelection();
  if (!selection?.rangeCount) {
    return;
  }

  const anchorNode = selection.anchorNode;
  const focusNode = selection.focusNode;
  if (
    (anchorNode && editorEl.contains(anchorNode)) ||
    (focusNode && editorEl.contains(focusNode))
  ) {
    selection.removeAllRanges();
  }
}

export function scrollElementWithinContainer(
  container: HTMLElement,
  target: HTMLElement,
  options: ScrollWithinContainerOptions = {},
) {
  const containerBox = container.getBoundingClientRect();
  const targetBox = target.getBoundingClientRect();
  const offsetTop = targetBox.top - containerBox.top + container.scrollTop;
  const top = options.block === 'center'
    ? offsetTop - Math.max(0, (container.clientHeight - targetBox.height) / 2)
    : offsetTop - 16;

  container.scrollTo({
    top: Math.max(0, top),
    behavior: options.behavior || 'auto',
  });
}

export function queryElementById(container: HTMLElement, id: string) {
  const selector =
    typeof CSS !== 'undefined' && CSS.escape
      ? `#${CSS.escape(id)}`
      : `[id="${id.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`;

  return container.querySelector<HTMLElement>(selector);
}

export function getHashTargetId(href: string) {
  let hash: string;
  try {
    hash = href.startsWith('#')
      ? href.slice(1)
      : new URL(href, window.location.href).hash.slice(1);
  } catch {
    return '';
  }

  if (!hash) {
    return '';
  }

  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
}

export function handleFootnoteAnchorClick(event: MouseEvent, container?: HTMLElement) {
  const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[data-type="footnote"][href]');
  if (!container || !anchor || !container.contains(anchor)) {
    return false;
  }

  const targetId = getHashTargetId(anchor.getAttribute('href') || '');
  const target = targetId ? queryElementById(container, targetId) : null;
  if (!target) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  scrollElementWithinContainer(container, target, { behavior: 'smooth', block: 'center' });
  return true;
}
