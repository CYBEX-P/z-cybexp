from django.urls import path
from . import views


urlpatterns = [
    path('', views.index, name='index'),
#   api namespace moved to the cybexpapi app
#    path('api/public', views.public.as_view(), name='public'),
    # path('api/private', views.private.as_view(), name='private'),
    # path('api/getmongodata', views.getmongodata.as_view(), name='getmongodata'),
    # #path('api/getData', views.getData.as_view(), name='getdata'),
    # path('login',views.login,name='login'),
    # path('logout',views.logout,name='logout'),
    path('home',views.home,name='home'),
    path('about',views.about,name='about'),
    path('contactus',views.contactus,name='contactus'),
    path('profile',views.profile,name='profile'),
    path('upload',views.upload,name='upload'),
    path('database',views.database,name='database'),
    # path('navbar',views.navbar,name='navbar'),
]

