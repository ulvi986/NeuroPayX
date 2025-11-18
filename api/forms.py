from django import forms
from .models import TemplateImage

class TemplateImageForm(forms.ModelForm):
    class Meta:
        model = TemplateImage
        fields = ['image']
        widgets = {
            'image': forms.ClearableFileInput(attrs={'multiple': True}),
        }
