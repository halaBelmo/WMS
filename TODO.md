# Stock Management - Hierarchical Location Selection + Admin Access Fix

## Problem Analysis

1. **Access Denied for ADMIN on /stocks route**: `App.jsx` only allowed `["ADMIN"]` for `/stocks`, but not `"OWNER"`. Also `StockForm.jsx` called `/api/owner/products` which was restricted to `OWNER` only.

2. **User wants hierarchical location selection**: Like `LocationManagementPage`, the user wants Zone → Rack → Shelf → Location hierarchy for selecting the location when creating stock.

## Implementation Plan

### ✅ Step 1: Fix Frontend Route Access (`App.jsx`)
- Added `"OWNER"` to `allowedRoles` for `/stocks` route (now `["OWNER", "ADMIN"]`)

### ✅ Step 2: Fix Backend Product Access (`ProductController.java`)
- Changed GET endpoints from `hasAuthority('OWNER')` to `hasAnyAuthority('OWNER', 'ADMIN', 'MAGASINIER')`
- CREATE/UPDATE/DELETE remain OWNER-only

### ✅ Step 3: Modify `StockManagementPage.jsx`
- Added Zone → Rack → Shelf → Location hierarchy (like `LocationManagementPage`)
- Added state management for zones, racks, shelves, locations
- Cascading loads: zones on mount → racks by zone → shelves by rack → locations by shelf
- Pass `selectedLocation` to `StockForm`
- Stock table filtered by selected location
- Show info message when no location selected

### ✅ Step 4: Modify `StockForm.jsx`
- Removed location dropdown (now selected via hierarchy in parent)
- Accept `locationId` and `locationName` as props
- Display selected location in a green banner
- Product dropdown loads from `/api/owner/products` (now accessible to ADMIN)
- Submit uses the passed `locationId`

### ✅ Step 5: Update CSS
- `StockManagementPage.module.css`: Added hierarchy section, select row, field styles
- `StockForm.module.css`: Added location display styles

## Files Modified

1. `frontend/src/App.jsx`
2. `backend/src/main/java/com/example/wms/controllers/ProductController.java`
3. `frontend/src/pages/StockManagementPage.jsx`
4. `frontend/src/components/StockForm.jsx`
5. `frontend/src/pages/StockManagementPage.module.css`
6. `frontend/src/components/StockForm.module.css`

## Next Steps / Testing

1. Restart backend Spring Boot application
2. Test as ADMIN user:
   - Navigate to /stocks (should work now)
   - Select Zone → Rack → Shelf → Location
   - Product dropdown should load without 403
   - Create stock should work
3. Test as OWNER user:
   - Should also be able to access /stocks

