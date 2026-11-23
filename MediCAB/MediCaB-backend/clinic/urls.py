from django.urls import path
from .views import (
    ModuleRecordListCreateView, ModuleRecordDetailView,
    DashboardStatsView, AIProxyView
)

urlpatterns = [
    path("dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("ai/<str:endpoint>/", AIProxyView.as_view(), name="ai-proxy"),
    path("data/<slug:module>/", ModuleRecordListCreateView.as_view(), name="module-record-list"),
    path("data/<slug:module>/<str:record_id>/", ModuleRecordDetailView.as_view(), name="module-record-detail"),
]
