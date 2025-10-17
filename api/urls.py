from django.urls import path
from . import views
urlpatterns = [
    path('', views.index, name='index'),
    path('consulting/', views.consulting, name='consulting'),
    path('signup/', views.signup, name='signup'),
    path('signupsubmit/', views.signupsubmit, name='signupsubmit'),
    path('login/', views.login, name='login'),
]
