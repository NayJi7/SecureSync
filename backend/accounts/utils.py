# utils.py
from django.core.mail import send_mail
from django.conf import settings

def send_otp_email(email, code):
    subject = 'Votre code de vérification SecureSync'
    message = f'''
    Bonjour,
    
    Votre code de vérification pour accéder à SecureSync est : {code}
    
    Ce code est valable pendant 10 minutes.
    
    Si vous n'avez pas demandé ce code, veuillez ignorer cet email.
    
    L'équipe SecureSync
    '''
    
    sender = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    send_mail(subject, message, sender, recipient_list, fail_silently=False)
    return True

def send_otp_email_Register(email, username, password):
    subject = 'Bienvenue chez SecureSync !'
    message = f'''
    Bonjour,
    
    Bienvenue chez SecureSync. Voici vos identifiants:

    username : {username}

    password : {password}
    
    Connectez vous une première fois pour activer votre compte et changez votre mot de passe dans votre espace personnel si vous le souhaitez.
    
    L'équipe SecureSync
    '''
    
    sender = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    send_mail(subject, message, sender, recipient_list, fail_silently=False)
    return True

