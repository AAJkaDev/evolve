# Troubleshooting

This document contains fixes for common errors in the Evolve application.

## Fixed Issues

### 1. ReferenceError: isSpace is not defined

**Error Message:**
```
ReferenceError: isSpace is not defined
    at skipOrderedListMarker (http://localhost:3000/_next/static/chunks/node_modules_markdown-it_...)
```

**Root Cause:**
This error occurs because the `markmap-lib` package uses an older or incompatible version of `markdown-it` that's missing the `isSpace` utility function.

**Fix Applied:**
- Added `markdown-it` as an explicit dependency in `package.json`
- Created `src/utils/markdown-utils.ts` with a patch for missing markdown-it utility functions
- Updated `MindMapRenderer.tsx` to import and apply the patch before using the Transformer

**Files Modified:**
- `package.json` - Added explicit markdown-it dependency
- `src/utils/markdown-utils.ts` - New utility file with markdown-it patches
- `src/components/ui/MindMapRenderer.tsx` - Added error handling and patch application

### 2. Research service temporarily unavailable

**Error Message:**
```
Error: Research service temporarily unavailable
    at researchFetcher (http://localhost:3000/_next/static/chunks/src_...)
```

**Root Cause:**
The research API is trying to connect to a Python microservice at `http://localhost:8000` which is not running.

**Fix Applied:**
- Improved error handling in `src/app/api/search-research/route.ts`
- Added better error messages explaining that the research feature requires a backend service
- The frontend now gracefully handles the unavailable service

**Files Modified:**
- `src/app/api/search-research/route.ts` - Improved error handling and messages

## Next Steps

### To fully resolve the research service error:

1. **Set up the Python microservice** (if you want research functionality):
   - Create a Python service running on port 8000
   - Implement `/research` and `/health` endpoints
   - Set the `PYTHON_WORKER_URL` environment variable if using a different URL

2. **Or disable research features** in the UI if not needed

### To install the fixed dependencies:

```bash
npm install
```

This will install the explicit `markdown-it` dependency that should resolve the isSpace error.

## Error Handling Improvements

The `MindMapRenderer` component now includes:
- Proper error boundary for markdown transformation errors
- User-friendly error messages
- Graceful fallback when mind map rendering fails

The research API now provides:
- Clear error messages explaining service unavailability
- Proper HTTP status codes for different error types
- Better logging for debugging

## Monitoring

To check if the fixes are working:

1. **Mind Map Errors**: Should no longer see "isSpace is not defined" errors
2. **Research Errors**: Should see clearer error messages about service availability
3. **Console**: Check browser console for any remaining errors
