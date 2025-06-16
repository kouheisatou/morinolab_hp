#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status, and treat unset variables as an error.
set -euo pipefail

# Root directories
CONTENT_ROOT="contents/articles"
OUTPUT_ROOT="public/generated_contents"

# Content categories to process
CONTENT_TYPES=("theme" "news" "member" "publication" "lecture")

# Iterate over each content category
for TYPE in "${CONTENT_TYPES[@]}"; do
  DOC_DIR="${CONTENT_ROOT}/${TYPE}"

  # Skip this type if its directory does not exist
  if [[ ! -d "${DOC_DIR}" ]]; then
    echo "[WARN] Directory not found: ${DOC_DIR}. Skipping."
    continue
  fi

  echo "[INFO] Processing category: ${TYPE}"

  shopt -s nullglob
  for DOCX_FILE in "${DOC_DIR}"/*.docx; do
    FILENAME="$(basename "${DOCX_FILE}")"
    ID="${FILENAME%.docx}"

    OUTPUT_DIR="${OUTPUT_ROOT}/${TYPE}/${ID}"
    mkdir -p "${OUTPUT_DIR}"

    echo "  • Converting ${DOCX_FILE} -> ${OUTPUT_DIR}/article.html"

    CURRENT_DIR="$(pwd)"
    cp "${DOCX_FILE}" "${OUTPUT_DIR}"
    cd "${OUTPUT_DIR}"
    pandoc "${FILENAME}" \
           --from docx \
           --to html \
           --standalone \
           --extract-media="." \
           --output "article.html"
    rm "${FILENAME}"
    cd "${CURRENT_DIR}"
  done
  shopt -u nullglob

done

echo "[DONE] Conversion complete." 
