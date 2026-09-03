import random
from datetime import date, timedelta

COUNT_DEFAULT = 500
LON_RANGE = (36.0, 38.5)
LAT_RANGE = (55.0, 56.5)
DATE_START = date(2020, 1, 1)
DATE_END = date.today()
DAYS_SPAN = (DATE_END - DATE_START).days


def random_coordinates():
    return (
        round(random.uniform(*LON_RANGE), 6),
        round(random.uniform(*LAT_RANGE), 6),
    )


def random_properties(point_id):
    created = DATE_START + timedelta(days = random.randint(0, DAYS_SPAN))
    return {
        "id": point_id,
        "name": f"Точка №{point_id}",
        "area": round(random.uniform(0.001, 9999.999), 3),
        "status": random.choice([True, False]),
        "date_create": created.strftime("%d.%m.%Y"),
        "type": random.randint(1, 5),
    }


def make_feature(point_id):
    lon, lat = random_coordinates()
    return {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [lon, lat]},
        "properties": random_properties(point_id),
    }


def build_feature_collection(count):
    return {
        "type": "FeatureCollection",
        "features": [make_feature(i) for i in range(1, count + 1)],
    }