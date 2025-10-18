from django.db import models

# Create your models here.


class User(models.Model):
    username = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # In practice, use Django's built-in User model for security

    def __str__(self):
        return self.username
    

class Templates(models.Model):
    title = models.CharField(max_length=200)
    username = models.CharField(max_length=200)
    gmail = models.EmailField()
    github_link = models.URLField()
    image = models.ImageField(upload_to='media/', blank=True, null=True)  # 🖼️ şəkil
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.title

class Consultans(models.Model):
    username = models.CharField(max_length=200)
    gmail = models.EmailField()
    experience_title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='consultants/', blank=True, null=True)  # 🖼️ şəkil
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username
    