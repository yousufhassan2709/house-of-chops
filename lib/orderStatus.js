// Single source of truth for order lifecycle states.
// Mirrors the `status` column in supabase/orders.sql.
// Lifecycle: pending_payment → new → cooking → ready → delivered.

export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  NEW: 'new',
  COOKING: 'cooking',
  READY: 'ready',
  DELIVERED: 'delivered',
};

// Statuses shown on the live kitchen board.
export const KITCHEN_ACTIVE_STATUSES = [
  ORDER_STATUS.NEW,
  ORDER_STATUS.COOKING,
  ORDER_STATUS.READY,
];

// Statuses the kitchen is allowed to set. Never pending_payment —
// only a verified payment may create a live order.
export const KITCHEN_SETTABLE_STATUSES = [
  ORDER_STATUS.NEW,
  ORDER_STATUS.COOKING,
  ORDER_STATUS.READY,
  ORDER_STATUS.DELIVERED,
];

// Board columns with their forward transition.
export const KITCHEN_COLUMNS = [
  { key: ORDER_STATUS.NEW, label: 'New', next: ORDER_STATUS.COOKING, cta: 'Start cooking' },
  { key: ORDER_STATUS.COOKING, label: 'Cooking', next: ORDER_STATUS.READY, cta: 'Mark ready' },
  { key: ORDER_STATUS.READY, label: 'Ready / Out', next: ORDER_STATUS.DELIVERED, cta: 'Delivered' },
];
