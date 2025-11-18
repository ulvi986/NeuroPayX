from django.urls import path
from . import views
urlpatterns = [
    path('', views.index, name='index'),
    path('consulting/', views.consulting, name='consulting'),
    path('signup/', views.signup, name='signup'),
    path('menu/', views.menu, name='menu'),
    path('signupsubmit/', views.signupsubmit, name='signupsubmit'),
    path('login/', views.login, name='login'),
    #path('get_the_templates/', views.get_the_templates, name='get_the_templates'),
    path('show_me_template/<int:template_id>/', views.show_me_template, name='show_me_template'),
    path('get_A_Request_Template/<int:template_id>/', views.get_A_Request_Template, name = 'get_A_Request_Template'),
    path('show_me_consultant/<int:consultant_id>/', views.show_me_consultant, name='show_me_consultant'),
    path('get_A_Request_Consultant/<int:consultans_id>/', views.get_A_Request_Consultant, name = 'get_A_Request_Consultant'),
    path("support_center/", views.support_center, name = "support_center"),
]
