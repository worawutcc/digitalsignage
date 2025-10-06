# Upload Error Diagnosis & Fix Summary

**Date**: 2025-10-06  
**Issue**: Media upload failing with CORS error and 403 Forbidden

## Problems Identified

### 1. Invalid AWS Region Configuration ❌
**Location**: `src/DigitalSignage.Api/appsettings.Development.json`

**Before**:
```json
"Region": "ap-southeast-7"  // ❌ This region doesn't exist!
```

**After**:
```json
"Region": "ap-southeast-1"  // ✅ Singapore region (valid)
```

**Impact**: All S3 operations were failing with 403 Forbidden because the AWS SDK couldn't connect to a non-existent region.

### 2. Missing S3 Bucket CORS Configuration
**Location**: AWS S3 bucket `mf-stg-share`

**Issue**: Browser uploads require CORS headers to allow:
- PUT requests from browser
- Content-Type header
- Localhost origins during development

**Status**: ⚠️ **Requires AWS Console/CLI access to fix**

## Changes Made

### Files Modified

1. **`src/DigitalSignage.Api/appsettings.Development.json`**
   - Changed AWS region from `ap-southeast-7` → `ap-southeast-1`

2. **`src/digital-signage-web/src/services/api/mediaApi.ts`**
   - Added detailed console logging for S3 upload attempts
   - Logs upload URL, file info, success/failure details
   - Helps diagnose CORS and permission issues

3. **`docs/S3-CORS-SETUP-GUIDE.md`** (NEW)
   - Complete guide for configuring S3 CORS
   - AWS Console and CLI instructions
   - Troubleshooting steps
   - Production checklist

## Next Steps (Required)

### Step 1: Restart Backend API ✅

```bash
# The API needs to restart to load the new region configuration
# In the 'dotnet' terminal:
cd /Users/worawutcc/workspace/worawutcc/digital-signage/digital_signage
dotnet watch run --project src/DigitalSignage.Api
```

### Step 2: Configure S3 Bucket CORS ⚠️ **REQUIRES YOUR ACTION**

You need AWS Console or CLI access to apply this:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": [
            "http://localhost:3001",
            "http://localhost:3000"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-server-side-encryption",
            "x-amz-request-id",
            "x-amz-id-2"
        ],
        "MaxAgeSeconds": 3600
    }
]
```

**How to apply**:
1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/s3/)
2. Open bucket: `mf-stg-share`
3. Permissions tab → CORS section → Edit
4. Paste the JSON above → Save

**OR via AWS CLI**:
```bash
aws s3api put-bucket-cors \
  --bucket mf-stg-share \
  --cors-configuration file://cors-config.json \
  --region ap-southeast-1
```

### Step 3: Test Upload

1. Restart backend (if not already done)
2. Refresh frontend browser page
3. Upload a file
4. Check browser console for detailed logs
5. Check Network tab:
   - Presigned URL request: should be 200/204
   - PUT to S3: should be 200 (not CORS error or 403)

## Current Behavior

### What Works Now ✅
- **Fallback to server upload**: If direct S3 upload fails, frontend automatically falls back to `/api/media/upload` endpoint (server-side upload)
- **Media creation**: Files still upload successfully via fallback
- **Error logging**: Detailed console logs help identify issues

### What Needs CORS Fix ⚠️
- **Direct S3 upload**: Browser still blocks preflight OPTIONS request
- **Performance**: Server-side fallback is slower than direct S3 upload
- **Bandwidth**: Files go through API server instead of directly to S3

## Verification

After applying CORS configuration and restarting backend:

1. **Check browser console**: Should see:
   ```
   [MediaApi] Uploading to S3: { url: "https://mf-stg-share.s3.ap-southeast-1...", ... }
   [MediaApi] S3 upload successful
   ```

2. **Check Network tab**: PUT request should show:
   - Status: 200 OK
   - No CORS errors
   - Response headers include CORS headers

3. **No fallback message**: Should NOT see:
   ```
   "Presigned S3 upload failed, falling back to server upload"
   ```

## Related Documentation

- Full setup guide: `docs/S3-CORS-SETUP-GUIDE.md`
- AWS CORS docs: https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html

## Summary

**Critical Fix Applied**: Invalid AWS region corrected (ap-southeast-7 → ap-southeast-1)
**Action Required**: Apply S3 bucket CORS configuration in AWS Console
**Current State**: Uploads work via server-side fallback; direct S3 upload pending CORS fix
