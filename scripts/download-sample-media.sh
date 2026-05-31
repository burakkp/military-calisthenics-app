#!/usr/bin/env bash
# Script to help download sample exercise clips into public/assets/
# Replace the SAMPLE_URLs below with direct file URLs from Pexels or another free provider.

set -euo pipefail
mkdir -p public/assets

# Example placeholders - replace these with real direct-download URLs
# PUSHUP_URL="https://www.pexels.com/path/to/pushup.webm"
# SQUAT_URL="https://www.pexels.com/path/to/squat.webm"
# PLANK_URL="https://www.pexels.com/path/to/plank.webm"

if [ -z "${PUSHUP_URL:-}" ]; then
  echo "Please edit this script and set PUSHUP_URL, SQUAT_URL, PLANK_URL to real file URLs."
  exit 1
fi

curl -L "$PUSHUP_URL" -o public/assets/pushup.webm
curl -L "$SQUAT_URL" -o public/assets/squat.webm
curl -L "$PLANK_URL" -o public/assets/plank.webm

# Optionally add poster images
# curl -L "$PUSHUP_POSTER_URL" -o public/assets/pushup-poster.jpg

echo "Downloaded sample media to public/assets/"
