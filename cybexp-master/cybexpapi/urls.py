from django.urls import path
from . import views

urlpatterns = [
    path('events', views.events.as_view(), name='events'),
    path('public', views.public.as_view(), name='public'),
    path('private', views.private.as_view(), name='private'),
]
