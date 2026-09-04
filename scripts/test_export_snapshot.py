"""Read-only integration check against the real fit_library.db.
Does not write to the DB. Run with pytest."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from export_snapshot import (  # noqa: E402
    DB_PATH, get_connection, build_own_fits, build_plm_specs,
    build_market_entries,
)


def test_db_exists():
    assert DB_PATH.exists(), f"expected fit_library.db at {DB_PATH}"


def test_own_fits_shape():
    conn = get_connection(DB_PATH)
    try:
        fits = build_own_fits(conn)
    finally:
        conn.close()
    assert len(fits) == 8
    assert all(f["gender"] in ("men", "women") for f in fits)
    assert all("chest" in f["spec"] for f in fits)


def test_plm_specs_two_seasons():
    conn = get_connection(DB_PATH)
    try:
        specs = build_plm_specs(conn)
    finally:
        conn.close()
    seasons = {s["season"] for s in specs}
    assert seasons == {"25S", "26S"}
    assert len(specs) == 139


def test_market_entries_data_type_flag():
    conn = get_connection(DB_PATH)
    try:
        entries = build_market_entries(conn)
    finally:
        conn.close()
    assert len(entries) == 26
    assert all(e["dataType"] in ("actual_measurement", "ai_estimate") for e in entries)
