export function defineCollisionGroup() {
  let membership = 0;
  let filter = 0;

  return {
    isPartOfGroups(...groups: number[]) {
      for (const group of groups) {
        membership |= group;
      }
      return this;
    },
    canInteractWith(...groups: number[]) {
      for (const group of groups) {
        filter |= group;
      }
      return this;
    },
    get() {
      return (membership << 16) | filter;
    },
  } as const;
}
