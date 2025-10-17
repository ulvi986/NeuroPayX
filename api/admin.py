from django.contrib import admin

# Register your models here.

from .models import User
from .models import Templates
from .models import Consultans
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email','password')


@admin.register(Templates)
class TemplatesAdmin(admin.ModelAdmin):
    list_display = ('title', 'username', 'gmail', 'github_link', 'image', 'description', 'created_at')


@admin.register(Consultans)
class ConsultansAdmin(admin.ModelAdmin):
    list_display = ('username', 'gmail', 'experience_title', 'description', 'created_at', 'image')