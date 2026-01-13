# Phase 3.5: Connect Search Bar to API Filtering

## ✅ Completed Tasks

### Task 1: Create Debounce Hook ✓

- **File**: `client/src/hooks/useDebounce.ts`
- **Purpose**: Delays updating a value until user stops typing (500ms default)
- **Implementation**: Standard React hook using `useState` and `useEffect` with `setTimeout`

### Task 2: Update Backend Query ✓

- **File**: `server/routers/dashboard.ts`
- **Changes**:
  - Added `search: z.string().optional()` to input schema
  - Imported `ilike` and `and` from drizzle-orm
  - Updated query to filter by title using `ilike(bills.title, '%${search}%')`
  - Combined cursor and search filters using `and()`
  - Case-insensitive search using PostgreSQL's `ilike` operator

### Task 3: Update Dashboard Component ✓

- **File**: `client/src/pages/Dashboard.tsx`
- **Changes**:
  - Imported `useDebounce` hook
  - Created `debouncedSearch` with 500ms delay
  - Passed `search: debouncedSearch` to `useInfiniteQuery`
  - Query automatically resets when search changes (TanStack Query handles this)

## Implementation Details

### Debounce Hook

```typescript
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
```

### Backend Filtering Logic

```typescript
// Build conditions array
const conditions = [];

// Cursor filter (pagination)
if (cursor) {
  conditions.push(lt(bills.id, cursor));
}

// Search filter (case-insensitive)
if (search && search.length > 0) {
  conditions.push(ilike(bills.title, `%${search}%`));
}

// Apply all conditions
if (conditions.length > 0) {
  query = query.where(and(...conditions)) as any;
}
```

### Frontend Integration

```typescript
// Get search from store
const searchQuery = useUIStore(state => state.searchQuery);

// Debounce it (500ms delay)
const debouncedSearch = useDebounce(searchQuery, 500);

// Pass to query
trpc.dashboard.getRecentActivity.useInfiniteQuery({
  limit: 10,
  search:
    debouncedSearch && debouncedSearch.trim().length > 0
      ? debouncedSearch.trim()
      : undefined,
});
```

## How It Works

1. **User Types**: Search query updates in Zustand store immediately
2. **Debounce**: `useDebounce` waits 500ms after user stops typing
3. **API Call**: When debounced value changes, query refetches with search filter
4. **Server Filtering**: Backend filters bills by title using `ilike` (case-insensitive)
5. **Results Update**: UI updates with filtered results

## Benefits

✅ **Performance**: Debouncing prevents excessive API calls  
✅ **User Experience**: Smooth typing without lag  
✅ **Server-Side Filtering**: Efficient database-level filtering  
✅ **Case-Insensitive**: `ilike` makes search user-friendly  
✅ **Pagination Compatible**: Search works with cursor-based pagination

## Testing

### Test Case 1: Basic Search

1. Type "Dėl" in search bar
2. Wait 0.5 seconds
3. ✅ List updates with only bills containing "Dėl"
4. ✅ Results are case-insensitive

### Test Case 2: Empty Search

1. Type something, then clear it
2. Wait 0.5 seconds
3. ✅ List shows all bills (no filter)

### Test Case 3: Debouncing

1. Type "Dėl" quickly
2. ✅ No API call until 500ms after last keystroke
3. ✅ Only one API call is made

### Test Case 4: Pagination with Search

1. Search for "Dėl"
2. Click "Load More"
3. ✅ Next page of filtered results loads

## Files Created/Modified

1. **Created**: `client/src/hooks/useDebounce.ts` - Debounce hook
2. **Modified**: `server/routers/dashboard.ts` - Added search filtering
3. **Modified**: `client/src/pages/Dashboard.tsx` - Integrated debounced search

## Database Query Example

```sql
-- Generated SQL (simplified)
SELECT * FROM bills
WHERE id < $cursor
  AND title ILIKE '%Dėl%'
ORDER BY id DESC
LIMIT 11;
```

## Next Steps

Potential enhancements:

- Add search highlighting in results
- Add search history
- Add filters for category/status
- Add full-text search for better matching
- Add search suggestions/autocomplete
