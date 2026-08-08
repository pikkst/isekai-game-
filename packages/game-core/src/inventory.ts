import type { InventoryItem } from '@isekai/contracts';

export interface InventoryChange {
  action: 'add' | 'remove';
  item: InventoryItem;
}

export function addItem(items: InventoryItem[], item: InventoryItem): InventoryItem[] {
  const existingIdx = items.findIndex((i) => i.id === item.id);
  if (existingIdx >= 0) {
    const updated = [...items];
    updated[existingIdx] = { ...updated[existingIdx], count: updated[existingIdx].count + item.count };
    return updated;
  }
  return [...items, item];
}

export function removeItem(items: InventoryItem[], itemId: string, count: number): InventoryItem[] {
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx < 0) return items;

  const item = items[idx];
  if (item.count > count) {
    const updated = [...items];
    updated[idx] = { ...item, count: item.count - count };
    return updated;
  }
  return items.filter((i) => i.id !== itemId);
}

export function applyInventoryChanges(
  items: InventoryItem[],
  changes: InventoryChange[],
): InventoryItem[] {
  let updated = [...items];
  for (const change of changes) {
    if (change.action === 'add') {
      updated = addItem(updated, change.item);
    } else if (change.action === 'remove') {
      updated = removeItem(updated, change.item.id, change.item.count);
    }
  }
  return updated;
}

export function findItem(items: InventoryItem[], itemId: string): InventoryItem | undefined {
  return items.find((i) => i.id === itemId);
}

export function getItemCount(items: InventoryItem[], itemId: string): number {
  const item = findItem(items, itemId);
  return item ? item.count : 0;
}
