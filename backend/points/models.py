from django.db import models

class PointFeature(models.Model):
    TYPE_CHOICES = [(i, f"Type{i}") for i in range(1, 6)]

    name = models.CharField(max_length=200)
    area = models.FloatField()
    status = models.BooleanField(default=True)
    date_create = models.DateField()
    type = models.PositiveSmallIntegerField(choices=TYPE_CHOICES) #Для экономии места целое положительное число маленького размера
    lon = models.FloatField()
    lat = models.FloatField()

    class Meta:
        ordering = ["id"] # сортировка по ID

