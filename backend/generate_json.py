import json
from itertools import count
import argparse
from pathlib import Path
from points.services import build_feature_collection


def parse_args():
    parser = argparse.ArgumentParser(description="Генератор GeoJSON точек")
    parser.add_argument(
        "-n", "--count", type=int, default=COUNT_DEFAULT,
        help="Cколько точек создать?",
    )
    parser.add_argument(
        "-o", "--output", type=Path, default=Path("data/points.geojson"),
        help="Путь к файлу результата",
    )
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    collection=build_feature_collection(args.count)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(collection, indent=2, ensure_ascii=False),
        encoding="utf-8",)
    print(f"ok: {args.count} objects -> {args.output}")
