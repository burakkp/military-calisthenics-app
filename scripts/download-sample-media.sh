#!/usr/bin/env bash
# Script to help download sample exercise clips into public/assets/
# Replace the SAMPLE_URLs below with direct file URLs from Pexels or another free provider.

set -euo pipefail
mkdir -p public/assets

# Curated Pexels download endpoints for sample exercise clips.
# These endpoints (pexels.com/download/video/<id>/) redirect to the actual video file.
# Pexels videos are free to use under the Pexels license — review https://www.pexels.com/license/.

# You can override any URL by exporting the variable before running the script.
# Example: PUSHUP_URL="https://..." bash scripts/download-sample-media.sh

# Default curated clips (short, free Pexels videos). If you prefer different clips,
# open https://www.pexels.com/search/videos/<term>/ and copy the "Download" link for a clip.
PUSHUP_URL="${PUSHUP_URL:-https://www.pexels.com/download/video/4804787/}"
SQUAT_URL="${SQUAT_URL:-https://www.pexels.com/download/video/4838220/}"
PLANK_URL="${PLANK_URL:-https://www.pexels.com/download/video/6023273/}"
BURPEE_URL="${BURPEE_URL:-https://www.pexels.com/download/video/4671964/}"
JUMPING_JACK_URL="${JUMPING_JACK_URL:-https://www.pexels.com/download/video/4764220/}"
MOUNTAIN_CLIMBER_URL="${MOUNTAIN_CLIMBER_URL:-https://www.pexels.com/download/video/6525467/}"

echo "Downloading sample exercise clips to public/assets/ (Pexels license applies)..."

curl -L "$PUSHUP_URL" -o public/assets/pushup.mp4
curl -L "$SQUAT_URL" -o public/assets/squat.mp4
curl -L "$PLANK_URL" -o public/assets/plank.mp4
curl -L "$BURPEE_URL" -o public/assets/burpee.mp4
curl -L "$JUMPING_JACK_URL" -o public/assets/jumping-jack.mp4
curl -L "$MOUNTAIN_CLIMBER_URL" -o public/assets/mountain-climber.mp4

echo "Downloaded sample media to public/assets/"
