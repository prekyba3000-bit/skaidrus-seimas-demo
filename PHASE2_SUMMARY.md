# Phase 2: API Scalability - Cursor-Based Pagination

## ✅ Completed Tasks

### Task 1: Refactored `server/routers/dashboard.ts` ✓
- **Input Schema**: Updated to accept `limit` (1-100, default 10) and `cursor` (number | null)
- **Query Logic**:
  - Uses Drizzle's `.where(lt(bills.id, cursor))` when cursor exists
  - Orders by `id` descending (newest first)
  - Fetches `limit + 1` items to detect next page
  - Returns standard infinite query format: `{ items, nextCursor }`

### Task 2: Refactored `client/src/pages/Dashboard.tsx` ✓
- **Data Fetching**: Switched from `trpc.useQuery` to `trpc.useInfiniteQuery`
- **UI Changes**:
  - Renders all pages flattened into a single array
  - Added "Įkelti daugiau" (Load More) button
  - Button disabled when `hasNextPage` is false
  - Loading spinner shown while fetching next page
  - Button shows "Kraunama..." (Loading...) state

## Implementation Details

### Backend Changes

**File**: `server/routers/dashboard.ts`

```typescript
// Input schema
z.object({
  limit: z.number().min(1).max(100).default(10),
  cursor: z.number().nullish(),
})

// Query logic
- Fetches limit + 1 items
- Filters by cursor if provided: where(id < cursor)
- Orders by id DESC (newest first)
- Returns { items, nextCursor }
```

### Frontend Changes

**File**: `client/src/pages/Dashboard.tsx`

```typescript
// Infinite query setup
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = 
  trpc.dashboard.getRecentActivity.useInfiniteQuery(
    { limit: 10 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

// Flatten pages
const activities = data?.pages.flatMap((page) => page.items) ?? [];
```

## How It Works

1. **Initial Load**: Fetches first 10 items (no cursor)
2. **Load More**: When user clicks button, fetches next 10 items using the last item's ID as cursor
3. **Pagination**: Each page uses `id < cursor` to fetch only newer items
4. **Performance**: Only loads 10 items at a time instead of all records

## Benefits

✅ **Performance**: Only loads 10 items initially, preventing browser crashes  
✅ **Scalability**: Works efficiently even with thousands of records  
✅ **User Experience**: Fast initial load, progressive loading on demand  
✅ **Memory Efficient**: Doesn't load all data into memory at once  

## Testing Checklist

- [x] Dashboard loads fast (only 10 items initially)
- [x] "Load More" button appears when more items exist
- [x] Clicking "Load More" fetches next 10 items without page refresh
- [x] Button shows loading state while fetching
- [x] Button disappears when no more items (hasNextPage = false)
- [x] All items from previous pages remain visible

## Next Steps

This pagination pattern can be applied to other endpoints:
- `bills.list` - Paginate bills list
- `mps.list` - Paginate MPs list
- Any other large dataset endpoints

## Files Modified

1. `server/routers/dashboard.ts` - Added cursor-based pagination
2. `client/src/pages/Dashboard.tsx` - Switched to infinite query with Load More button
