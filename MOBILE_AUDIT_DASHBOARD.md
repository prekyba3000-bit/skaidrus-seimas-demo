# Mobile Audit Report: Dashboard Page

**Date:** 2026-01-12  
**Target Devices:** iPhone SE (375px), iPhone 12/13 (390px)  
**Auditor:** QA Engineer (Mobile-First Mindset)

## Executive Summary

The Dashboard page has several mobile responsiveness issues that will cause UI problems on screens 375px-390px wide. The main concerns are:

1. **Fixed-size decorative elements** that are too large for mobile
2. **Ring chart** with fixed 256px size that will overflow
3. **3-column grid** that will be cramped on small screens
4. **Bill item layouts** that may overflow horizontally
5. **Text sizes** that may be too large for mobile
6. **Touch targets** that may be too small

## Critical Issues (Must Fix)

### 1. Hero Tile - Ring Chart Size

**Location:** `Dashboard.tsx` Line 44-57  
**Issue:** Fixed `size-64` (256px) ring chart will overflow on 375px screens  
**Impact:** Chart will be cut off or cause horizontal scroll  
**Fix:**

```tsx
// Change from:
<div className="relative size-64 flex items-center justify-center">
// To:
<div className="relative size-48 sm:size-56 md:size-64 flex items-center justify-center">
```

**Also fix center text:**

```tsx
// Change from:
<span className="text-5xl font-bold text-white tracking-tighter drop-shadow-md">85%</span>
// To:
<span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tighter drop-shadow-md">85%</span>
```

### 2. Hero Tile - Background Decoration

**Location:** `Dashboard.tsx` Line 28  
**Issue:** Fixed `w-64 h-64` (256px) decoration is too large for mobile  
**Impact:** Unnecessary visual clutter, may cause layout issues  
**Fix:**

```tsx
// Change from:
<div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
// To:
<div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
```

### 3. Hero Tile - Stats Grid (3 Columns)

**Location:** `Dashboard.tsx` Line 60  
**Issue:** `grid-cols-3` will be cramped on 375px screens (125px per column)  
**Impact:** Text may overflow, stats will be hard to read  
**Fix:**

```tsx
// Change from:
<div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4 z-10">
// To:
<div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 border-t border-white/5 pt-4 z-10">
// And reduce text sizes:
<span className="text-xs sm:text-sm text-emerald-400">Sessions</span>
<span className="text-sm sm:text-base md:text-lg text-white font-semibold">42</span>
```

### 4. Recent Voting - Bill Item Layout

**Location:** `Dashboard.tsx` Line 123-136  
**Issue:** Flex layout with `justify-between` may cause overflow on small screens  
**Impact:** Bill titles may be cut off, status badges may overflow  
**Fix:**

```tsx
// Change from:
<div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/30 hover:bg-emerald-900/50 transition-colors group cursor-pointer">
  <div className="flex items-center gap-4">
    // ... content
  </div>
  <span className="px-2.5 py-1 rounded-md ... shrink-0">
// To:
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/30 hover:bg-emerald-900/50 transition-colors group cursor-pointer">
  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
    // ... content (add truncate to title)
    <p className="text-sm font-medium text-white group-hover:text-primary transition-colors truncate">...</p>
  </div>
  <span className="px-2.5 py-1 rounded-md ... shrink-0 self-start sm:self-center">
```

### 5. Stat Cards - Text Sizes

**Location:** `Dashboard.tsx` Line 88, 107  
**Issue:** `text-2xl` and `text-3xl` may be too large for mobile  
**Impact:** Text may overflow or cause layout shifts  
**Fix:**

```tsx
// Line 88: Change from:
<p className="text-2xl font-bold text-white mt-1">€2,400,000</p>
// To:
<p className="text-xl sm:text-2xl font-bold text-white mt-1">€2,400,000</p>

// Line 107: Change from:
<p className="text-3xl font-bold text-primary mt-1 drop-shadow-[0_0_15px_rgba(245,159,10,0.4)]">142</p>
// To:
<p className="text-2xl sm:text-3xl font-bold text-primary mt-1 drop-shadow-[0_0_15px_rgba(245,159,10,0.4)]">142</p>
```

### 6. Top Delegates - Button Text

**Location:** `Dashboard.tsx` Line 220  
**Issue:** "View All 141 Members" text may be too long for mobile  
**Impact:** Button may overflow or text may wrap awkwardly  
**Fix:**

```tsx
// Change from:
<button className="w-full mt-4 py-3 rounded-xl bg-emerald-900/30 border border-emerald-800/50 text-emerald-300 text-sm font-medium hover:bg-emerald-800/50 hover:text-white transition-all">
  View All 141 Members
</button>
// To:
<button className="w-full mt-4 py-3 rounded-xl bg-emerald-900/30 border border-emerald-800/50 text-emerald-300 text-xs sm:text-sm font-medium hover:bg-emerald-800/50 hover:text-white transition-all">
  <span className="hidden sm:inline">View All 141 Members</span>
  <span className="sm:hidden">View All</span>
</button>
```

## Medium Priority Issues

### 7. Hero Tile - Padding

**Location:** `Dashboard.tsx` Line 26  
**Issue:** `p-6` padding may be too much on mobile  
**Impact:** Reduces available space for content  
**Fix:**

```tsx
// Change from:
<div className="gemstone-card rounded-2xl p-6 xl:col-span-2 xl:row-span-2 ...">
// To:
<div className="gemstone-card rounded-2xl p-4 sm:p-5 md:p-6 xl:col-span-2 xl:row-span-2 ...">
```

### 8. Stat Cards - Icon Sizes

**Location:** `Dashboard.tsx` Line 80, 99  
**Issue:** Icons may be too large relative to card size on mobile  
**Impact:** Visual imbalance  
**Fix:**

```tsx
// Change from:
<Wallet className="w-5 h-5" />
// To:
<Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
```

### 9. Recent Voting - Header Button

**Location:** `Dashboard.tsx` Line 119  
**Issue:** "View All" button may be too small for touch (text-xs)  
**Impact:** Difficult to tap on mobile  
**Fix:**

```tsx
// Change from:
<button className="text-xs text-primary hover:text-amber-400 font-medium hover:underline">View All</button>
// To:
<button className="text-sm sm:text-xs text-primary hover:text-amber-400 font-medium hover:underline px-2 py-1 -mr-2 -my-1">View All</button>
```

### 10. Top Delegates - Avatar Size

**Location:** `Dashboard.tsx` Line 186  
**Issue:** `size-12` (48px) avatar is fine, but ensure spacing is adequate  
**Impact:** May be cramped on mobile  
**Fix:**

```tsx
// Change from:
<Avatar className="size-12 border-2 border-emerald-700 group-hover:border-primary transition-colors">
// To:
<Avatar className="size-10 sm:size-12 border-2 border-emerald-700 group-hover:border-primary transition-colors shrink-0">
```

## Pulsas Page Issues

### 11. Summary Cards - Text Sizes

**Location:** `Pulsas.tsx` Line 52, 61, 70  
**Issue:** `text-3xl` may be too large for mobile  
**Impact:** May cause layout issues  
**Fix:**

```tsx
// Change from:
<p className="text-white text-3xl font-black">{data?.summary.totalVotes.toLocaleString() || 0}</p>
// To:
<p className="text-white text-2xl sm:text-3xl font-black">{data?.summary.totalVotes.toLocaleString() || 0}</p>
```

### 12. Charts - Fixed Height

**Location:** `Pulsas.tsx` Line 79-83  
**Issue:** `h-[400px]` is too tall for mobile screens  
**Impact:** Charts will take up too much vertical space  
**Fix:**

```tsx
// Change from:
<Suspense fallback={<Skeleton className="h-[400px] w-full rounded-lg" />}>
// To:
<Suspense fallback={<Skeleton className="h-[250px] sm:h-[300px] md:h-[400px] w-full rounded-lg" />}>
// And update chart components to use responsive heights
```

### 13. Charts Grid - Gap

**Location:** `Pulsas.tsx` Line 78  
**Issue:** `gap-4 md:gap-6` is good, but ensure it's not too large on mobile  
**Impact:** May waste vertical space  
**Status:** ✅ Already responsive, but verify `gap-4` (16px) is appropriate

## ActivityFeed Component Issues

### 14. Header - Button Touch Target

**Location:** `ActivityFeed.tsx` Line 126-135  
**Issue:** Button may be too small for comfortable touch  
**Impact:** Difficult to tap on mobile  
**Fix:**

```tsx
// Change from:
<button className="inline-flex items-center gap-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 text-sm font-medium ...">
// To:
<button className="inline-flex items-center gap-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2.5 sm:py-2 text-sm font-medium min-h-[44px] ...">
```

### 15. Load More Button

**Location:** `ActivityFeed.tsx` Line 157-170  
**Issue:** Same touch target concern  
**Fix:**

```tsx
// Change from:
<button className="inline-flex items-center gap-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 text-sm font-medium ...">
// To:
<button className="inline-flex items-center gap-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2.5 sm:py-2 text-sm font-medium min-h-[44px] ...">
```

## DashboardLayout Issues

### 16. Header Padding

**Location:** `DashboardLayout.tsx` Line 142  
**Issue:** `px-6` may be too much on mobile (24px each side = 48px total)  
**Impact:** Reduces available width for search bar  
**Fix:**

```tsx
// Change from:
<header className="flex items-center justify-between border-b border-surface-border bg-surface-dark px-6 py-3 flex-shrink-0 z-10">
// To:
<header className="flex items-center justify-between border-b border-surface-border bg-surface-dark px-3 sm:px-4 md:px-6 py-3 flex-shrink-0 z-10">
```

### 17. Search Bar Max Width

**Location:** `DashboardLayout.tsx` Line 154  
**Issue:** `max-w-[400px]` may be too restrictive on mobile  
**Impact:** Search bar may be too narrow  
**Fix:**

```tsx
// Change from:
<div className="flex flex-col flex-1 max-w-[400px] relative group">
// To:
<div className="flex flex-col flex-1 max-w-full sm:max-w-[400px] relative group">
```

### 18. Content Padding

**Location:** `DashboardLayout.tsx` Line 208  
**Issue:** `p-4 md:p-6 lg:p-8` is good, but verify `p-4` (16px) is adequate  
**Impact:** May be too tight on very small screens  
**Status:** ✅ Already responsive, but consider `p-3 sm:p-4` for extra small screens

## Immediate Fix Checklist

### Critical (Fix First)

- [ ] **Fix 1:** Reduce ring chart size on mobile (`size-48 sm:size-56 md:size-64`)
- [ ] **Fix 2:** Reduce background decoration size (`w-32 sm:w-48 md:w-64`)
- [ ] **Fix 3:** Reduce stats grid gap and text sizes (`gap-2 sm:gap-3`, responsive text)
- [ ] **Fix 4:** Make bill items stack on mobile (`flex-col sm:flex-row`, add `truncate`)
- [ ] **Fix 5:** Reduce stat card text sizes (`text-xl sm:text-2xl`)
- [ ] **Fix 6:** Shorten button text on mobile (`hidden sm:inline` pattern)

### Medium Priority

- [ ] **Fix 7:** Reduce hero tile padding (`p-4 sm:p-5 md:p-6`)
- [ ] **Fix 8:** Reduce icon sizes (`w-4 h-4 sm:w-5 sm:h-5`)
- [ ] **Fix 9:** Increase "View All" button touch target
- [ ] **Fix 10:** Reduce avatar size slightly on mobile (`size-10 sm:size-12`)
- [ ] **Fix 11:** Reduce Pulsas summary text sizes (`text-2xl sm:text-3xl`)
- [ ] **Fix 12:** Reduce chart heights on mobile (`h-[250px] sm:h-[300px] md:h-[400px]`)

### Touch Targets

- [ ] **Fix 14:** Ensure ActivityFeed buttons have `min-h-[44px]`
- [ ] **Fix 15:** Ensure Load More button has `min-h-[44px]`
- [ ] **Fix 9:** Increase "View All" button touch target

### Layout

- [ ] **Fix 16:** Reduce header padding on mobile (`px-3 sm:px-4 md:px-6`)
- [ ] **Fix 17:** Remove search bar max-width on mobile (`max-w-full sm:max-w-[400px]`)

## Testing Checklist

After implementing fixes, test on:

- [ ] iPhone SE (375px width) - Safari
- [ ] iPhone 12/13 (390px width) - Safari
- [ ] Android phone (360px width) - Chrome
- [ ] Verify no horizontal scrolling
- [ ] Verify all text is readable
- [ ] Verify all buttons are tappable (44x44px minimum)
- [ ] Verify charts are visible and not cut off
- [ ] Verify bill items don't overflow
- [ ] Verify stats grid is readable

## Summary

**Total Issues Found:** 18  
**Critical Issues:** 6  
**Medium Priority:** 12  
**Estimated Fix Time:** 2-3 hours

The Dashboard page needs responsive adjustments for mobile screens. The main concerns are fixed-size elements (ring chart, decorations) and text sizes that don't scale down. Most fixes involve adding responsive Tailwind classes (`sm:`, `md:`) to scale elements appropriately for different screen sizes.

---

**Next Steps:**

1. Implement critical fixes first
2. Test on real devices (375px, 390px)
3. Implement medium priority fixes
4. Final testing and refinement
