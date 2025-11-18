from django.contrib import admin

# Register your models here.

from .models import User
from .models import Templates, TemplateImage
from .models import Consultans
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email','password')



class TemplateImageInline(admin.TabularInline):
    model = TemplateImage
    extra = 1  # Başlanğıcda 1 boş input göstərilsin
    fields = ['image']

@admin.register(Templates)
class TemplatesAdmin(admin.ModelAdmin):
    list_display = ('title', 'username', 'gmail', 'github_link', 'description', 'created_at')
    inlines = [TemplateImageInline]  # <-- Burada inline əlavə olunur



@admin.register(Consultans)
class ConsultansAdmin(admin.ModelAdmin):
    list_display = ('username', 'gmail', 'experience_title', 'description', 'created_at', 'image')