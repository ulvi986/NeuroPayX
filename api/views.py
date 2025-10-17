from django.shortcuts import render,redirect
from .models import User
from .models import Templates
from api.models import Consultans
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password


from django.contrib import messages


# Create your views here.

def index(request):
    templates = Templates.objects.all()
    print(templates)
    return render(request, "index.html", {"templates": templates})


@api_view(['GET'])
def consulting(request):
    consultans = Consultans.objects.all()
    print(consultans)

    return render(request, 'consulting.html', {"consultans": consultans})


def signup(request):
    return render(request, 'signup.html')



def login(request):
    return render(request, 'login.html')


@api_view(['POST'])
def signupsubmit(request):
    if request.method == 'POST':
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')

        if password != confirm_password:
            return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already in use'}, status=status.HTTP_400_BAD_REQUEST)
        

        hashed_password = make_password(password)
        user = User(username=username, email=email, password=hashed_password)
        user.save()

        messages.success(request, "Account created successfully!")
        return redirect('/')  # login page-ə yönləndir
    return render(request, 'signup.html')


