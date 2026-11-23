from django.urls import path
from .views import ModuleRecordListCreateView, ModuleRecordDetailView

urlpatterns = [
    path("data/<slug:module>/", ModuleRecordListCreateView.as_view(), name="module-record-list"),
    path("data/<slug:module>/<uuid:record_id>/", ModuleRecordDetailView.as_view(), name="module-record-detail"),
]
