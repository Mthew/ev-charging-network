# Accessibility Fix: DialogContent Title Requirement

## Problem

The `DialogContent` component (which is used by `SheetContent` under the hood) requires a `DialogTitle` for accessibility compliance. Screen reader users need to know what the dialog is about.

## Error Message

```
[`DialogContent` requires a `DialogTitle` for the component to be accessible for screen reader users.

If you want to hide the `DialogTitle`, you can wrap it with our VisuallyHidden component.]
```

## Solution

When using `SheetContent` (or any Dialog-based component), you must include a `SheetTitle`. If you don't want the title to be visually displayed, wrap it with the `VisuallyHidden` component.

### Implementation

```tsx
import { SheetContent, SheetTitle, VisuallyHidden } from "@/components/ui";

// Inside your SheetContent
<SheetContent>
  <VisuallyHidden>
    <SheetTitle>Navigation Menu</SheetTitle>
  </VisuallyHidden>
  {/* Rest of your content */}
</SheetContent>;
```

### Components Created

1. **`src/components/ui/visually-hidden.tsx`** - Component that hides content visually but keeps it accessible to screen readers
2. **Updated `src/components/ui/index.ts`** - Exports the new VisuallyHidden component
3. **Updated `src/components/MobileNav.tsx`** - Added hidden SheetTitle for accessibility

### Key Points

- ✅ **Screen Reader Accessible** - Title is available to assistive technology
- ✅ **Visually Hidden** - Title doesn't affect the visual layout
- ✅ **WCAG Compliant** - Follows accessibility guidelines
- ✅ **No Breaking Changes** - Existing functionality preserved

### Testing

- Screen readers will announce "Navigation Menu" when the sheet opens
- Visual appearance remains unchanged
- No console warnings about accessibility issues

This fix ensures your navigation is fully accessible to users with disabilities while maintaining the existing visual design.
