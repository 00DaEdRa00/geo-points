from datetime import datetime

from django.core.management.base import BaseCommand

from points.models import PointFeature
from points.services import random_coordinates, random_properties

class Command(BaseCommand):
    help = "Заполнение БД рандомными точками"

    def add_arguments(self, parser):
        parser.add_argument("-n", "--count", type=int, default=500)

    def handle(self, *args, **options):
        count = options['count']
        PointFeature.objects.all().delete()

        objects = []
        for i in range(1, count + 1):
            props = random_properties(i)
            lon, lat = random_coordinates()
            objects.append(PointFeature(
                name=props['name'],
                area=props['area'],
                status=props['status'],
                date_create=datetime.strptime(props['date_create'], '%d.%m.%Y').date(),
                type=props['type'],
                lon=lon,
                lat=lat,
            ))
        PointFeature.objects.bulk_create(objects)
        self.stdout.write(self.style.SUCCESS(f"OK:{count} точек добавлено"))
