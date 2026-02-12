/**
 * useSwipeSheet — Adds pull-down-to-dismiss gesture to bottom sheets.
 * Tracks touch drags on the sheet and calls onClose() when the user
 * swipes down past the threshold.
 */

import { useRef, useCallback, type RefObject, type TouchEvent } from 'react';

interface SwipeSheetOptions {
  onClose: () => void;
  threshold?: number; // px to drag before close (default: 80)
}

export function useSwipeSheet({ onClose, threshold = 80 }: SwipeSheetOptions) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);

  const onTouchStart = useCallback((e: TouchEvent) => {
    const el = sheetRef.current;
    if (!el) return;
    // Only start swipe if scrolled to top (or sheet isn't scrollable)
    if (el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
    currentY.current = startY.current;
    isDragging.current = false;
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    const el = sheetRef.current;
    if (!el) return;
    const touchY = e.touches[0].clientY;
    const dy = touchY - startY.current;

    // Only start dragging if moving down and sheet is at top
    if (dy > 0 && el.scrollTop <= 0) {
      isDragging.current = true;
      currentY.current = touchY;
      // Apply transform as visual feedback
      const translateY = Math.min(dy * 0.6, 300); // dampened
      el.style.transform = `translateY(${translateY}px)`;
      el.style.transition = 'none';
      // Prevent scroll while swiping the sheet
      e.preventDefault();
    } else if (!isDragging.current) {
      // Normal scroll
      return;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    const el = sheetRef.current;
    if (!el) return;
    if (!isDragging.current) return;

    const dy = currentY.current - startY.current;
    isDragging.current = false;

    if (dy > threshold) {
      // Swipe far enough → animate out and close
      el.style.transition = 'transform 250ms ease-out';
      el.style.transform = 'translateY(100%)';
      setTimeout(onClose, 250);
    } else {
      // Snap back
      el.style.transition = 'transform 200ms cubic-bezier(0.32, 0.72, 0, 1)';
      el.style.transform = 'translateY(0)';
    }
  }, [onClose, threshold]);

  return {
    sheetRef: sheetRef as RefObject<HTMLDivElement>,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}
