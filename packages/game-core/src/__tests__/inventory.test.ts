import { describe, it, expect } from 'vitest';
import { addItem, removeItem, applyInventoryChanges, findItem, getItemCount } from '../inventory';
import type { InventoryItem } from '@isekai/contracts';

const makeItem = (id: string, count = 1): InventoryItem => ({
  id,
  name: `Item ${id}`,
  description: 'desc',
  type: 'potion',
  count,
});

describe('inventory', () => {
  describe('addItem', () => {
    it('adds a new item to empty inventory', () => {
      const result = addItem([], makeItem('sword', 1));
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('sword');
    });

    it('merges count when item already exists', () => {
      const existing = makeItem('potion', 2);
      const result = addItem([existing], makeItem('potion', 3));
      expect(result).toHaveLength(1);
      expect(result[0].count).toBe(5);
    });

    it('does not mutate original array', () => {
      const original = [makeItem('potion', 2)];
      addItem(original, makeItem('sword', 1));
      expect(original).toHaveLength(1);
    });
  });

  describe('removeItem', () => {
    it('removes item entirely when count is zero', () => {
      const items = [makeItem('potion', 1)];
      const result = removeItem(items, 'potion', 1);
      expect(result).toHaveLength(0);
    });

    it('decreases count when removing partial stack', () => {
      const items = [makeItem('potion', 5)];
      const result = removeItem(items, 'potion', 2);
      expect(result).toHaveLength(1);
      expect(result[0].count).toBe(3);
    });

    it('returns original when item not found', () => {
      const items = [makeItem('potion', 1)];
      const result = removeItem(items, 'sword', 1);
      expect(result).toBe(items);
    });
  });

  describe('applyInventoryChanges', () => {
    it('applies multiple add and remove operations', () => {
      const items = [makeItem('potion', 3), makeItem('sword', 1)];
      const result = applyInventoryChanges(items, [
        { action: 'add', item: makeItem('potion', 2) },
        { action: 'remove', item: makeItem('sword', 1) },
      ]);
      expect(result.find((i) => i.id === 'potion')?.count).toBe(5);
      expect(result.find((i) => i.id === 'sword')).toBeUndefined();
    });

    it('handles empty changes', () => {
      const items = [makeItem('potion', 1)];
      const result = applyInventoryChanges(items, []);
      expect(result).toEqual(items);
    });
  });

  describe('findItem and getItemCount', () => {
    it('finds an item by ID', () => {
      const items = [makeItem('potion', 5)];
      const found = findItem(items, 'potion');
      expect(found).toBeDefined();
      expect(found?.count).toBe(5);
    });

    it('returns undefined for missing item', () => {
      const found = findItem([], 'sword');
      expect(found).toBeUndefined();
    });

    it('returns count of 0 for missing item', () => {
      expect(getItemCount([], 'sword')).toBe(0);
    });
  });
});
