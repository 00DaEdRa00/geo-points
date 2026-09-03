from django.core.paginator import Paginator
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import PointFeature
from .serializers import PointFeatureSerializer

import re

def natural_sort_key(text: str): #Для более "правильного" поиска нарезаем строку на буквы и цифры
    return tuple(
        int(chunk) if chunk.isdigit() else chunk.casefold()
        for chunk in re.split(r'(\d+)', text)
        if chunk
    )

class FeatureListView(APIView):
    DEFAULT_PAGINATION = 20
    MAX_PAGINATION = 100
    SORTABLE_FIELDS = {'name', 'area', 'status', 'date_create', 'type',}

    def get(self, request):
        qs = PointFeature.objects.all()
        total = qs.count()

        q = request.query_params.get('q', "").strip()
        if q:
            qs = qs.filter(name__icontains=q)
        filtered = qs.count()

        ordering = request.query_params.get('ordering', "")
        field = ordering.lstrip("-")
        desc = ordering.startswith("-")
        if field == "name":
            qs = sorted(qs, key=lambda p: natural_sort_key(p.name), reverse=desc)
        elif field in self.SORTABLE_FIELDS:
            qs = qs.order_by(ordering)
        try:
            page_size = int(request.query_params.get('page_size', self.DEFAULT_PAGINATION))
        except ValueError:
            page_size = self.DEFAULT_PAGINATION
        page_size = max(1, min(page_size, self.MAX_PAGINATION))

        paginator = Paginator(qs, page_size)
        page = paginator.get_page(request.query_params.get('page', 1))

        return Response({
            "items": PointFeatureSerializer(page.object_list, many=True).data,
            "count_total": total,
            "count_filtered": filtered,
            "page": page.number,
            "pages": paginator.num_pages,
        })


def geojson_view(request):
    features = [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    p.lon, p.lat
                ]
            },
            "properties": {
                "id": p.id,
                "name": p.name,
                "area": p.area,
                "status": p.status,
                "date_create": p.date_create.strftime("%d.%m.%Y"),
                "type": p.type,
            },
        }
        for p in PointFeature.objects.all()
    ]
    return JsonResponse({"type": "FeatureCollection", "features": features})
