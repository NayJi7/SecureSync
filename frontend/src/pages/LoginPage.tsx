// React et hooks
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevice } from "@/hooks/use-device";

// Librairies externes
import { animated, useTransition } from '@react-spring/web';
import { Label, TextInput, Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";
import { motion } from 'framer-motion';

// Composants locaux
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Separator } from "@/components/ui/separator";
import Particles from '../blocks/Backgrounds/Particles/Particles';
import SpotlightCard from '../blocks/Components/SpotlightCard/SpotlightCard';
import SplitText from "../blocks/TextAnimations/SplitText/SplitText";
import VariableProximity from '../blocks/TextAnimations/VariableProximity/VariableProximity';

// Icônes
import { Home, ArrowRight, Check, X } from 'lucide-react';
import { HiMail } from "react-icons/hi";
import { TbLockPassword } from "react-icons/tb";
import { FiRepeat } from "react-icons/fi";
import { MdOutlineLogin } from "react-icons/md";
import { LuEyeClosed, LuEye } from "react-icons/lu";
import { CgProfile } from "react-icons/cg";

// Définir le type AnimatedDiv pour résoudre le problème des enfants (children)
const AnimatedDiv = animated.div as React.FC<{
  children?: React.ReactNode;
  style: any;
}>;

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// Configuration de l'API
const API_BASE_URL = 'http://localhost:8000/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [authStep, setAuthStep] = useState('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const titleContainerRef = useRef(null);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const { isLessThan } = useDevice();
  const isLessThanWidth = isLessThan(1672);
  
  // États pour gérer le processus d'authentification
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // Timer pour le countdown avec le bon type
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Nettoyer le timer lors du démontage du composant
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Ajout d'une classe au body
  useEffect(() => {
    document.body.classList.add('login-page');
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  const transitions = useTransition(authStep, {
    from: { opacity: 0, transform: 'translate3d(100%,0,0)' },
    enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
    leave: { opacity: 0, transform: 'translate3d(-50%,0,0)' },
  });

  // Fonction pour envoyer ou renvoyer le code OTP
  const handleSendOTP = async (tokenParam = null) => {
    const tokenToUse = tokenParam || authToken;
    
    if (!tokenToUse) {
      setApiError("Aucun token d'authentification disponible.");
      return false;
    }
    
    if (!email) {
      setApiError("Email requis pour envoyer le code de vérification.");
      return false;
    }
    
    setResendDisabled(true);
    setCountdown(30);
    let timeLeft = 30;
    
    try {
      setApiError('');
      setIsLoading(true);
      
      console.log(`Envoi de la requête d'OTP à ${API_BASE_URL}/resend-otp/ avec l'email: ${email}`);
      console.log('Token utilisé:', tokenToUse);
      
      const response = await fetch(`${API_BASE_URL}/resend-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      console.log('Réponse brute de resend-otp:', data);
      
      if (!response.ok) {
        console.error('Erreur de réponse API:', data);
        setApiError(data.detail || `Erreur lors de l'envoi du code (${response.status})`);
        setResendDisabled(false);
        setIsLoading(false);
        return false;
      }
      
      console.log('Code OTP envoyé avec succès:', data);
      
      // Nettoyer l'ancien timer s'il existe
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Démarrer le compte à rebours
      timerRef.current = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        
        if (timeLeft <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          setResendDisabled(false);
        }
      }, 1000);
      
      setIsLoading(false);
      return true;
      
    } catch (error) {
      console.error('Erreur lors de la demande du code OTP:', error);
      setApiError('Erreur de connexion au serveur. Veuillez réessayer plus tard.');
      setResendDisabled(false);
      setIsLoading(false);
      return false;
    }
  };

  // Gestionnaire pour le bouton "Renvoyer le code"
  const handleResendCode = async () => {
    await handleSendOTP();
  };

  // Validation des mots de passe
  const validatePasswords = () => {
    if (password === '' || repeatPassword === '') {
      setPasswordError("Veuillez remplir tous les champs de mot de passe");
      return false;
    }
    if (password !== repeatPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Validation de l'email
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Veuillez saisir votre adresse email");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Veuillez saisir une adresse email valide");
      return false;
    }
    setEmailError('');
    return true;
  };

  // Validation du nom d'utilisateur
  const validateUsername = () => {
    if (username === '') {
      setUsernameError("Veuillez saisir votre nom d'utilisateur");
      return false;
    }
    setUsernameError('');
    return true;
  };

  // Soumission du formulaire d'authentification
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setApiError('');
  
  // Vérification des conditions d'utilisation
  if (!acceptedTerms) {
    setApiError("Veuillez accepter les conditions d'utilisation pour continuer");
    return;
  }

  // Validation des champs
  if (!validatePasswords() || !validateEmail() || !validateUsername()) {
    return;
  }

  try {
    setIsLoading(true);
    
    console.log(`Envoi de la requête d'authentification à ${API_BASE_URL}/login/`);
    
    // Appel à l'API d'authentification
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        // Ajout d'un paramètre pour indiquer que l'API doit envoyer elle-même l'OTP
        // et ne pas attendre que le frontend le fasse
        sendOtp: true
      }),
    });

    const data = await response.json();
    
    // Debug: affichage de la structure complète de la réponse
    console.log('Structure complète de la réponse:', data);
    console.log('Clés disponibles dans la réponse:', Object.keys(data));

    // Traitement de la réponse
    if (!response.ok) {
      console.error('Erreur d\'authentification:', data);
      setApiError(data.detail || `Erreur d'authentification (${response.status}). Veuillez vérifier vos identifiants.`);
      setIsLoading(false);
      return;
    }

    console.log('Authentification réussie:', data);

    // Recherche du token dans différentes structures possibles de réponse
    let token = null;

    // Nouvelle vérification pour la structure que vous recevez
    if (data.tokens) {
      // Essayez de trouver le token dans l'objet tokens
      if (data.tokens.access) token = data.tokens.access;
      else if (data.tokens.token) token = data.tokens.token;
      else if (data.tokens.accessToken) token = data.tokens.accessToken;
      else if (data.tokens.access_token) token = data.tokens.access_token;
      // Si le token est l'objet lui-même (cas rare mais possible)
      else if (typeof data.tokens === 'string') token = data.tokens;
      
      // Debug - afficher le contenu de l'objet tokens pour voir sa structure
      console.log("Contenu de l'objet tokens:", data.tokens);
      console.log("Clés dans l'objet tokens:", Object.keys(data.tokens));
    }

    // Garder les vérifications précédentes en fallback
    if (!token) {
      if (data.access) token = data.access;
      else if (data.token) token = data.token;
      else if (data.accessToken) token = data.accessToken;
      else if (data.access_token) token = data.access_token;
      else if (data.auth && data.auth.token) token = data.auth.token;
      else if (data.data && data.data.token) token = data.data.token;
    }
    
    // Si aucun token n'est trouvé dans les structures standard, parcourir les clés de premier niveau
    if (!token) {
      Object.keys(data).forEach(key => {
        // Si une clé ressemble à un token (chaîne longue), l'utiliser
        if (typeof data[key] === 'string' && data[key].length > 20) {
          console.log(`Utilisation de la clé ${key} comme token potentiel`);
          token = data[key];
        }
      });
    }
    
    if (!token) {
      console.error("Token non trouvé dans la réponse. Structure de la réponse:", data);
      setApiError("Token d'authentification non trouvé dans la réponse. Veuillez contacter le support.");
      setIsLoading(false);
      return;
    }
    
    console.log("Token trouvé:", token);
    setAuthToken(token);
    localStorage.setItem("authToken", token);
    
    // Vérifier si l'API backend indique si un OTP a été envoyé
    // Si l'API ne fournit pas cette information, supposer que oui puisque
    // nous avons demandé sendOtp: true dans la requête
    const otpAlreadySent = data.otpSent !== false;
    
    if (otpAlreadySent) {
      // L'OTP a déjà été envoyé par l'API, pas besoin de le renvoyer
      console.log("L'OTP a été envoyé automatiquement par l'API");
      
      // Si nous utilisons le resendDisabled pour éviter des tentatives trop fréquentes,
      // initialisons-le ici aussi
      setResendDisabled(true);
      setCountdown(30);
      let timeLeft = 30;
      
      // Démarrer le compte à rebours pour le bouton "Renvoyer le code"
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        
        if (timeLeft <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          setResendDisabled(false);
        }
      }, 1000);
      
      // Passer à l'étape de vérification
      setAuthStep('verify');
    } else {
      // Si pour une raison quelconque l'API n'a pas envoyé d'OTP, le faire manuellement
      const otpSent = await handleSendOTP(token);
      
      if (otpSent) {
        setAuthStep('verify');
      }
    }
  } catch (error) {
    console.error('Exception lors de l\'authentification:', error);
    setApiError('Erreur de connexion au serveur. Veuillez réessayer plus tard.');
  } finally {
    setIsLoading(false);
  }
};

  // Vérification du code OTP
  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setApiError("Veuillez saisir un code de vérification valide à 6 chiffres");
      return;
    }

    if (!authToken) {
      setApiError("Session expirée. Veuillez vous reconnecter.");
      setAuthStep('login');
      return;
    }

    try {
      setIsLoading(true);
      setApiError('');
      
      console.log(`Envoi de la requête de vérification à ${API_BASE_URL}/verify-otp/`);
      console.log('Données envoyées:', { code: otpCode, email: email });
      console.log('Token utilisé:', authToken);
      
      const response = await fetch(`${API_BASE_URL}/verify-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          code: otpCode,
          email: email
        }),
      });

      const data = await response.json();
      console.log('Réponse brute de verify-otp:', data);
      
      if (!response.ok) {
        console.error('Erreur de vérification OTP:', data);
        setApiError(data.detail || `Code de vérification invalide (${response.status})`);
        setIsLoading(false);
        return;
      }
      
      console.log('Vérification OTP réussie:', data);
      
      // Recherche du token de session dans différentes structures possibles
      let sessionToken = authToken; // Par défaut, utiliser le token existant
      
      if (data.sessionToken) sessionToken = data.sessionToken;
      else if (data.token) sessionToken = data.token;
      else if (data.access) sessionToken = data.access;
      else if (data.accessToken) sessionToken = data.accessToken;
      else if (data.access_token) sessionToken = data.access_token;
      
      // Stockage du token de session final
      localStorage.setItem('sessionToken', sessionToken);
      console.log('Token de session stocké:', sessionToken);
      
      // Extraire les informations de profil de la réponse si disponibles
      const userProfile = data.user || data.profile || {};
      
      // Déboguer les informations du profil utilisateur
      console.log('Profil utilisateur reçu:', userProfile);
      console.log('Type de rôle:', typeof userProfile.role, 'Valeur:', userProfile.role);
      
      // Récupérer le rôle et la prison de l'utilisateur
      const role = userProfile.role || '';
      // Suppression de isAdmin car non utilisé
      const prisonId = userProfile.prison_id || '';
      
      console.log('Rôle détecté:', role, 'Prison ID:', prisonId);

      // Stocker les informations importantes dans le localStorage
      localStorage.setItem('userRole', role);
      if (prisonId) {
        localStorage.setItem('userPrison', String(prisonId));
        // Si c'est la première connexion, on définit aussi la prison sélectionnée
        if (!localStorage.getItem('selectedPrison')) {
          localStorage.setItem('selectedPrison', String(prisonId));
        }
        
        // Si l'utilisateur appartient à une prison spécifique, le rediriger vers celle-ci
        console.log(`Redirection vers /${prisonId}/home pour utilisateur standard`);
        navigate(`/${prisonId}/home`, { replace: true });
      } else {
        // Modification de la redirection par défaut pour éviter /home
        console.log('Redirection par défaut');
        // On redirige vers la page de sélection de prison par défaut plutôt que /home
        navigate('/prison-selection', { replace: true });
      }
      
    } catch (error) {
      console.error('Exception lors de la vérification du code:', error);
      setApiError('Erreur de connexion au serveur. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mise à jour du code OTP
  const handleOTPChange = (value: string) => {
    setOtpCode(value);
    setApiError('');
  };


  return (
    <div className="absolute inset-0 w-full h-screen overflow-hidden bg-black">
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={() => navigate('/')}
          className="cursor-pointer p-3 rounded-full bg-black/50 transition-all duration-300 ease-in-out transform hover:bg-black/70 hover:scale-110 hover:rotate-12 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] group"
        >
          <Home className="w-6 h-6 text-white transition-transform duration-300 group-hover:-rotate-12" />
        </button>
      </div>
      <Particles
        particleColors={['#ffffff', '#ffffff']}
        particleCount={200}
        particleSpread={10}
        speed={0.1}
        particleBaseSize={100}
        moveParticlesOnHover={true}
        alphaParticles={false}
        disableRotation={false}
      />
      <div className={`absolute inset-0 flex items-center z-10 pointer-events-none ${isLessThanWidth ? 'flex-col' : ''} `}>
        {isLessThanWidth ? (
          <div className="w-full h-auto flex-col text-center items-center justify-center z-10 relative" style={{ top: '5vh' }}>
            <div ref={titleContainerRef}>
              <VariableProximity
              label="SecureSync"
              className="text-4xl md:text-5xl lg:text-7xl font-bold text-white"
              fromFontVariationSettings="'wght' 400, 'opsz' 9"
              toFontVariationSettings="'wght' 1000, 'opsz' 40"
              containerRef={titleContainerRef}
              radius={150}
              falloff='linear'
              />
            </div>
            <div>
              <p className="text-white mt-4 text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl max-w-[80%] mx-auto">L'innovation digitale au cœur de l'univers carcéral</p>
            </div>
          </div>
        ) : (
          <div className='flex w-4/5 h-full items-center justify-center relative'>
            <img className='w-auto h-[95%] rounded-2xl' src="https://www.lalibre.be/resizer/v2/BJYUKUYMC5HL7EZAHSL7B3MXFA.jpg?auth=98465b5b9263ff3b8dc1e34aadad1646214eb19c644f32c889f5a3d6f2c20fab&width=1200&height=800&quality=85&focal=3360%2C2240" alt="Prison Image" />
              <div className="absolute w-[90%] bg-black/85 rounded-xl p-8 md:p-16 text-center min-h-[300px] flex flex-col items-center" style={{ top: '45%', transform: 'translateY(-50%)' }}>
                <div ref={titleContainerRef} style={{ position: 'relative', marginBottom: '2rem md:3rem' }}>
                  <VariableProximity
                    label="SecureSync"
                    className="text-4xl md:text-8xl font-bold text-white"
                    fromFontVariationSettings="'wght' 400, 'opsz' 9"
                    toFontVariationSettings="'wght' 1000, 'opsz' 40"
                    containerRef={titleContainerRef}
                    radius={150}
                    falloff='linear'
                  />
                </div>
                <div>
                  <p className="text-white mt-4 text-lg md:text-2xl">L'innovation digitale au cœur de l'univers carcéral</p>
                </div>
              </div>
          </div>
        )}
        <div className='w-full h-full flex items-center justify-center'>
          {transitions((styles) => (
            <AnimatedDiv style={{ ...styles, position: 'absolute', width: '100%', display: 'flex', justifyContent: 'center' }}>
              {authStep === 'login' ? (
                <SpotlightCard className='w-[85%] max-w-4xl mx-auto flex flex-col justify-evenly pointer-events-auto' spotlightColor="rgba(45, 161, 51, 0.2)">
                  <motion.form 
                    className="flex flex-col gap-4 w-[80%] mx-auto" 
                    onSubmit={handleSubmit}
                    initial="hidden"
                    animate="visible"
                    variants={formVariants}
                  >
                    <SplitText
                      text="Connexion"
                      delay={150}
                      className="text-4xl md:text-6xl mb-auto mx-auto text-white"
                    />
                    <Separator className='bg-gray-400' />
                    
                    {/* Afficher les erreurs d'API s'il y en a */}
                    {apiError && (
                      <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-md">
                        {apiError}
                      </div>
                    )}
                    
                    <div>
                      <div className="mb-3 block">
                        <Label className='text-white text-base md:text-lg' htmlFor="username">Nom d'utilisateur</Label>
                      </div>
                      <TextInput 
                        className={`pointer-events-auto text-lg ${usernameError ? 'border-red-500' : ''}`}
                        id="username" 
                        type="text" 
                        icon={CgProfile} 
                        required 
                        shadow
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onBlur={validateUsername}
                        color={usernameError ? 'failure' : undefined}
                      />
                      {usernameError && (
                        <p className="text-red-500 text-sm mt-1">{usernameError}</p>
                      )}
                    </div>

                    <div>
                      <div className="mb-3 block">
                        <Label className='text-white text-base md:text-lg' htmlFor="email">Votre email</Label>
                      </div>
                      <TextInput 
                        className={`pointer-events-auto text-lg ${emailError ? 'border-red-500' : ''}`}
                        id="email" 
                        type="email" 
                        icon={HiMail} 
                        required 
                        shadow
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={validateEmail}
                        color={emailError ? 'failure' : undefined}
                      />
                      {emailError && (
                        <p className="text-red-500 text-sm mt-1">{emailError}</p>
                      )}
                    </div>
                    
                    <div>
                      <div className="mb-2 block">
                        <Label className='text-white' htmlFor="password2">Votre mot de passe</Label>
                      </div>
                      <div className="relative">
                        <TextInput 
                          className='pointer-events-auto w-full' 
                          id="password2" 
                          icon={TbLockPassword} 
                          placeholder='•••' 
                          type={showPassword ? "text" : "password"} 
                          required 
                          shadow 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1} // Empêche la navigation par tabulation sur ce bouton
                        >
                          {showPassword ? <LuEye className="pointer-events-none" size={20} /> : <LuEyeClosed className="pointer-events-none" size={20} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 block">
                        <Label className='text-white' htmlFor="repeat-password">Répéter le mot de passe</Label>
                      </div>
                      <div className="relative">
                        <TextInput 
                          className='pointer-events-auto w-full' 
                          id="repeat-password" 
                          icon={FiRepeat} 
                          placeholder='•••' 
                          type={showRepeatPassword ? "text" : "password"} 
                          required 
                          shadow 
                          value={repeatPassword}
                          onChange={(e) => setRepeatPassword(e.target.value)}
                          onBlur={validatePasswords}
                          color={passwordError ? 'failure' : undefined}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                          onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                          tabIndex={-1} // Empêche la navigation par tabulation sur ce bouton
                        >
                          {showRepeatPassword ? <LuEye className="pointer-events-none" size={20} /> : <LuEyeClosed className="pointer-events-none" size={20} />}
                        </button>
                      </div>
                      {passwordError && (
                        <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-4 w-full justify-center">
                      <div className="flex items-center gap-2 whitespace-nowrap min-w-max">
                        {acceptedTerms ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}                          <a 
                          href="#" 
                          className="text-sm text-green-400 hover:text-green-300 hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            setOpenModal(true);
                          }}
                          role="button"
                          tabIndex={0} // Assure que cet élément est tabulable
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setOpenModal(true);
                            }
                          }}
                        >
                          Conditions d'utilisation
                        </a>
                      </div>
                    </div>
                    <Modal dismissible show={openModal} onClose={() => setOpenModal(false)}>
                      <ModalHeader>Conditions d'utilisation</ModalHeader>
                      <ModalBody>
                        <div className="space-y-6">
                          <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            En utilisant l'application SecureSync de gestion intelligente de prison, vous acceptez les conditions suivantes :
                          </p>
                          <ul className="list-disc pl-6 space-y-2 text-gray-500 dark:text-gray-400">
                            <li>L'application est réservée au personnel autorisé des établissements pénitentiaires.</li>
                            <li>Chaque utilisateur est responsable de la confidentialité de ses identifiants.</li>
                            <li>L'utilisation des données doit respecter le RGPD et les lois sur la protection des données.</li>
                            <li>Les données des détenus sont strictement confidentielles.</li>
                            <li>Nous vous informerons immédiatement de toute violation de données conformément au RGPD.</li>
                            <li>L'application est fournie "telle quelle" sans garantie d'absence d'erreurs.</li>
                            <li>Des mises à jour seront effectuées régulièrement pour améliorer la sécurité.</li>
                            <li>L'accès peut être révoqué en cas de non-respect de ces conditions.</li>
                          </ul>
                          <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 mt-4">
                            Pour toute question, contactez <a href="mailto:email@securesync.com" className="text-green-500 hover:text-green-600">email@securesync.com</a>
                            <br />
                            En date du : {new Date().toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </ModalBody>
                      <ModalFooter>
                        <Button className='bg-green-600 hover:bg-green-700 text-black font-semibold cursor-pointer' onClick={() => {
                          setAcceptedTerms(true);
                          setOpenModal(false);
                        }}>J'accepte</Button>
                        <Button className='cursor-pointer border-green-500 hover:bg-green-900/30 hover:text-white' variant="outline" onClick={() => {
                          setAcceptedTerms(false);
                          setOpenModal(false);
                        }}>
                          Je refuse
                        </Button>
                      </ModalFooter>
                    </Modal>
                    <Button 
                      className={`bg-green-600 hover:bg-green-700 text-white font-semibold cursor-pointer pointer-events-auto ${(!acceptedTerms || !username|| !password || !repeatPassword || !email || isLoading) ? 'opacity-50' : ''}`} 
                      type="submit" 
                      disabled={!acceptedTerms || !username || !password || !repeatPassword || !email || isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Chargement...
                        </span>
                      ) : (
                        <>
                          <MdOutlineLogin className="mr-2" /> Se connecter
                        </>
                      )}
                    </Button>
                  </motion.form>
                </SpotlightCard>
              ) : (
                <SpotlightCard className='w-[85%] max-w-4xl mx-auto flex flex-col justify-evenly pointer-events-auto' spotlightColor="rgba(45, 161, 51, 0.2)">
                  <motion.form 
                    className="flex flex-col gap-4 w-[80%] mx-auto" 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (otpCode.length === 6 && !isLoading) {
                        handleVerifyOTP();
                      }
                    }}
                    initial="hidden"
                    animate="visible"
                    variants={formVariants}
                  >
                    <SplitText
                      text="Vérification"
                      delay={150}
                      className="text-4xl md:text-6xl mb-auto mx-auto text-white"
                    />
                    <Separator className='bg-gray-400' />
                    
                    {/* Afficher les erreurs d'API s'il y en a */}
                    {apiError && (
                      <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-md">
                        {apiError}
                      </div>
                    )}
                    
                    <div className="text-center text-white text-base md:text-lg mb-4">
                      Un code de vérification a été envoyé à <span className='font-bold'>{email}</span>
                    </div>
                    <div className="flex justify-center w-full">
                      <InputOTP 
                        maxLength={6} 
                        className="gap-2"
                        value={otpCode}
                        onChange={handleOTPChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && otpCode.length === 6 && !isLoading) {
                            e.preventDefault();
                            handleVerifyOTP();
                          }
                        }}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                      <button 
                        className={`text-green-400 text-sm ${resendDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:underline hover:text-green-300'}`}
                        onClick={handleResendCode}
                        disabled={resendDisabled}
                      >
                        {resendDisabled ? `Veuillez patienter avant de réessayer (${countdown}s)` : 'Renvoyer le code'}
                      </button>                    <Button 
                      className={`bg-green-600 hover:bg-green-700 text-black font-semibold cursor-pointer pointer-events-auto ${(otpCode.length !== 6 || isLoading) ? 'opacity-50' : ''}`}
                      onClick={handleVerifyOTP}
                      disabled={otpCode.length !== 6 || isLoading}
                      type="submit"
                    >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Chargement...
                          </span>
                        ) : (
                          <>
                            <ArrowRight className="mr-2 text-white" /> <p className='text-white'>Vérifier</p>
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.form>
                </SpotlightCard>
              )}
            </AnimatedDiv>
          ))}
        </div>
      </div>
    </div>
  );
}