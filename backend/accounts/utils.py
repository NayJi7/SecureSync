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
    subject = 'Votre code de vérification SecureSync'
    message = f'''
    Bonjour,
    
    Bienvenue sur SecureSync. Voici vos idendifiant:

    username : {username}

    password : {password}
    
    Si vous n'avez pas demandé ce code, veuillez ignorer cet email.
    
    L'équipe SecureSync
    '''
    
    sender = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    send_mail(subject, message, sender, recipient_list, fail_silently=False)
    return True

