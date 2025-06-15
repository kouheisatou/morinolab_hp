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

  # Iterate over each .docx file inside the category directory
  shopt -s nullglob
  for DOCX_FILE in "${DOC_DIR}"/*.docx; do
    FILENAME="$(basename "${DOCX_FILE}")"
    ID="${FILENAME%.docx}"

    OUTPUT_DIR="${OUTPUT_ROOT}/${TYPE}/${ID}"
    mkdir -p "${OUTPUT_DIR}"

    echo "  • Converting ${DOCX_FILE} -> ${OUTPUT_DIR}/article.html"

    # Convert the .docx file to standalone HTML while extracting embedded media (images)
    # The resulting article.html can be loaded directly by the browser.
    pandoc "${DOCX_FILE}" \
           --from docx \
           --to html \
           --standalone \
           --output "${OUTPUT_DIR}/article.html"
  done
  shopt -u nullglob

done

echo "[DONE] Conversion complete." 
