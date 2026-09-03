from rest_framework import serializers
from .models import PointFeature


class PointFeatureSerializer(serializers.ModelSerializer):
    date_create = serializers.DateField(format='%d.%m.%Y')

    class Meta:
        model = PointFeature
        fields = [
            "id", "name", "area", "status",
            "date_create", "type", "lon", "lat",
        ]