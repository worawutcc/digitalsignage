# S3 CORS Configuration Guide for Digital Signage

**Date**: 2025-10-06  
**Branch**: 029-ui-device-groups

## Problem Summary

Browser-based uploads to S3 presigned URLs fail with:
1. **CORS Error**: Browser blocks preflight OPTIONS request
2. **403 Forbidden**: Invalid AWS region configuration

## Root Causes Identified

### 1. Invalid AWS Region ❌ **FIXED**
- **Before**: `"Region": "ap-southeast-7"` (doesn't exist)
- **After**: `"Region": "ap-southeast-1"` (Singapore)
- **Impact**: 403 Forbidden errors on all S3 operations

### 2. Missing S3 Bucket CORS Configuration
Browser uploads require CORS headers to allow:
- `PUT` method (for presigned uploads)
- `Content-Type` header
- Origin from frontend (http://localhost:3001)

## Solution Steps

### Step 1: Update AWS Region Configuration ✅ COMPLETED

Already fixed in `src/DigitalSignage.Api/appsettings.Development.json`:
```json
"AWS": {
  "S3": {
    "BucketName": "mf-stg-share",
    "Region": "ap-southeast-1",  // Changed from ap-southeast-7
    "CloudFrontUrl": "https://d2ieivtttn08zx.cloudfront.net"
  }
}
```

### Step 2: Configure S3 Bucket CORS

#### Option A: Using AWS Console (Recommended for Quick Setup)

1. Open [AWS S3 Console](https://s3.console.aws.amazon.com/s3/)
2. Navigate to bucket: `mf-stg-share`
3. Go to **Permissions** tab
4. Scroll to **Cross-origin resource sharing (CORS)** section
5. Click **Edit**
6. Paste the following CORS configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3001",
            "http://localhost:3000",
            "https://your-production-domain.com"
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

7. Click **Save changes**

#### Option B: Using AWS CLI

```bash
# Create CORS configuration file
cat > cors-config.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": [
        "http://localhost:3001",
        "http://localhost:3000",
        "https://your-production-domain.com"
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
}
EOF

# Apply CORS configuration to bucket
aws s3api put-bucket-cors \
  --bucket mf-stg-share \
  --cors-configuration file://cors-config.json \
  --region ap-southeast-1
```

### Step 3: Verify CORS Configuration

```bash
# Check current CORS configuration
aws s3api get-bucket-cors \
  --bucket mf-stg-share \
  --region ap-southeast-1
```

### Step 4: Restart Backend API

After updating the region configuration:

```bash
# Stop current API process (if running)
# Then restart:
cd /Users/worawutcc/workspace/worawutcc/digital-signage/digital_signage
dotnet watch run --project src/DigitalSignage.Api
```

### Step 5: Test Upload

1. Refresh frontend browser page (clear cache if needed)
2. Navigate to Media page
3. Upload a file
4. Check Network tab:
   - Presigned URL request should return 200/204
   - PUT to S3 URL should return 200 (not CORS error or 403)
   - Upload should complete successfully

## CloudFront Considerations (Optional)

If you're using CloudFront (`https://d2ieivtttn08zx.cloudfront.net`):

### Option 1: Direct S3 Upload (Current Approach)
- Presigned URLs target S3 directly (e.g., `https://mf-stg-share.s3.ap-southeast-1.amazonaws.com/...`)
- Downloads use CloudFront URL for better performance
- **Requires**: S3 bucket CORS configured (see above)

### Option 2: CloudFront for Uploads (Advanced)
- Route uploads through CloudFront distribution
- **Requires**:
  1. CloudFront behavior that forwards PUT requests to S3
  2. CloudFront origin with custom headers
  3. Edge function to handle CORS headers
- **Not recommended** unless you have specific CDN requirements

## Troubleshooting

### Still Getting CORS Errors?

1. **Check browser console** for exact error message:
   ```
   Access to fetch at 'https://...' from origin 'http://localhost:3001' 
   has been blocked by CORS policy
   ```

2. **Verify origin matches** CORS configuration:
   - Frontend runs on: `http://localhost:3001` (default Next.js port)
   - Must be listed in `AllowedOrigins`

3. **Clear browser cache** and hard reload (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

4. **Check Network tab** in DevTools:
   - Look for OPTIONS request (preflight)
   - Should return 200 with CORS headers
   - PUT request should follow with 200 status

### Still Getting 403 Forbidden?

1. **Check AWS credentials** are valid and have permissions:
   ```bash
   aws s3 ls s3://mf-stg-share/ --region ap-southeast-1
   ```

2. **Verify bucket permissions**:
   - IAM user/role has `s3:PutObject` permission
   - Bucket policy allows your account

3. **Check presigned URL expiry**:
   - Current setting: 1 hour (`"PresignedUrlExpiry": "01:00:00"`)
   - Make sure upload completes within this time

### Fallback to Server Upload

The frontend automatically falls back to server-side upload (`uploadLegacy`) if direct S3 upload fails. This is a temporary workaround while CORS is being configured.

To verify fallback is working:
1. Check browser console for: `"Presigned S3 upload failed, falling back to server upload"`
2. Upload should complete via `/api/media/upload` endpoint
3. File should appear in media library

## Production Checklist

Before deploying to production:

- [ ] Update CORS `AllowedOrigins` to include production domain
- [ ] Remove `http://localhost:*` origins from production S3 CORS
- [ ] Verify AWS credentials use environment variables (not hardcoded)
- [ ] Test upload from production domain
- [ ] Set appropriate `PresignedUrlExpiry` for production use case
- [ ] Enable S3 bucket versioning for file recovery
- [ ] Set up S3 lifecycle policies for storage optimization
- [ ] Configure CloudWatch alarms for S3 errors

## Related Files

- Backend configuration: `src/DigitalSignage.Api/appsettings.Development.json`
- S3 service: `src/DigitalSignage.Infrastructure/Services/S3FileUploadService.cs`
- Frontend upload: `src/digital-signage-web/src/services/api/mediaApi.ts`
- Upload modal: `src/digital-signage-web/src/app/media/components/UploadMediaModal.tsx`

## AWS Region Reference

Valid AWS regions for S3:
- `us-east-1` - US East (N. Virginia)
- `us-west-2` - US West (Oregon)
- `ap-southeast-1` - Asia Pacific (Singapore) ✅ **CONFIGURED**
- `ap-southeast-2` - Asia Pacific (Sydney)
- `ap-northeast-1` - Asia Pacific (Tokyo)
- `eu-west-1` - Europe (Ireland)
- [Full list](https://docs.aws.amazon.com/general/latest/gr/s3.html)

## Support

For additional help:
- AWS S3 CORS documentation: https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html
- CloudFront CORS: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/header-caching.html#header-caching-web-cors
