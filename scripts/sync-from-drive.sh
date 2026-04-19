#!/usr/bin/env bash
# Sync Finnish course material from Google Drive into ./raw/.
#
# Prerequisites:
#   1. rclone installed (`brew install rclone`)
#   2. An rclone remote named `gdrive` configured for Google Drive.
#      Run `rclone config` once and follow the prompts:
#        - n) New remote
#        - name: gdrive
#        - storage: drive
#        - client_id / client_secret: leave blank (uses rclone's default)
#        - scope: 1 (full access) or 2 (read-only) — read-only is fine here
#        - service_account_file: leave blank
#        - Edit advanced config: n
#        - Use auto config: y (opens browser; pick the Google account that
#          has access to the course folders — the one at /u/1/ in the URLs)
#        - Configure as team drive: n
#
# Override the remote name by setting RCLONE_REMOTE, e.g.
#   RCLONE_REMOTE=mydrive ./scripts/sync-from-drive.sh
#
# Folders to sync are listed in ./scripts/drive-sources.conf.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
RAW_DIR="$ROOT_DIR/raw"
CONF_FILE="$SCRIPT_DIR/drive-sources.conf"
REMOTE="${RCLONE_REMOTE:-gdrive}"

if ! command -v rclone >/dev/null 2>&1; then
  echo "error: rclone not found on PATH. Install with: brew install rclone" >&2
  exit 1
fi

if ! rclone listremotes | grep -qx "${REMOTE}:"; then
  echo "error: rclone remote '${REMOTE}:' is not configured." >&2
  echo "Run 'rclone config' to create it (see comments in this script)." >&2
  exit 1
fi

if [[ ! -f "$CONF_FILE" ]]; then
  echo "error: config file not found at $CONF_FILE" >&2
  exit 1
fi

mkdir -p "$RAW_DIR"

echo "Syncing from rclone remote '${REMOTE}:' into $RAW_DIR"
echo

while IFS='=' read -r name id; do
  # Trim whitespace and skip comments / blanks
  name="${name#"${name%%[![:space:]]*}"}"
  name="${name%"${name##*[![:space:]]}"}"
  id="${id#"${id%%[![:space:]]*}"}"
  id="${id%"${id##*[![:space:]]}"}"

  [[ -z "$name" || "$name" == \#* ]] && continue
  [[ -z "$id" ]] && { echo "warn: skipping '$name' — empty folder id" >&2; continue; }

  dest="$RAW_DIR/$name"
  echo "→ $name  ($id)"
  mkdir -p "$dest"

  # --drive-root-folder-id scopes this sync to the given folder.
  # --fast-list reduces API calls on large trees.
  # --create-empty-src-dirs keeps folder structure even for empty subdirs.
  rclone sync "${REMOTE}:" "$dest" \
    --drive-root-folder-id="$id" \
    --fast-list \
    --create-empty-src-dirs \
    --drive-acknowledge-abuse \
    --stats-one-line \
    --stats=10s \
    --progress

  echo
done < "$CONF_FILE"

echo "Done. Synced into $RAW_DIR"
