from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/dictionary/', views.api_view, name='api_view')
]