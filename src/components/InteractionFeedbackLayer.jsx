import { useEffect } from 'react';

const INTERACTIVE_SELECTOR = 'button, a[class], [role="button"], .ui-interactive';
const RELEASE_CLASS = 'ui-released';
const PRESSED_CLASS = 'ui-pressed';
const RELEASE_DURATION_MS = 220;

const getInteractiveTarget = (target) => {
  if (!(target instanceof Element)) {
    return null;
  }
  return target.closest(INTERACTIVE_SELECTOR);
};

export default function InteractionFeedbackLayer() {
  useEffect(() => {
    const timeouts = new WeakMap();

    const clearRelease = (element) => {
      const existing = timeouts.get(element);
      if (existing) {
        window.clearTimeout(existing);
        timeouts.delete(element);
      }
    };

    const markPressed = (element) => {
      if (!element) {
        return;
      }
      element.classList.add(PRESSED_CLASS);
      element.classList.remove(RELEASE_CLASS);
      clearRelease(element);
    };

    const markReleased = (element) => {
      if (!element) {
        return;
      }
      element.classList.remove(PRESSED_CLASS);
      element.classList.add(RELEASE_CLASS);
      clearRelease(element);
      const timeoutId = window.setTimeout(() => {
        element.classList.remove(RELEASE_CLASS);
        timeouts.delete(element);
      }, RELEASE_DURATION_MS);
      timeouts.set(element, timeoutId);
    };

    const handlePointerDown = (event) => {
      const target = getInteractiveTarget(event.target);
      if (!target || target.disabled) {
        return;
      }
      markPressed(target);
    };

    const handlePointerUp = (event) => {
      const target = getInteractiveTarget(event.target);
      if (!target || target.disabled) {
        return;
      }
      markReleased(target);
      window.dispatchEvent(
        new CustomEvent('ui:sfx', {
          detail: { type: 'tap', target },
        })
      );
    };

    const handlePointerCancel = (event) => {
      const target = getInteractiveTarget(event.target);
      if (!target) {
        return;
      }
      markReleased(target);
    };

    const handleKeyDown = (event) => {
      if (event.repeat) {
        return;
      }
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      const target = getInteractiveTarget(event.target);
      if (!target || target.disabled) {
        return;
      }
      markPressed(target);
    };

    const handleKeyUp = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      const target = getInteractiveTarget(event.target);
      if (!target || target.disabled) {
        return;
      }
      markReleased(target);
      window.dispatchEvent(
        new CustomEvent('ui:sfx', {
          detail: { type: 'tap', target },
        })
      );
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('pointerup', handlePointerUp, true);
    document.addEventListener('pointercancel', handlePointerCancel, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('pointerup', handlePointerUp, true);
      document.removeEventListener('pointercancel', handlePointerCancel, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
    };
  }, []);

  return null;
}
