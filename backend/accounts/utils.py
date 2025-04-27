# utils.py
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.contrib.staticfiles.storage import staticfiles_storage

def send_otp_email(email, code):
    subject = 'Votre code de vérification SecureSync'
    
    # Contexte pour le template HTML
    context = {
        'code': code,
        'logo_url': 'https://i.ibb.co/S4DTLrrc/logo-band-inverted.png',  # URL absolue vers le logo hébergé sur ibb.co
    }
    
    # Template HTML avec style moderne et bouton pour copier le code
    html_message = f"""
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SecureSync - Code de Vérification</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            body {{
                font-family: 'Poppins', sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f0f4f8;
                background-image: linear-gradient(135deg, #f0f4f8 0%, #f9f9f9 100%);
            }}
            .container {{
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 16px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
                overflow: hidden;
                border: 1px solid #eaeaea;
            }}
            .header {{
                background: linear-gradient(135deg, #2c3e50, #1a252f);
                padding: 25px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }}
            .header::before {{
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
                opacity: 0.6;
                pointer-events: none;
            }}
            .header img {{
                max-width: 150px;
                height: auto;
                filter: drop-shadow(0 5px 15px rgba(0,0,0,0.2));
                transition: transform 0.3s ease;
                animation: float 6s ease-in-out infinite;
            }}
            @keyframes float {{
                0% {{ transform: translateY(0px); }}
                50% {{ transform: translateY(-10px); }}
                100% {{ transform: translateY(0px); }}
            }}
            .content {{
                padding: 35px;
                background-color: #ffffff;
                position: relative;
            }}
            h1 {{
                color: #2c3e50;
                margin-top: 0;
                font-size: 24px;
                font-weight: 600;
                position: relative;
                display: inline-block;
            }}
            h1::after {{
                content: '';
                position: absolute;
                left: 0;
                bottom: -6px;
                width: 100%;
                height: 3px;
                background: linear-gradient(to right, #3498db, transparent);
                border-radius: 2px;
            }}
            .code-container {{
                margin: 30px 0;
                padding: 25px;
                background: linear-gradient(135deg, #f8f9fa, #e9f2f9);
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 8px 20px rgba(0,0,0,0.05);
                border: 1px solid rgba(52, 152, 219, 0.2);
            }}
            .code {{
                font-family: 'Courier New', monospace;
                font-size: 32px;
                font-weight: 700;
                color: #2c3e50;
                letter-spacing: 5px;
                padding: 15px 20px;
                background: linear-gradient(120deg, #f1f5f9, #ffffff, #f1f5f9);
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                display: inline-block;
                animation: pulse 2s infinite;
                border: 1px dashed #3498db;
            }}
            @keyframes pulse {{
                0% {{
                    box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.4);
                }}
                70% {{
                    box-shadow: 0 0 0 10px rgba(52, 152, 219, 0);
                }}
                100% {{
                    box-shadow: 0 0 0 0 rgba(52, 152, 219, 0);
                }}
            }}
            .copy-btn {{
                display: inline-block;
                margin-top: 20px;
                padding: 12px 28px;
                background: linear-gradient(to right, #3498db, #2980b9);
                color: #ffffff;
                border-radius: 30px;
                text-decoration: none;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
                transition: all 0.3s ease;
                border: none;
            }}
            .copy-btn:hover {{
                transform: translateY(-2px);
                box-shadow: 0 6px 15px rgba(52, 152, 219, 0.4);
                background: linear-gradient(to right, #2980b9, #3498db);
            }}
            .validity {{
                font-size: 14px;
                color: #7f8c8d;
                margin: 20px 0;
                text-align: center;
                padding: 10px;
                border-radius: 8px;
                background-color: rgba(236, 240, 241, 0.6);
                border-left: 3px solid #3498db;
            }}
            .footer {{
                background: linear-gradient(to right, #f1f5f9, #e6eef5);
                padding: 20px;
                text-align: center;
                font-size: 13px;
                color: #7f8c8d;
                border-top: 1px solid rgba(0,0,0,0.05);
            }}
            .footer::before {{
                content: '';
                display: block;
                height: 3px;
                width: 80px;
                background: linear-gradient(to right, transparent, #3498db, transparent);
                margin: 0 auto 15px;
                border-radius: 50%;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="corner-decoration top-left"></div>
            <div class="corner-decoration top-right"></div>
            <div class="corner-decoration bottom-left"></div>
            <div class="corner-decoration bottom-right"></div>
            <div class="header">
                <img src="https://i.ibb.co/S4DTLrrc/logo-band-inverted.png" alt="SecureSync Logo">
            </div>
            <div class="content">
                <h1>Bonjour,</h1>
                <p>Voici votre code de vérification pour accéder à SecureSync :</p>
                
                <div class="code-container">
                    <div class="code">{code}</div>
                </div>
                
                <p class="validity">Ce code est valable pendant <strong>10 minutes</strong>.</p>
                
                <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet email.</p>
                
                <p>Cordialement,<br>L'équipe SecureSync</p>
            </div>
            <div class="footer">
                &copy; {settings.COPYRIGHT_YEAR if hasattr(settings, 'COPYRIGHT_YEAR') else '2025'} SecureSync. Tous droits réservés.
            </div>
        </div>
    </body>
    </html>
    """
    
    # Version texte simple pour les clients qui ne supportent pas HTML
    plain_message = strip_tags(html_message)
    
    sender = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    # Création du message avec contenu alternatif (HTML et texte)
    msg = EmailMultiAlternatives(subject, plain_message, sender, recipient_list)
    msg.attach_alternative(html_message, "text/html")
    msg.send()
    
    return True

def send_otp_email_Register(email, username, password):
    subject = 'Bienvenue chez SecureSync !'
    
    # Template HTML avec style moderne pour les identifiants
    html_message = f"""
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue chez SecureSync</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            body {{
                font-family: 'Poppins', sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f0f4f8;
                background-image: linear-gradient(135deg, #f0f4f8 0%, #f9f9f9 100%);
            }}
            .container {{
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 16px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
                overflow: hidden;
                border: 1px solid #eaeaea;
            }}
            .header {{
                background: linear-gradient(135deg, #2c3e50, #1a252f);
                padding: 25px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }}
            .header::before {{
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
                opacity: 0.6;
                pointer-events: none;
            }}
            .header img {{
                max-width: 150px;
                height: auto;
                filter: drop-shadow(0 5px 15px rgba(0,0,0,0.2));
                transition: transform 0.3s ease;
                animation: float 6s ease-in-out infinite;
            }}
            @keyframes float {{
                0% {{ transform: translateY(0px); }}
                50% {{ transform: translateY(-10px); }}
                100% {{ transform: translateY(0px); }}
            }}
            .content {{
                padding: 35px;
                background-color: #ffffff;
                position: relative;
            }}
            h1 {{
                color: #2c3e50;
                margin-top: 0;
                font-size: 26px;
                text-align: center;
                font-weight: 600;
                position: relative;
                display: inline-block;
                margin-bottom: 25px;
            }}
            h1::after {{
                content: '';
                position: absolute;
                left: 25%;
                bottom: -12px;
                width: 50%;
                height: 4px;
                background: linear-gradient(to right, transparent, #3498db, transparent);
                border-radius: 2px;
            }}
            h2 {{
                color: #3498db;
                font-size: 18px;
                margin-top: 25px;
            }}
            .credentials {{
                margin: 30px 0;
                padding: 25px;
                background: linear-gradient(135deg, #f8f9fa, #e9f2f9);
                border-radius: 12px;
                box-shadow: 0 8px 20px rgba(0,0,0,0.05);
                border: 1px solid rgba(52, 152, 219, 0.2);
                position: relative;
            }}
            .credentials::before {{
                content: '🔐';
                position: absolute;
                top: -15px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 26px;
                background: white;
                padding: 5px 15px;
                border-radius: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            .credential-item {{
                margin-bottom: 20px;
            }}
            .credential-label {{
                display: block;
                font-weight: 600;
                margin-bottom: 8px;
                color: #2c3e50;
                font-size: 15px;
            }}
            .credential-value {{
                display: block;
                font-family: 'Courier New', monospace;
                font-size: 17px;
                font-weight: 700;
                color: #2c3e50;
                padding: 15px;
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                position: relative;
                box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
                transition: all 0.2s ease;
            }}
            .credential-value:hover {{
                border-color: #3498db;
                box-shadow: inset 0 1px 3px rgba(52, 152, 219, 0.2);
            }}
            .copy-btn {{
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                padding: 5px 12px;
                background: linear-gradient(to right, #3498db, #2980b9);
                color: #ffffff;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                transition: all 0.2s ease;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }}
            .copy-btn:hover {{
                transform: translateY(-50%) scale(1.05);
                box-shadow: 0 3px 8px rgba(0,0,0,0.15);
            }}
            .footer {{
                background: linear-gradient(to right, #f1f5f9, #e6eef5);
                padding: 20px;
                text-align: center;
                font-size: 13px;
                color: #7f8c8d;
                border-top: 1px solid rgba(0,0,0,0.05);
            }}
            .footer::before {{
                content: '';
                display: block;
                height: 3px;
                width: 80px;
                background: linear-gradient(to right, transparent, #3498db, transparent);
                margin: 0 auto 15px;
                border-radius: 50%;
            }}
            .action-btn {{
                display: block;
                width: 220px;
                margin: 35px auto;
                padding: 14px 25px;
                background: linear-gradient(to right, #3498db, #2980b9);
                color: #ffffff;
                text-align: center;
                text-decoration: none;
                border-radius: 30px;
                font-weight: 600;
                font-size: 15px;
                letter-spacing: 0.5px;
                box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
                position: relative;
                overflow: hidden;
                transition: all 0.3s ease;
            }}
            .action-btn:hover {{
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(41, 128, 185, 0.5);
            }}
            .action-btn::after {{
                content: '→';
                position: absolute;
                right: 20px;
                opacity: 0;
                transition: all 0.3s ease;
            }}
            .action-btn:hover::after {{
                opacity: 1;
                right: 15px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="corner-decoration top-left"></div>
            <div class="corner-decoration top-right"></div>
            <div class="corner-decoration bottom-left"></div>
            <div class="corner-decoration bottom-right"></div>
            <div class="header">
                <img src="https://i.ibb.co/S4DTLrrc/logo-band-inverted.png" alt="SecureSync Logo">
            </div>
            <div class="content">
                <h1>Bienvenue chez SecureSync !</h1>
                <p>Nous sommes ravis de vous compter parmi nos utilisateurs. Votre compte a été créé avec succès.</p>
                
                <h2>Vos identifiants de connexion</h2>
                <div class="credentials">
                    <div class="credential-item">
                        <span class="credential-label">Nom d'utilisateur :</span>
                        <div class="credential-value">
                            {username}
                        </div>
                    </div>
                    
                    <div class="credential-item">
                        <span class="credential-label">Mot de passe :</span>
                        <div class="credential-value">
                            {password}
                        </div>
                    </div>
                </div>
                
                <p>Pour des raisons de sécurité, nous vous recommandons de vous connecter dès que possible et de changer votre mot de passe dans votre espace personnel.</p>
                
                <a href="https://securesync.com/login" class="action-btn">Se connecter maintenant</a>
                
                <p>Si vous avez des questions ou besoin d'aide, n'hésitez pas à contacter notre équipe support.</p>
                
                <p>Cordialement,<br>L'équipe SecureSync</p>
            </div>
            <div class="footer">
                &copy; {settings.COPYRIGHT_YEAR if hasattr(settings, 'COPYRIGHT_YEAR') else '2025'} SecureSync. Tous droits réservés.
            </div>
        </div>
    </body>
    </html>
    """
    
    # Version texte simple pour les clients qui ne supportent pas HTML
    plain_message = strip_tags(html_message)
    
    sender = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    # Création du message avec contenu alternatif (HTML et texte)
    msg = EmailMultiAlternatives(subject, plain_message, sender, recipient_list)
    msg.attach_alternative(html_message, "text/html")
    msg.send()
    
    return True

