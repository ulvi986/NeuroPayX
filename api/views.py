from django.shortcuts import render,redirect
from .models import User
from .models import Templates
from api.models import Consultans
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password

import json
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from django.contrib import messages


myglobalpassword = None
myglobalusername = None
myglobalsendergmail = None
myglobalcreatorgmail = None



# Create your views here.

#region basic structures of web

def index(request):
    return render(request,"index.html")


def menu(request):
    templates = Templates.objects.all()
    print(templates)
    return render(request, "menu.html", {"templates": templates})




def signup(request):
    return render(request, 'signup.html')



def login(request):
    return render(request, 'login.html')


#endregion
#region signupsubmit
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
        request.session['user_id'] = user.id  # İstifadəçi ID-ni sessiyaya əlavə et
        request.session['username'] = user.username  # İstifadəçi adını sessiyaya əlavə et
        request.session['email'] = user.email  # İstifadəçi emailini sessiyaya əlavə et

        messages.success(request, "Account created successfully!")
        
        return Response({'success': True})
    
    return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)
#endregion

#region consultans showing
@api_view(['GET'])
def consulting(request):
    consultans = Consultans.objects.all()
    print(consultans)

    return render(request, 'consulting.html', {"consultans": consultans})
#endregion



@api_view(['GET'])
def get_the_consultant(request):
    username = request.GET.get("username")
    template_id = request.GET.get("id")  # Yeni ID parametri
    email = request.GET.get("email")

    if username:
        consultans = Consultans.objects.filter(username=username)
    else:
        pass
    
    return render(request, 'consultantsinformation.html', {"consultants":consultans})


@api_view(['GET'])
def get_A_Request_Consultant(request):
      # GET parametrlərini al
    user_email = request.GET.get('email', '').strip()
    consultant_email = request.GET.get('consultantEmail', '').strip()
    username = request.GET.get('username', '').strip()
    
    print(f"User Email: {user_email}")
    print(f"Template Creator Email: {consultant_email}")
    print(f"Username: {username}")
    
    # Parametrləri yoxla
    if not user_email or not consultant_email or not username:
        print("Error: Missing required parameters")
        
    
    # SMTP məlumatları
    SMTP_SERVER = 'smtp.gmail.com'
    SMTP_PORT = 587
    SENDER_EMAIL = 'u.sharifzade@gmail.com'
    SENDER_PASSWORD = 'cxzd boes lpzk pliy'
    
    # Email subject və body
    subject = f'Template Request from {username}'
    body = f'''
Salam,

{username} səninlə konsultantlıq barədə danışmaq istəyir.

İstifadəçinin emaili: {user_email}
İstifadəçinin adı: {username}

Lütfən, onunla əlaqə saxla.

Hörmətlə,
NeuroPayX Komandası
    '''
    
    # Email mesajını hazırla
    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = consultant_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        # SMTP server-ə qoşul
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        
        # Email göndər
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, consultant_email, text)
        print('Email sent successfully!')
        
        # Server bağla
        server.quit()
        
        # Uğurlu mesaj səhifəsinə yönləndir
        return render(request, 'successmessage.html', {
            'username': username,
            'template_creator_email': consultant_email
        })
        
    except Exception as e:
        print(f'Error occurred: {e}')
        import traceback
        traceback.print_exc()




"""
@api_view(['GET'])
def get_the_templates(request):
    username = request.GET.get("username")
    template_id = request.GET.get("id")  # Yeni ID parametri
    email = request.GET.get("email")
    global myglobalreceivergmail
    myglobalreceivergmail = request.GET.get('email')
    print("Menim baxdigim email: " + email)
    global myglobalcreatorgmail
    myglobalcreatorgmail = request.GET.get("template_creator_email")
    print("Baxdigimizin templatenin kime aid oldugu: " + myglobalcreatorgmail)
    
    
    if username:
        templates = Templates.objects.filter(username=username)
    else:
        templates = Templates.objects.all()

    print(template_id)
    
    return render(request, 'templates.html', {"templates": templates})

    
"""

def show_me_template(request, template_id):
    try:
        template = Templates.objects.get(id=template_id)
        return render(request, 'showtemplate.html', {'templates': template})
    except Templates.DoesNotExist:
        return render(request, 'template_not_found.html')


def get_A_Request_Template(request,template_id):    
    user = request.session.get('username')
    user_email = request.session.get('email')
    template = Templates.objects.get(id=template_id)
    template_creator_email = template.gmail
    SMTP_SERVER = 'smtp.gmail.com'
    SMTP_PORT = 587
    SENDER_EMAIL = 'u.sharifzade@gmail.com'
    SENDER_PASSWORD = 'cxzd boes lpzk pliy'
    
    # Email subject və body
    subject = f'Template Request from {user}'
    body = f'''
Salam,

{user} sənin template-ini istəyib.

İstifadəçinin emaili: {user_email}
İstifadəçinin adı: {user}

Lütfən, onunla əlaqə saxla.

Hörmətlə,
NeuroPayX Komandası
    '''
    
    # Email mesajını hazırla
    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = template_creator_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        # SMTP server-ə qoşul
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        
        # Email göndər
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, template_creator_email, text)
        print('Email sent successfully!')
        
        # Server bağla
        server.quit()
        
        # Uğurlu mesaj səhifəsinə yönləndir
        return render(request, 'successmessage.html', {
            'username': user,
            'template_creator_email': template_creator_email
        })
        
    except Exception as e:
        print(f'Error occurred: {e}')
        import traceback
        traceback.print_exc()
        
       






"""
api_view(["GET"])
def get_A_Request_Template(request):
    # GET parametrlərini al
    user_email = request.GET.get('email', '').strip()
    template_creator_email = request.GET.get('template_creator_email', '').strip()
    username = request.GET.get('username', '').strip()
    template_id = request.GET.get('template_id', '').strip()
    
    print(f"User Email: {user_email}")
    print(f"Template Creator Email: {template_creator_email}")
    print(f"Username: {username}")
    print(f"Template ID: {template_id}")
    
    # Parametrləri yoxla
    if not user_email or not template_creator_email or not username:
        print("Error: Missing required parameters")
        
    
    # SMTP məlumatları
    SMTP_SERVER = 'smtp.gmail.com'
    SMTP_PORT = 587
    SENDER_EMAIL = 'u.sharifzade@gmail.com'
    SENDER_PASSWORD = 'cxzd boes lpzk pliy'
    
    # Email subject və body
    subject = f'Template Request from {username}'
    body = f'''
Salam,

{username} sənin template-ini istəyib.

İstifadəçinin emaili: {user_email}
İstifadəçinin adı: {username}

Lütfən, onunla əlaqə saxla.

Hörmətlə,
NeuroPayX Komandası
    '''
    
    # Email mesajını hazırla
    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = template_creator_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        # SMTP server-ə qoşul
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        
        # Email göndər
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, template_creator_email, text)
        print('Email sent successfully!')
        
        # Server bağla
        server.quit()
        
        # Uğurlu mesaj səhifəsinə yönləndir
        return render(request, 'successmessage.html', {
            'username': username,
            'template_creator_email': template_creator_email
        })
        
    except Exception as e:
        print(f'Error occurred: {e}')
        import traceback
        traceback.print_exc()
        
       
"""



def show_me_consultant(request, consultant_id):
    try:
        consultant = Consultans.objects.get(id=consultant_id)
        return render(request, 'consultantsinformation.html', {'consultans': consultant})
    except Consultans.DoesNotExist:
        return render(request, 'template_not_found.html')



def get_A_Request_Consultant(request, consultans_id):
    user = request.session.get('username')
    user_email = request.session.get('email')
    consultant = Consultans.objects.get(id=consultans_id)
    consultant_gmail = consultant.gmail
    SMTP_SERVER = 'smtp.gmail.com'
    SMTP_PORT = 587
    SENDER_EMAIL = 'u.sharifzade@gmail.com'
    SENDER_PASSWORD = 'cxzd boes lpzk pliy'
    
    # Email subject və body
    subject = f'Consultant request form {user}'
    body = f'''
Salam,

{user} səndən konsultantlıq almaq istəyir.

İstifadəçinin emaili: {user_email}
İstifadəçinin adı: {user}

Lütfən, onunla əlaqə saxla.

Hörmətlə,
NeuroPayX Komandası
    '''
    
    # Email mesajını hazırla
    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = consultant_gmail
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        # SMTP server-ə qoşul
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        
        # Email göndər
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, consultant_gmail, text)
        print('Email sent successfully!')
        
        # Server bağla
        server.quit()
        
        # Uğurlu mesaj səhifəsinə yönləndir
        return render(request, 'successmessage.html', {
            'username': user,
        })
        
    except Exception as e:
        print(f'Error occurred: {e}')
        import traceback
        traceback.print_exc()
        
       






#region contact with support center
def support_center(request):
    user  = request.session.get('user_id')
    email = request.session.get('email')
    SMTP_SERVER = 'smtp.gmail.com'
    SMTP_PORT = 587
    SENDER_EMAIL = 'u.sharifzade@gmail.com'
    SENDER_PASSWORD = 'cxzd boes lpzk pliy'
    subject = f'Support Center'
    body = f'''
Salam, {email}-də problem baş verib 

Lütfən, onunla əlaqə saxla.

Hörmətlə,
NeuroPayX Komandası
    '''
    support_center_gmail = "u.sharifzade@gmail.com"
    # Email mesajını hazırla
    msg = MIMEMultipart()
    msg['From'] = "NeuroPayx <noreply@neuropayx.az>"
    msg['To'] = "u.sharifzade@gmail.com"
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        # SMTP server-ə qoşul
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        
        # Email göndər
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, support_center_gmail, text)
        print('Email sent successfully!')
        
        # Server bağla
        server.quit()
        
        # Uğurlu mesaj səhifəsinə yönləndir
        return render(request, 'successmessage.html')
        
    except Exception as e:
        print(f'Error occurred: {e}')
        import traceback
        traceback.print_exc()


#endregion