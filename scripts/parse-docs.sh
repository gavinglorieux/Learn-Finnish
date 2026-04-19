#!/usr/bin/env bash
# Stage 1 parser: extract text from DOCX/ODT/PDF into ./parsed/ mirroring
# the ./raw/ structure. Deterministic, offline, no AI.
#
#   .docx / .odt → pandoc → <file>.md
#   .pdf         → pdftotext -layout → <file>.txt
#
# Re-runs skip any output whose mtime is newer than the source.
# Image files (.jpg, .jpeg, .png) are handled by Stage 2 (Claude vision)
# and are ignored here.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
RAW_DIR="$ROOT_DIR/raw"
PARSED_DIR="$ROOT_DIR/parsed"

for cmd in pandoc pdftotext; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "error: $cmd not found. Install with: brew install pandoc poppler" >&2
    exit 1
  fi
done

if [[ ! -d "$RAW_DIR" ]]; then
  echo "error: $RAW_DIR does not exist. Run sync-from-drive.sh first." >&2
  exit 1
fi

mkdir -p "$PARSED_DIR"

converted=0
skipped=0
failed=0

# portable mtime (macOS stat)
mtime() { stat -f %m "$1" 2>/dev/null || echo 0; }

process_file() {
  local src="$1"
  local rel="${src#$RAW_DIR/}"
  local ext="${src##*.}"
  ext=$(printf '%s' "$ext" | tr '[:upper:]' '[:lower:]')

  local out_ext
  local tool
  case "$ext" in
    docx|odt) out_ext="md";  tool="pandoc"    ;;
    pdf)      out_ext="txt"; tool="pdftotext" ;;
    jpg|jpeg|png|gif|webp|heic) return 0  ;; # Stage 2
    *)        return 0                     ;; # unknown — skip silently
  esac

  local out="$PARSED_DIR/${rel}.${out_ext}"
  mkdir -p "$(dirname "$out")"

  if [[ -f "$out" ]] && (( $(mtime "$out") > $(mtime "$src") )); then
    skipped=$((skipped + 1))
    return 0
  fi

  echo "→ $rel"
  case "$tool" in
    pandoc)
      if pandoc --from="$ext" --to=gfm --wrap=none "$src" -o "$out" 2>/tmp/parse-err.$$; then
        converted=$((converted + 1))
      else
        echo "  ERROR: pandoc failed — $(cat /tmp/parse-err.$$)" >&2
        failed=$((failed + 1))
      fi
      rm -f /tmp/parse-err.$$
      ;;
    pdftotext)
      if pdftotext -layout -enc UTF-8 "$src" "$out" 2>/tmp/parse-err.$$; then
        converted=$((converted + 1))
      else
        echo "  ERROR: pdftotext failed — $(cat /tmp/parse-err.$$)" >&2
        failed=$((failed + 1))
      fi
      rm -f /tmp/parse-err.$$
      ;;
  esac
}

# NUL-delimited to survive spaces/parentheses in lesson folder names
while IFS= read -r -d '' f; do
  process_file "$f"
done < <(find "$RAW_DIR" -type f -print0)

echo
echo "converted: $converted"
echo "skipped (up to date): $skipped"
echo "failed: $failed"
echo "output: $PARSED_DIR"
