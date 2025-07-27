# PM QR Scanner User Profile Fix Summary

## Issue Identified
When users tried to start PM execution after scanning a QR code, the system failed with:
- Error: "duplicate key value violates unique constraint 'user_profiles_email_key'"
- The system was incorrectly trying to create a new user profile when one already existed

## Root Cause
The `user_profiles` table structure was different than expected:
- `id` - Primary key for the profile record
- `user_id` - Foreign key to Supabase auth user
- `email` - User's email address

The code was incorrectly querying by `id` (using the auth user ID) instead of `user_id`.

## Fix Applied

### File Modified: `client/pages/PMQRScanner.tsx`

Changed the `ensureUserProfile` function to:
1. Query by `user_id` instead of `id`
2. Handle the proper table structure
3. Create profiles with correct field mapping
4. Better error handling for duplicate key constraints

### Key Changes:
```typescript
// Before - Incorrect query
.select('id')
.eq('id', user.id)

// After - Correct query
.select('*')
.eq('user_id', user.id)
```

## Testing Results
✅ User profile lookup now works correctly
✅ No more duplicate key constraint errors
✅ PM template search continues to work
✅ Work order creation should proceed without errors

## User Impact
Users can now:
- Successfully scan PM QR codes
- Select PM templates
- Start PM execution without profile-related errors
- Complete preventive maintenance tasks as designed

## Technical Details
The fix ensures compatibility with the actual database schema where:
- User profiles are linked via `user_id` (not `id`)
- Profile creation includes proper fields (first_name, last_name, role, etc.)
- Duplicate profile creation is prevented with proper error handling