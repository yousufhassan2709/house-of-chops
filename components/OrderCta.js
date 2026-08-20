'use client';
import { ORDERING_ENABLED } from '@/lib/data';
import { useBranchPicker } from './BranchPicker';

// Drop-in replacement for the old `<a {...ORDER_LINK}>` anchors. While
// ORDERING_ENABLED is false it opens the branch picker; when the in-house
// flow returns it becomes a plain /order link and the picker never appears.
export default function OrderCta({ className, children, onClick, ...rest }) {
  const openPicker = useBranchPicker();

  if (ORDERING_ENABLED) {
    return (
      <a href="/order" className={className} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        if (onClick) onClick(e);
        openPicker();
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
