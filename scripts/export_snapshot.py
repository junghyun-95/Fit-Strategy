"""One-time, read-only export of a real data snapshot from
discovery fit library's fit_library.db into this project's src/data/*.json
and public/evidence/*. Never writes to fit_library.db. Safe to re-run."""
import json
import shutil
import sqlite3
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = (
    PROJECT_ROOT.parent / "discovery fit library" / "fit_library.db"
)
UPLOADS_DIR = PROJECT_ROOT.parent / "discovery fit library" / "uploads"
DATA_DIR = PROJECT_ROOT / "src" / "data"
EVIDENCE_DIR = PROJECT_ROOT / "public" / "evidence"

SPEC_FIELD_MAP = {
    "front_length": "frontLength", "back_length": "backLength",
    "chest": "chest", "waist_position": "waistPosition", "waist": "waist",
    "hem": "hem", "neck_width": "neckWidth",
    "front_neck_depth": "frontNeckDepth", "back_neck_depth": "backNeckDepth",
    "shoulder": "shoulder", "hwajang": "hwajang",
    "sleeve_circumference": "sleeveCircumference", "sleeve_hem": "sleeveHem",
    "shoulder_angle": "shoulderAngle", "armhole_depth": "armholeDepth",
}


def get_connection(db_path: Path) -> sqlite3.Connection:
    uri = f"file:{db_path.as_posix()}?mode=ro"
    conn = sqlite3.connect(uri, uri=True)
    conn.row_factory = sqlite3.Row
    return conn


def to_spec(row: sqlite3.Row) -> dict:
    spec = {}
    for src, dst in SPEC_FIELD_MAP.items():
        val = row[src] if src in row.keys() else None
        if val is not None:
            spec[dst] = val
    return spec


def build_own_fits(conn: sqlite3.Connection) -> list[dict]:
    cur = conn.execute(
        "SELECT * FROM fits WHERE status = 'confirmed'"
    )
    out = []
    for row in cur.fetchall():
        out.append({
            "id": row["id"],
            "name": row["name"],
            "gender": row["gender"],
            "tagline": row["tagline"],
            "spec": to_spec(row),
            "images": {
                "crop": row["image_path_crop"],
                "full": row["image_path_full"],
                "product": row["image_path_product"],
            },
        })
    return out


def build_plm_specs(conn: sqlite3.Connection) -> list[dict]:
    cur = conn.execute(
        "SELECT * FROM plm_specs WHERE sesn IN ('25S', '26S')"
    )
    out = []
    for row in cur.fetchall():
        out.append({
            "id": row["id"],
            "productCode": row["prdt_cd"],
            "productName": row["prdt_nm"],
            "gender": row["gender"],
            "season": row["sesn"],
            "baseSize": row["base_size"],
            "fitName": row["fit_name"],
            "spec": to_spec(row),
            "imageUrl": row["prdt_img_url"],
            "techPackUrl": row["cad_pdf_url"],
        })
    return out


def build_market_entries(conn: sqlite3.Connection) -> list[dict]:
    cur = conn.execute("SELECT * FROM market_entries")
    out = []
    for row in cur.fetchall():
        out.append({
            "id": row["id"],
            "brand": row["brand"],
            "style": row["style"],
            "gender": row["gender"],
            "fitRaw": row["fit"],
            "spec": to_spec(row),
            "dataType": (
                "ai_estimate" if row["spec_estimated"] == 1
                else "actual_measurement"
            ),
            "imagePath": row["image_path"],
            "sourceUrl": row["source_url"],
        })
    return out


def copy_referenced_images(own_fits: list[dict], market: list[dict]) -> None:
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    paths = set()
    for fit in own_fits:
        for p in fit["images"].values():
            if p:
                paths.add(p)
    for entry in market:
        if entry["imagePath"]:
            paths.add(entry["imagePath"])
    for rel in paths:
        filename = Path(rel).name
        src = UPLOADS_DIR / filename
        if src.exists():
            shutil.copyfile(src, EVIDENCE_DIR / filename)


def write_json(name: str, data) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path = DATA_DIR / name
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"wrote {path} ({len(data)} rows)")


def main() -> None:
    conn = get_connection(DB_PATH)
    try:
        own_fits = build_own_fits(conn)
        plm_specs = build_plm_specs(conn)
        market = build_market_entries(conn)
    finally:
        conn.close()

    write_json("ownFits.json", own_fits)
    write_json("plmSpecs.json", plm_specs)
    write_json("marketEntries.json", market)
    copy_referenced_images(own_fits, market)
    print(f"copied images into {EVIDENCE_DIR}")


if __name__ == "__main__":
    main()
