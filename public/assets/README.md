Place optimized short demo clips here for the exercises. Recommended format: WebM (vp9) or MP4 (h264), short 3-8s clips, < 500KB when possible.

Recommended workflow:

1. Download short clips from Pexels (free) or Pexels Collections. Prefer WebM for smaller size.
2. Name files exactly as below so the app picks them up automatically:
   - public/assets/pushup.webm
   - public/assets/pushup-poster.jpg (optional)
   - public/assets/squat.webm
   - public/assets/squat-poster.jpg (optional)
   - public/assets/plank.webm
   - public/assets/plank-poster.jpg (optional)

3. To download automatically, edit `scripts/download-sample-media.sh` and set the direct download URLs then run:

```bash
bash scripts/download-sample-media.sh
```

4. Commit the assets if you want them versioned, or keep them out of git and host on a CDN.

Notes:
- Using local assets improves offline PWA behavior.
- If you prefer CDN hosting (Cloudflare Images), upload the clips to Cloudflare and replace the `src` paths in `src/data.ts`.
