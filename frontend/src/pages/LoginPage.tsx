// React et hooks
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevice } from "@/hooks/use-device";
import { motion, AnimatePresence } from 'framer-motion';

// Composants locaux
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Separator } from "@/components/ui/separator";
import Squares from '../blocks/Backgrounds/Squares/squares';
import SpotlightCard from '../blocks/Components/SpotlightCard/SpotlightCard';

// Icônes
import { Home, ArrowRight, Check, X } from 'lucide-react';
import { MdOutlineLogin } from "react-icons/md";
import { LuEyeClosed, LuEye } from "react-icons/lu";

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const inputVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 }
  }
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
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const { isLessThan, isMobile } = useDevice();

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

  // Soumission du formulaire d'authentification
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError('');

    // Clear previous errors
    setPasswordError('');
    setUsernameError('');
    setEmailError('');

    // Vérification des conditions d'utilisation
    if (!acceptedTerms) {
      setApiError("Veuillez accepter les conditions d'utilisation pour continuer");
      return;
    }

    // Perform all validations at once
    let isValid = true;

    // Validate username
    if (username === '') {
      setUsernameError("Veuillez saisir votre nom d'utilisateur");
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Veuillez saisir votre adresse email");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Veuillez saisir une adresse email valide");
      isValid = false;
    }

    // Validate passwords
    if (password === '' || repeatPassword === '') {
      setPasswordError("Veuillez remplir tous les champs de mot de passe");
      isValid = false;
    } else if (password !== repeatPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      isValid = false;
    }

    // Stop if any validation failed
    if (!isValid) {
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
    <div className="relative w-full min-h-screen overflow-y-auto bg-black flex items-center justify-center">
      {/* Main content container with fixed padding */}
      <div className="w-full py-8 sm:py-12 md:py-16 px-2 sm:px-4 flex flex-col md:flex-row items-center justify-center">
        {/* Squares Background Section */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Squares
            speed={0.3}
            squareSize={isLessThan(640) ? 30 : 50}
            direction='diagonal' // up, down, left, right, diagonal
          />
        </div>

        {/* Title and Subtitle Section */}
        <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-4 sm:p-8 md:p-12 order-1 z-10 my-4 md:my-0">
          <div className="max-w-xl relative">
            {/* Decorative element */}
            <div className="absolute -left-2 sm:-left-6 top-0 sm:top-0 -mt-2 sm:-mt-0 w-1 h-10 sm:h-20 bg-gradient-to-b from-green-400 to-green-700 rounded-full"></div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="px-2 sm:px-0"
            >
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.2,
                  ease: [0.25, 0.1, 0.25, 1.0]
                }}
                className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4 sm:mb-6"
              >
                <span className="inline-block mb-1 sm:mb-2">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-green-300">SecureSync</span>
                </span>
                <br />
                <span className="inline-block text-xl sm:text-2xl md:text-5xl lg:text-6xl text-neutral-200 font-semibold mt-1">
                  Gestion Pénitentiaire
                </span>
              </motion.h1>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '40%' }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="h-1 bg-gradient-to-r from-green-500 to-green-900 rounded-full mb-2 sm:mb-8"
              />

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 1.0,
                  ease: "easeOut"
                }}
                className="text-sm sm:text-base md:text-xl text-neutral-300 leading-relaxed max-w-lg sm:block hidden"
              >
                <span className="text-green-300 font-medium">Contrôle complet</span> et surveillance des établissements pénitentiaires avec protocoles de sécurité renforcés.
                <br className="hidden sm:block" /><br className="hidden sm:block" />
                <span className="opacity-90">Une solution moderne pour une gestion efficace et sécurisée.</span>
              </motion.p>
            </motion.div>
          </div>
        </div>

        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-50">
          <motion.button
            onClick={() => navigate('/')}
            className="cursor-pointer p-2 sm:p-3 rounded-full bg-black/50 transition-all duration-300 ease-in-out transform hover:bg-black/70 hover:scale-110 hover:rotate-12 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] group"
            whileHover={{ scale: 1.1, rotate: 12 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-transform duration-300 group-hover:-rotate-12" />
          </motion.button>
        </div>

        {/* Login Form Section - Further optimized for mobile */}
        <div className="relative w-full md:w-1/2 lg:w-3/5 h-full flex items-center justify-center z-40 order-2 my-4 sm:my-6 md:my-0">
          <div className="relative h-full flex items-center justify-center w-full">
            <div className="w-full max-w-2xl mx-2 sm:mx-8">
              <AnimatePresence mode="wait">
                {authStep === 'login' ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="w-full"
                  >
                    <SpotlightCard
                      className="w-full bg-black/40 border border-green-900/30 shadow-[0_0_30px_rgba(45,161,51,0.1)]"
                      spotlightColor="rgba(45, 161, 51, 0.2)"
                    >
                      <motion.form
                        className="flex flex-col gap-3 sm:gap-6 w-[90%] mx-auto py-4 sm:py-8"
                        onSubmit={handleSubmit}
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <div className="text-center space-y-1 sm:space-y-2">
                          <h2 className="text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 text-white/85 font-bold">
                            Connexion
                          </h2>
                        </div>

                        <Separator className="bg-green-900/50" />

                        {apiError && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-md"
                          >
                            {apiError}
                          </motion.div>
                        )}

                        <motion.div variants={inputVariants}>
                          <div className="relative z-0 w-full mb-2 group">
                            <input
                              type="text"
                              id="username"
                              className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-green-900/50 appearance-none text-white dark:border-green-600 focus:border-green-500 focus:outline-none focus:ring-0 peer"
                              placeholder=" "
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              required
                            />
                            <label
                              htmlFor="username"
                              className="peer-focus:font-medium absolute text-sm text-white/80 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-green-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                            >
                              Nom d'utilisateur
                            </label>
                            {usernameError && (
                              <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm mt-1"
                              >
                                {usernameError}
                              </motion.p>
                            )}
                          </div>
                        </motion.div>

                        <motion.div variants={inputVariants}>
                          <div className="relative z-0 w-full mb-2 group">
                            <input
                              type="email"
                              id="email"
                              className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-green-900/50 appearance-none text-white dark:border-green-600 focus:border-green-500 focus:outline-none focus:ring-0 peer"
                              placeholder=" "
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                            <label
                              htmlFor="email"
                              className="peer-focus:font-medium absolute text-sm text-white/80 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-green-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                            >
                              Votre email
                            </label>
                            {emailError && (
                              <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm mt-1"
                              >
                                {emailError}
                              </motion.p>
                            )}
                          </div>
                        </motion.div>

                        <motion.div variants={inputVariants}>
                          <div className="relative z-0 w-full mb-2 group">
                            <input
                              type={showPassword ? "text" : "password"}
                              id="password2"
                              className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-green-900/50 appearance-none text-white dark:border-green-600 focus:border-green-500 focus:outline-none focus:ring-0 peer"
                              placeholder=" "
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                            />
                            <label
                              htmlFor="password2"
                              className="peer-focus:font-medium absolute text-sm text-white/80 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-green-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                            >
                              Votre mot de passe
                            </label>
                            <motion.button
                              type="button"
                              className="absolute right-0 top-2 text-gray-400 hover:text-gray-100 cursor-pointer transition-colors duration-300"
                              onClick={() => setShowPassword(!showPassword)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              tabIndex={-1}
                            >
                              {showPassword ? <LuEye className="pointer-events-none" size={18} /> : <LuEyeClosed className="pointer-events-none" size={18} />}
                            </motion.button>
                          </div>
                        </motion.div>

                        <motion.div variants={inputVariants}>
                          <div className="relative z-0 w-full mb-2 group">
                            <input
                              type={showRepeatPassword ? "text" : "password"}
                              id="repeat-password"
                              className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-green-900/50 appearance-none text-white dark:border-green-600 focus:border-green-500 focus:outline-none focus:ring-0 peer"
                              placeholder=" "
                              value={repeatPassword}
                              onChange={(e) => setRepeatPassword(e.target.value)}
                              required
                            />
                            <label
                              htmlFor="repeat-password"
                              className="peer-focus:font-medium absolute text-sm text-white/80 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-green-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                            >
                              Répéter le mot de passe
                            </label>
                            <motion.button
                              type="button"
                              className="absolute right-0 top-2 text-gray-400 hover:text-gray-100 cursor-pointer transition-colors duration-300"
                              onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              tabIndex={-1}
                            >
                              {showRepeatPassword ? <LuEye className="pointer-events-none" size={18} /> : <LuEyeClosed className="pointer-events-none" size={18} />}
                            </motion.button>
                            {passwordError && (
                              <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm mt-1"
                              >
                                {passwordError}
                              </motion.p>
                            )}
                          </div>
                        </motion.div>

                        <motion.div variants={inputVariants} className="flex items-center gap-2 pt-4 w-full justify-center">
                          <div className="flex items-center gap-2 whitespace-nowrap min-w-max">
                            {acceptedTerms && (
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Check className="w-4 h-4 text-green-500" />
                              </motion.div>
                            )}
                            <motion.button
                              type="button"
                              className="text-sm text-green-400 hover:text-green-300 hover:underline transition-colors duration-300"
                              onClick={() => setOpenModal(true)}
                              whileHover={{ scale: 1.05 }}
                            >
                              Conditions d'utilisation
                            </motion.button>
                          </div>
                        </motion.div>

                        <motion.div variants={inputVariants}>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold cursor-pointer transition-all duration-300 ${(!acceptedTerms || !username || !password || !repeatPassword || !email || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              type="submit"
                              disabled={!acceptedTerms || !username || !password || !repeatPassword || !email || isLoading}
                            >
                              {isLoading ? (
                                <div className="flex items-center justify-center">
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  <span>Chargement...</span>
                                </div>
                              ) : (
                                <span className="flex items-center justify-center">
                                  <MdOutlineLogin className="mr-2" /> Se connecter
                                </span>
                              )}
                            </Button>
                          </motion.div>
                        </motion.div>
                      </motion.form>
                    </SpotlightCard>
                  </motion.div>
                ) : (
                  <motion.div
                    key="verify"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="w-full"
                  >
                    <SpotlightCard
                      className="w-full bg-black/40 border border-green-900/30 shadow-[0_0_30px_rgba(45,161,51,0.1)]"
                      spotlightColor="rgba(45, 161, 51, 0.2)"
                    >
                      <motion.form
                        className="flex flex-col gap-6 w-[90%] mx-auto py-8"
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
                        <div className="text-center space-y-1 sm:space-y-2">
                          <h2 className="text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 text-white/85 font-bold">
                            Vérification
                          </h2>
                        </div>

                        <Separator className="bg-green-900/50" />

                        {apiError && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-md"
                          >
                            {apiError}
                          </motion.div>
                        )}

                        <motion.div variants={inputVariants}>
                          <div className="text-center text-white text-base md:text-lg mb-4 px-2">
                            Un code de vérification a été envoyé à <span className='font-bold break-all'>{email}</span>
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
                        </motion.div>

                        <motion.div className="flex flex-col items-center gap-4 px-4 sm:px-0">
                          <button
                            className={`text-green-400 text-sm text-center ${resendDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:underline hover:text-green-300'}`}
                            onClick={handleResendCode}
                            disabled={resendDisabled}
                          >
                            {resendDisabled ? `Veuillez patienter (${countdown}s)` : 'Renvoyer le code'}
                          </button>
                          <Button
                            className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold cursor-pointer transition-all duration-300 h-12 sm:h-auto ${(otpCode.length !== 6 || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleVerifyOTP}
                            disabled={otpCode.length !== 6 || isLoading}
                            type="submit"
                          >
                            {isLoading ? (
                              <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                <span>Chargement...</span>
                              </div>
                            ) : (
                              <span className="flex items-center justify-center">
                                <ArrowRight className="mr-2 text-white" /> <p className='text-white'>Vérifier</p>
                              </span>
                            )}
                          </Button>
                        </motion.div>
                      </motion.form>
                    </SpotlightCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        {openModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenModal(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 overflow-y-auto"
            style={{ pointerEvents: 'auto' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", bounce: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl relative z-[110] mx-2 sm:mx-0"
            >
              <SpotlightCard
                className="w-full bg-black/40 border border-green-900/30 shadow-[0_0_30px_rgba(45,161,51,0.1)]"
                spotlightColor={isMobile ? "rgba(45, 161, 51, 0.1)" : "rgba(45, 161, 51, 0.2)"}
              >
                <div className="flex flex-col w-full">
                  {/* Header */}
                  <div className="flex items-start justify-between px-3 sm:px-5 pt-3 sm:pt-5 border-b border-green-900/30">
                    <h3 className="text-lg sm:text-xl font-semibold text-white/70 mb-2">Conditions d'utilisation</h3>
                    <button
                      className="text-gray-400 hover:text-white"
                      onClick={() => setOpenModal(false)}
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-3 sm:p-6 space-y-3 sm:space-y-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-3 sm:space-y-6">
                      <p className="text-sm sm:text-base leading-relaxed text-gray-300">
                        En utilisant l'application SecureSync de gestion intelligente de prison, vous acceptez les conditions suivantes :
                      </p>
                      <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-sm sm:text-base text-gray-300">
                        <li>L'application est réservée au personnel autorisé des établissements pénitentiaires.</li>
                        <li>Chaque utilisateur est responsable de la confidentialité de ses identifiants.</li>
                        <li>L'utilisation des données doit respecter le RGPD et les lois sur la protection des données.</li>
                        <li>Les données des détenus sont strictement confidentielles.</li>
                        <li>Nous vous informerons immédiatement de toute violation de données conformément au RGPD.</li>
                        <li>L'application est fournie "telle quelle" sans garantie d'absence d'erreurs.</li>
                        <li>Des mises à jour seront effectuées régulièrement pour améliorer la sécurité.</li>
                        <li>L'accès peut être révoqué en cas de non-respect de ces conditions.</li>
                      </ul>
                      <p className="text-sm sm:text-base leading-relaxed text-gray-300 mt-3 sm:mt-4">
                        Pour toute question, contactez <a href="mailto:securesynccytech@gmail.com" className="text-green-500 hover:text-green-400 transition-colors duration-300">securesynccytech@gmail.com</a>
                        <br />
                        En date du : {new Date().toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-0 sm:space-x-2 px-3 sm:px-5 py-3 sm:py-4 border-t border-green-900/30">
                    <Button
                      className='w-full sm:w-auto bg-green-900/60 hover:bg-green-900/80 text-white font-semibold cursor-pointer border border-green-500/50'
                      onClick={() => {
                        setAcceptedTerms(true);
                        setOpenModal(false);
                      }}
                    >
                      J'accepte
                    </Button>
                    <Button
                      className='w-full sm:w-auto bg-black/40 border border-white/70 text-white hover:bg-white/80 hover:border-white hover:text-black cursor-pointer'
                      variant="outline"
                      onClick={() => {
                        setAcceptedTerms(false);
                        setOpenModal(false);
                      }}
                    >
                      Je refuse
                    </Button>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}