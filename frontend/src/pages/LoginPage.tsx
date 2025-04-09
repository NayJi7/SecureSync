// React et hooks
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevice } from "@/hooks/use-device";

// Librairies externes
import { animated, useTransition, AnimatedProps } from '@react-spring/web';
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

const AnimatedDiv = animated.div as React.FC<AnimatedProps<React.HTMLAttributes<HTMLDivElement>>>;

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

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
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const { isLessThan } = useDevice();
  const isLessThanWidth = isLessThan(1672);
  
  // Nouvel état pour gérer les erreurs d'API
  const [apiError, setApiError] = useState('');
  // État pour suivre le chargement
  const [isLoading, setIsLoading] = useState(false);
  // État pour stocker le token d'authentification
  const [authToken, setAuthToken] = useState('');
  // État pour stocker le code OTP
  const [otpCode, setOtpCode] = useState('');

  const handleResendCode = async () => {
    setResendDisabled(true);
    let timeLeft = 10;
    
    try {
      setApiError('');
      setIsLoading(true);
      
      // Appel API pour demander un nouveau code de vérification
      const response = await fetch('http://localhost:8000/api/resend-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          email: email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setApiError(errorData.detail || 'Erreur lors de l\'envoi du nouveau code');
        return;
      }
      
      // Timer pour le compte à rebours
      const timer = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        
        if (timeLeft === 0) {
          clearInterval(timer);
          setResendDisabled(false);
        }
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de la demande d\'un nouveau code:', error);
      setApiError('Erreur de connexion au serveur. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  const transitions = useTransition(authStep, {
    from: { opacity: 0, transform: 'translate3d(100%,0,0)' },
    enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
    leave: { opacity: 0, transform: 'translate3d(-50%,0,0)' },
  });

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);


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

  const validateUsername = () => {
    if (username === '') {
      setUsernameError("Veuillez saisir votre nom d'utilisateur");
      return false;
    }
    setUsernameError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    

    if (!acceptedTerms) {
      alert("Veuillez accepter les conditions d'utilisation pour continuer");
      return;
    }

    if (!validatePasswords() || !validateEmail() || !validateUsername()) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Appel à l'API d'authentification
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setApiError(data.detail || 'Erreur d\'authentification. Veuillez vérifier vos identifiants.');
        setIsLoading(false);
        return;
      }

      setAuthToken(data.access || data.token);
      
      // Passer à l'étape de vérification et initier l'envoi du code OTP par email
      setAuthStep('verify');
      handleResendCode();
      
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
      setApiError('Erreur de connexion au serveur. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      alert("Veuillez saisir un code de vérification valide à 6 chiffres");
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('http://localhost:8000/api/verify-otp/', {
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

      if (!response.ok) {
        const errorData = await response.json();
        setApiError(errorData.detail || 'Code de vérification invalide');
        setIsLoading(false);
        return;
      }
      
      // Si le code est valide, on récupère le token de session final et on redirige
      const data = await response.json();
      localStorage.setItem('sessionToken', data.sessionToken || data.token);
      
      // Redirection vers la page d'accueil après vérification réussie
      navigate('/home');
      
    } catch (error) {
      console.error('Erreur lors de la vérification du code:', error);
      setApiError('Erreur de connexion au serveur. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

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
                <SpotlightCard className='w-[85%] max-w-4xl mx-auto flex flex-col justify-evenly pointer-events-auto' spotlightColor="rgba(0, 229, 255, 0.2)">
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
                        )}
                        <a 
                          href="#" 
                          className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            setOpenModal(true);
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
                            Pour toute question, contactez <a href="mailto:email@securesync.com" className="text-blue-500 hover:text-blue-600">email@securesync.com</a>
                            <br />
                            En date du : {new Date().toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </ModalBody>
                      <ModalFooter>
                        <Button className='cursor-pointer' onClick={() => {
                          setAcceptedTerms(true);
                          setOpenModal(false);
                        }}>J'accepte</Button>
                        <Button className='cursor-pointer' color="gray" onClick={() => {
                          setAcceptedTerms(false);
                          setOpenModal(false);
                        }}>
                          Je refuse
                        </Button>
                      </ModalFooter>
                    </Modal>
                    <Button 
                      className={`bg-black hover:bg-gray-900 cursor-pointer pointer-events-auto ${(!acceptedTerms || !username|| !password || !repeatPassword || !email || isLoading) ? 'opacity-50' : ''}`} 
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
                <SpotlightCard className='w-[85%] max-w-4xl mx-auto flex flex-col justify-evenly pointer-events-auto' spotlightColor="rgba(0, 229, 255, 0.2)">
                  <motion.form 
                    className="flex flex-col gap-4 w-[80%] mx-auto" 
                    onSubmit={(e) => e.preventDefault()}
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
                        className={`text-blue-400 text-sm ${resendDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:underline hover:text-blue-300'}`}
                        onClick={handleResendCode}
                        disabled={resendDisabled}
                      >
                        {resendDisabled ? `Veuillez patienter avant de réessayer (${countdown}s)` : 'Renvoyer le code'}
                      </button>
                      <Button 
                        className={`bg-black hover:bg-gray-900 cursor-pointer pointer-events-auto ${(otpCode.length !== 6 || isLoading) ? 'opacity-50' : ''}`}
                        onClick={handleVerifyOTP}
                        disabled={otpCode.length !== 6 || isLoading}
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
                            <ArrowRight className="mr-2" /> Vérifier
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