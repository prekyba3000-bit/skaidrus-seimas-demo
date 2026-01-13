# 📱 Mobile Audit: MP Profile Page

**Date:** 2026-01-12  
**Target Viewport:** 375px (iPhone SE) and 390px (iPhone 12/13)  
**File Analyzed:** `client/src/pages/MPProfile.tsx`  
**Status:** 🟡 **20 Issues Identified** (10 Critical, 10 Medium Priority)

---

## Executive Summary

### ✅ Good News

- **No HTML `<table>` elements found** - The voting history uses a timeline layout (card-based), which is mobile-friendly
- **Header already stacks vertically** on mobile (`flex-col md:flex-row`)
- **Timeline layout is responsive** with proper flex stacking

### ⚠️ Critical Issues

1. **Stats row will overflow** on 375px screens (3 stats with `gap-4` = ~120px gap + content)
2. **Fixed-width SVG decoration** (800px) will cause horizontal scroll
3. **Large avatar** (128px) takes too much space on mobile
4. **Top banner buttons** may overflow horizontally
5. **Vote card titles** need truncation to prevent overflow
6. **Stats cards** have oversized numbers (`text-4xl`) that may wrap awkwardly
7. **Header padding** (`p-8`) is excessive on mobile
8. **Name text size** (`text-3xl`) may be too large for small screens
9. **Action buttons** (Susisiekti, Atsisiųsti CV) may not fit on one line
10. **Timeline node positioning** may overlap content on very small screens

---

## 1. Table vs. Card Decision ✅ **NO ACTION NEEDED**

### Analysis

- **No HTML `<table>` elements** found in the MP Profile page
- Voting history uses a **timeline/card layout** (lines 314-368)
- Layout is already mobile-friendly with `flex-col sm:flex-row` stacking

### Recommendation

✅ **Keep the current timeline layout** - It's already optimized for mobile. No refactoring needed.

### Current Implementation

```tsx
// Lines 314-368: Timeline layout (mobile-friendly)
<div className="space-y-12 relative z-10">
  {votesData.map((item, idx) => (
    <div className="relative pl-8 md:pl-12 group">
      {/* Timeline Node */}
      <div className="absolute left-0 ...">{/* Icon/Badge */}</div>
      {/* Vote Card */}
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 justify-between">
        {/* Title and vote label */}
      </div>
    </div>
  ))}
</div>
```

**Verdict:** ✅ Timeline layout is better than tables for mobile. No changes needed.

---

## 2. Header Audit 🔴 **NEEDS FIXES**

### 2.1 MP Header (Photo, Name, Party) ✅ **MOSTLY GOOD**

**Current Implementation (Line 204):**

```tsx
<div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
```

**Status:** ✅ Already stacks vertically on mobile (`flex-col md:flex-row`)

**Issues Found:**

- ⚠️ **Issue #1:** Avatar size is fixed `size-32` (128px) - too large for mobile
- ⚠️ **Issue #2:** Name text is `text-3xl md:text-4xl` - may be too large on 375px
- ⚠️ **Issue #3:** Header padding `p-8 md:p-10` is excessive on mobile
- ⚠️ **Issue #4:** Gap `gap-8` is too large on mobile (32px)

**Recommended Fixes:**

```tsx
// Line 187: Reduce padding on mobile
<div className="relative glass-panel rounded-2xl overflow-hidden p-4 sm:p-6 md:p-8 lg:p-10 group mb-6">

// Line 204: Reduce gap on mobile
<div className="relative z-10 flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 items-center md:items-start">

// Line 207: Make avatar responsive
<div className="size-24 sm:size-28 md:size-32 rounded-2xl overflow-hidden border border-primary/40 ...">

// Line 229: Reduce name size on mobile
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">{mp.name}</h1>
```

### 2.2 Stats Row (Attendance, Votes, Accountability) 🔴 **CRITICAL**

**Current Implementation (Line 253):**

```tsx
<div className="flex gap-4 md:gap-8 border-t md:border-t-0 md:border-l border-[#1f3a33] pt-6 md:pt-0 md:pl-8 mt-2 md:mt-0 justify-center md:justify-start w-full md:w-auto">
  <div className="text-center md:text-left">
    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
      Lankomumas
    </p>
    <p className="text-2xl font-bold text-primary">...</p>
  </div>
  {/* 2 more stats */}
</div>
```

**Critical Issues:**

- 🔴 **Issue #5:** Three stats with `gap-4` (16px) + content = **~300px+ total width** on 375px screen
- 🔴 **Issue #6:** Stats numbers are `text-2xl` (24px) - may wrap or overflow
- 🔴 **Issue #7:** Stats labels are `text-xs` but uppercase with `tracking-widest` - may overflow
- 🔴 **Issue #8:** Border-top on mobile adds extra space (`pt-6`)

**Recommended Fixes:**

```tsx
// Line 253: Stack stats vertically on mobile, reduce gap
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-8 border-t md:border-t-0 md:border-l border-[#1f3a33] pt-4 sm:pt-6 md:pt-0 md:pl-8 mt-2 md:mt-0 justify-center md:justify-start w-full md:w-auto">

// Line 256: Reduce number size on mobile
<p className="text-xl sm:text-2xl font-bold text-primary">
  {stats?.votingAttendance ? parseFloat(stats.votingAttendance).toFixed(0) : 0}%
</p>

// Line 255: Reduce label tracking on mobile
<p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide sm:tracking-wider mb-1">Lankomumas</p>
```

---

## 3. Top Banner / Back Action 🔴 **NEEDS FIXES**

**Current Implementation (Line 161):**

```tsx
<div className="flex justify-between items-center mb-6">
  <Button variant="ghost" ...>
    <ArrowLeft className="w-4 h-4" />
    <span className="text-sm font-bold uppercase tracking-wider">Atgal į sąrašą</span>
  </Button>
  <div className="flex items-center gap-3">
    <Button variant="outline" ...>
      <ArrowLeftRight className="w-4 h-4 mr-2" />
      <span className="text-sm font-bold uppercase tracking-wider">Palyginti</span>
    </Button>
    <div className="bg-[#233648] border ...">
      <Info className="w-4 h-4 text-primary" />
      <span className="text-[#92adc9] text-xs font-medium uppercase tracking-widest">ID: {mp.seimasId}</span>
    </div>
  </div>
</div>
```

**Critical Issues:**

- 🔴 **Issue #9:** "Palyginti" button + ID badge may overflow on 375px
- 🔴 **Issue #10:** Button text uses `tracking-wider` which increases width
- 🔴 **Issue #11:** Gap `gap-3` (12px) between buttons may cause overflow

**Recommended Fixes:**

```tsx
// Line 161: Stack on mobile, reduce gap
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">

// Line 165: Hide text on mobile, show icon only
<Button
  variant="ghost"
  onClick={() => navigate("/")}
  className="text-[#92adc9] hover:text-white flex items-center gap-2 p-0 h-auto"
>
  <ArrowLeft className="w-4 h-4" />
  <span className="hidden sm:inline text-sm font-bold uppercase tracking-wider">Atgal į sąrašą</span>
</Button>

// Line 170: Stack buttons on mobile
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">

// Line 171: Make button text responsive
<Button ...>
  <ArrowLeftRight className="w-4 h-4 sm:mr-2" />
  <span className="hidden xs:inline sm:inline text-sm font-bold uppercase tracking-wider">Palyginti</span>
</Button>

// Line 179: Hide ID badge on very small screens
<div className="hidden sm:flex bg-[#233648] border border-surface-border rounded-lg px-3 py-1.5 items-center gap-2">
```

---

## 4. Background Decoration 🔴 **CRITICAL**

**Current Implementation (Line 189):**

```tsx
<svg className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] text-primary" ...>
```

**Critical Issues:**

- 🔴 **Issue #12:** Fixed width `w-[800px]` will cause horizontal scroll on 375px screens
- 🔴 **Issue #13:** SVG is positioned with `left-1/2 -translate-x-1/2` but width exceeds viewport

**Recommended Fixes:**

```tsx
// Line 189: Make SVG responsive
<svg className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] sm:h-[500px] md:h-[600px] text-primary" ...>
```

---

## 5. Action Buttons (Susisiekti, Atsisiųsti CV) 🟡 **MEDIUM PRIORITY**

**Current Implementation (Line 233):**

```tsx
<div className="flex flex-wrap gap-3 justify-center md:justify-start w-full">
  <Button className="flex items-center gap-2 bg-primary ...">
    <Mail className="w-5 h-5" />
    Susisiekti
  </Button>
  <Button variant="outline" ...>
    <Download className="w-5 h-5" />
    Atsisiųsti CV
  </Button>
</div>
```

**Issues:**

- 🟡 **Issue #14:** Buttons may wrap on 375px if text is long
- 🟡 **Issue #15:** Button padding `py-2.5 px-5` may be too large for mobile
- 🟡 **Issue #16:** Icon size `w-5 h-5` is good, but text may overflow

**Recommended Fixes:**

```tsx
// Line 233: Ensure buttons stack on mobile
<div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 justify-center md:justify-start w-full">

// Line 234: Reduce padding on mobile
<Button
  className="flex items-center gap-2 bg-primary hover:bg-amber-400 text-[#021C15] font-bold py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl ..."
  ...
>
  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
  <span className="text-sm sm:text-base">Susisiekti</span>
</Button>
```

---

## 6. Voting History Timeline 🟡 **MEDIUM PRIORITY**

**Current Implementation (Line 286):**

```tsx
<div className="relative flex-1 pl-4 md:pl-12 pr-2">
  {/* Timeline Items */}
  <div className="space-y-12 relative z-10">
    {votesData.map((item, idx) => (
      <div className="relative pl-8 md:pl-12 group">
        {/* Vote Card */}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-lg ...">
              {item.bill?.title || "Balsavimas dėl teisės akto"}
            </h4>
            ...
          </div>
          {relativeTime && (
            <span className="text-xs font-medium text-primary ... whitespace-nowrap shrink-0">
              {relativeTime}
            </span>
          )}
        </div>
      </div>
    ))}
  </div>
</div>
```

**Issues:**

- 🟡 **Issue #17:** Title `text-lg` may be too large on mobile
- 🟡 **Issue #18:** Title needs truncation (`line-clamp-2` or `truncate`)
- 🟡 **Issue #19:** Timeline node `pl-8 md:pl-12` may cause content to be too close to edge
- 🟡 **Issue #20:** Spacing `space-y-12` (48px) may be too large on mobile

**Recommended Fixes:**

```tsx
// Line 314: Reduce spacing on mobile
<div className="space-y-6 sm:space-y-8 md:space-y-12 relative z-10">

// Line 324: Adjust padding on mobile
<div className="relative pl-6 sm:pl-8 md:pl-12 group">

// Line 344: Ensure proper stacking
<div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">

// Line 346: Add truncation and reduce size
<h4 className="text-white font-semibold text-base sm:text-lg group-hover:text-primary transition-colors cursor-pointer leading-tight line-clamp-2 sm:line-clamp-none">
  {item.bill?.title || "Balsavimas dėl teisės akto"}
</h4>
```

---

## 7. Stats Cards (Right Sidebar) 🟡 **MEDIUM PRIORITY**

**Current Implementation (Line 383):**

```tsx
<span className="text-4xl font-black text-white">
  {stats?.billsProposed || 0}
</span>
```

**Issues:**

- 🟡 **Issue #21:** `text-4xl` (36px) is very large for mobile
- 🟡 **Issue #22:** Cards use `p-6` which may be too much padding on mobile

**Recommended Fixes:**

```tsx
// Line 376: Reduce padding on mobile
<div className="glass-panel p-4 sm:p-5 md:p-6 rounded-xl flex flex-col gap-4">

// Line 383: Make numbers responsive
<span className="text-2xl sm:text-3xl md:text-4xl font-black text-white">{stats?.billsProposed || 0}</span>
```

---

## 8. Summary of Critical Fixes

### Priority 1: Critical (Must Fix)

1. ✅ **Stats Row Overflow** - Stack vertically on mobile, reduce gap and font sizes
2. ✅ **SVG Decoration Overflow** - Make width responsive (`w-full max-w-[800px]`)
3. ✅ **Top Banner Buttons** - Stack on mobile, hide text labels on small screens
4. ✅ **Header Padding** - Reduce from `p-8` to `p-4 sm:p-6 md:p-8`
5. ✅ **Avatar Size** - Reduce from `size-32` to `size-24 sm:size-28 md:size-32`

### Priority 2: Medium (Should Fix)

6. ✅ **Name Text Size** - Reduce from `text-3xl` to `text-2xl sm:text-3xl md:text-4xl`
7. ✅ **Action Buttons** - Stack vertically on mobile, reduce padding
8. ✅ **Vote Card Titles** - Add truncation (`line-clamp-2`), reduce size
9. ✅ **Stats Card Numbers** - Reduce from `text-4xl` to `text-2xl sm:text-3xl md:text-4xl`
10. ✅ **Timeline Spacing** - Reduce from `space-y-12` to `space-y-6 sm:space-y-8 md:space-y-12`

---

## 9. Recommended Implementation Strategy

### Option A: Keep Timeline Layout (Recommended) ✅

- **Pros:** Already mobile-friendly, no major refactoring needed
- **Cons:** Minor adjustments needed for spacing and sizing
- **Effort:** 2-3 hours
- **Recommendation:** ✅ **Use this approach**

### Option B: Card View for Mobile (Not Needed)

- **Pros:** Could be more compact
- **Cons:** Timeline is already better UX, unnecessary refactoring
- **Effort:** 4-6 hours
- **Recommendation:** ❌ **Not recommended** - Timeline is already optimal

---

## 10. Quick Reference: Tailwind Classes to Apply

```tsx
// Header Container
className = "p-4 sm:p-6 md:p-8 lg:p-10";

// Header Flex
className = "flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8";

// Avatar
className = "size-24 sm:size-28 md:size-32";

// Name
className = "text-2xl sm:text-3xl md:text-4xl";

// Stats Row
className = "flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-8";

// Stats Numbers
className = "text-xl sm:text-2xl";

// Top Banner
className = "flex flex-col sm:flex-row gap-3 sm:gap-4";

// Buttons
className = "py-2 sm:py-2.5 px-4 sm:px-5";

// SVG Decoration
className = "w-full max-w-[800px] h-[400px] sm:h-[500px] md:h-[600px]";

// Vote Card Title
className = "text-base sm:text-lg line-clamp-2 sm:line-clamp-none";

// Timeline Spacing
className = "space-y-6 sm:space-y-8 md:space-y-12";
```

---

## 11. Verification Checklist

After implementing fixes, verify:

- [ ] No horizontal scrollbar on 375px viewport
- [ ] Stats row doesn't overflow (stacks vertically on mobile)
- [ ] Top banner buttons don't overflow
- [ ] Avatar and name fit comfortably on mobile
- [ ] Vote card titles truncate properly
- [ ] All text is readable without zooming
- [ ] Touch targets are at least 44px (iOS guideline)
- [ ] Timeline is scrollable and doesn't cause overflow
- [ ] Stats cards fit on screen without wrapping awkwardly
- [ ] Background decoration doesn't cause horizontal scroll

---

## 12. Next Steps

1. **Implement Critical Fixes (Priority 1)** - 2-3 hours
2. **Implement Medium Priority Fixes (Priority 2)** - 1-2 hours
3. **Test on Real Devices** - 375px, 390px, 414px
4. **Verify No Horizontal Scroll** - Check all breakpoints
5. **Final Polish** - Adjust spacing and sizing as needed

---

**Report Generated:** 2026-01-12  
**Status:** 🟡 **Ready for Implementation**  
**Estimated Effort:** 3-5 hours for all fixes
