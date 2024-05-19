from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('process_genes', views.process_genes, name='process_genes'),
    path('get_provenance/<str:gene_value>', views.get_provenance, name='get_provenance'),
]