from django.db import models

class User(models.Model):
    username = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)

    def __str__(self):
        return self.username


class Templates(models.Model):
    title = models.CharField(max_length=200)
    username = models.CharField(max_length=200)
    gmail = models.EmailField()
    github_link = models.URLField()
    description = models.TextField()
    image = models.ImageField(upload_to='templates/', blank=True, null=True)  # ✅ Add this field
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title


class TemplateImage(models.Model):
    template = models.ForeignKey(Templates, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='media/')


class Consultans(models.Model):
    username = models.CharField(max_length=200)
    gmail = models.EmailField()
    experience_title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='consultants/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username
    


class Rating(models.Model):
    template = models.ForeignKey(Templates, on_delete=models.CASCADE)
    value = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)


class Comment(models.Model):
    template = models.ForeignKey(Templates, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)