#!/usr/bin/env python3
""" Validate generated content CSVs & related article files.

Checks performed per dataset:
  • ID uniqueness within each CSV.
  • Presence of required (non-blank) columns.
  • Existence of the corresponding article.html for content types that should have one.
  • Foreign-key style integrity between datasets (e.g. tagIds, authorMemberIds).

Usage:
    python scripts/validate_contents_db.py [--base-dir DIR]

If any validation error is detected, a human-readable report is printed and the
script exits with a non-zero status so it can be used in CI.
"""

from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path
from typing import Dict, List, Set, Tuple

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

GENERATED_ROOT = Path("public/generated_contents")

DatasetCfg = Dict[str, object]

DATASETS: Dict[str, DatasetCfg] = {
    "tags": {
        "csv": GENERATED_ROOT / "tags" / "tags.csv",
        "required": ["id", "name"],
        "has_article": False,
    },
    "member": {
        "csv": GENERATED_ROOT / "member" / "member.csv",
        "required": [
            "id",
            "name",
            "desc",
            "nameEnglish",
            "descEnglish",
            "admissionYear",
        ],
        "has_article": True,
        # Columns that reference other datasets in list-string format ("1,2")
        "fk_columns": {
            "tagIds": "tags",
        },
    },
    "company": {
        "csv": GENERATED_ROOT / "company" / "company.csv",
        "required": ["id", "nameJa", "nameEn", "year"],
        "has_article": False,
    },
    "theme": {
        "csv": GENERATED_ROOT / "theme" / "theme.csv",
        "required": ["id", "titleJa", "titleEn", "descJa", "descEn"],
        "has_article": True,
    },
    "lecture": {
        "csv": GENERATED_ROOT / "lecture" / "lecture.csv",
        "required": ["id", "titleJa", "titleEn", "descJa", "descEn"],
        "has_article": True,
    },
    "news": {
        "csv": GENERATED_ROOT / "news" / "news.csv",
        "required": ["id", "date", "textJa", "textEn"],
        "has_article": True,
    },
    "publication": {
        "csv": GENERATED_ROOT / "publication" / "publication.csv",
        "required": [
            "id",
            "fiscalYear",
            "type",
            "authorMemberIds",
        ],
        "has_article": True,
        "fk_columns": {
            "authorMemberIds": "member",
            "tagIds": "tags",
        },
    },
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_id_list(value: str | None) -> List[str]:
    if value is None or value.strip() == "":
        return []
    return [s.strip() for s in value.split(",") if s.strip()]


def read_csv(path: Path) -> List[dict[str, str]]:
    if not path.exists():
        raise FileNotFoundError(f"CSV not found: {path}")
    with path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        return list(reader)


def validate_dataset(name: str, cfg: DatasetCfg, fk_ids: Dict[str, Set[str]]) -> Tuple[Set[str], List[str]]:
    """Validate a single dataset.

    Returns a tuple (id_set, error_list)
    """

    errors: List[str] = []

    rows = read_csv(cfg["csv"])

    # ------------------------------------------------------
    # ID uniqueness / collection
    # ------------------------------------------------------
    ids_seen: Set[str] = set()
    for idx, row in enumerate(rows, start=2):  # header row = 1
        row_id = row.get("id", "").strip()
        if not row_id:
            errors.append(f"[{name}] Row {idx}: 'id' is blank")
            continue
        if row_id in ids_seen:
            errors.append(f"[{name}] Duplicate id '{row_id}' (row {idx})")
        ids_seen.add(row_id)

    # ------------------------------------------------------
    # Required non-blank fields
    # ------------------------------------------------------
    required = cfg.get("required", [])
    for idx, row in enumerate(rows, start=2):
        for field in required:
            value = row.get(field, "").strip()
            if value == "":
                errors.append(
                    f"[{name}] Row {idx}: required field '{field}' is blank"
                )

    # ------------------------------------------------------
    # Article existence
    # ------------------------------------------------------
    if cfg.get("has_article", False):
        for idx, row in enumerate(rows, start=2):
            row_id = row.get("id", "").strip()
            if not row_id:
                continue
            article_path = GENERATED_ROOT / name / row_id / "article.html"
            if not article_path.exists():
                errors.append(
                    f"[{name}] Row {idx}: article not found -> {article_path}"
                )

    # ------------------------------------------------------
    # Foreign-key checks
    # ------------------------------------------------------
    fk_columns = cfg.get("fk_columns", {})  # type: ignore[arg-type]
    if fk_columns:
        for idx, row in enumerate(rows, start=2):
            for col, ref_dataset in fk_columns.items():
                raw_val = row.get(col)
                if raw_val is None or raw_val.strip() == "":
                    continue  # optional column may be blank
                for ref_id in parse_id_list(raw_val):
                    if ref_id not in fk_ids.get(ref_dataset, set()):
                        errors.append(
                            f"[{name}] Row {idx}: value '{ref_id}' in column '{col}' does not correspond to an existing {ref_dataset}.id"
                        )

    return ids_seen, errors


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Validate generated contents CSVs and article HTML files.")
    parser.add_argument(
        "--base-dir",
        type=Path,
        default=Path.cwd(),
        help="Project root (defaults to current directory).",
    )
    args = parser.parse_args()

    # Allow running from any directory by resolving paths relative to --base-dir
    global GENERATED_ROOT
    GENERATED_ROOT = (args.base_dir / GENERATED_ROOT).resolve()

    # Rebuild absolute CSV paths now that GENERATED_ROOT is final
    for cfg in DATASETS.values():
        csv_path: Path = cfg["csv"]  # type: ignore[assignment]
        if not csv_path.is_absolute():
            cfg["csv"] = (args.base_dir / csv_path).resolve()  # type: ignore[index]

    all_errors: List[str] = []
    dataset_ids: Dict[str, Set[str]] = {}

    # First pass: gather IDs of each dataset (needed for FK checks)
    for name, cfg in DATASETS.items():
        try:
            rows = read_csv(cfg["csv"])
        except Exception as exc:
            all_errors.append(f"[{name}] {exc}")
            rows = []
        dataset_ids[name] = {row.get("id", "").strip() for row in rows if row.get("id")}

    # Second pass: full validation per dataset
    for name, cfg in DATASETS.items():
        try:
            _ids, errs = validate_dataset(name, cfg, dataset_ids)
            all_errors.extend(errs)
        except Exception as exc:
            all_errors.append(f"[{name}] {exc}")

    # ------------------------------------------------------
    # Report
    # ------------------------------------------------------
    if all_errors:
        print("\nVALIDATION FAILED – issues found:")
        for msg in all_errors:
            print(" •", msg)
        print(f"\nTotal errors: {len(all_errors)}")
        sys.exit(1)

    print("All content CSVs & articles validated successfully.")


if __name__ == "__main__":
    main() 