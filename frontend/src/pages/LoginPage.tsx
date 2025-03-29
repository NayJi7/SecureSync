import { useEffect, useState } from 'react';
import Particles from '../blocks/Backgrounds/Particles/Particles.tsx';
import SpotlightCard from '../blocks/Components/SpotlightCard/SpotlightCard.tsx';
import { Label, TextInput } from "flowbite-react";
import { MailOpen, ArrowRight, KeyRound, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SplitText from "../blocks/TextAnimations/SplitText/SplitText.tsx";
import { Separator } from "@/components/ui/separator";
import { HiMail } from "react-icons/hi";
import { TbLockPassword } from "react-icons/tb";
import { FiRepeat } from "react-icons/fi";
import { useIsMobile } from '@/hooks/use-mobile';
import { animated, useTransition, AnimatedProps } from '@react-spring/web';
import { Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";
import { motion } from 'framer-motion';

const AnimatedDiv = animated.div as React.FC<AnimatedProps<React.HTMLAttributes<HTMLDivElement>>>;

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function LoginPage() {
  const isMobile = useIsMobile();
  const [authStep, setAuthStep] = useState('login');
  const [email, setEmail] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthStep('verify');
  };

  return (
    <div className="absolute inset-0 w-full h-screen overflow-hidden bg-black">
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
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className='hidden xl:flex w-4/5 h-full items-center justify-center'>
          <img className='w-auto h-11/12 rounded-2xl' src="https://www.lalibre.be/resizer/v2/BJYUKUYMC5HL7EZAHSL7B3MXFA.jpg?auth=98465b5b9263ff3b8dc1e34aadad1646214eb19c644f32c889f5a3d6f2c20fab&width=1200&height=800&quality=85&focal=3360%2C2240" alt="Prison Image" />
        </div>
        <div className='w-full h-full flex items-center justify-center'>
          {transitions((styles) => (
            <AnimatedDiv style={{ ...styles, position: 'absolute', width: '100%', display: 'flex', justifyContent: 'center' }}>
              {authStep === 'login' ? (
                <SpotlightCard className={`${isMobile ? 'w-[90%]' : 'w-[70%]'} max-w-4xl mx-auto flex flex-col md:flex-row justify-evenly pointer-events-auto`} spotlightColor="rgba(0, 229, 255, 0.2)">
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
                      className="text-5xl mb-auto mx-auto text-white"
                    />
                    <Separator className='bg-gray-400' />
                    <div>
                      <div className="mb-2 block">
                        <Label className='text-white' htmlFor="email2">Votre email</Label>
                      </div>
                      <TextInput 
                        className='pointer-events-auto' 
                        id="email2" 
                        type="email" 
                        icon={HiMail} 
                        placeholder="nom@gmail.com" 
                        required 
                        shadow
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <div className="mb-2 block">
                        <Label className='text-white' htmlFor="password2">Votre mot de passe</Label>
                      </div>
                      <TextInput className='pointer-events-auto' id="password2" icon={TbLockPassword} placeholder='•••' type="password" required shadow />
                    </div>
                    <div>
                      <div className="mb-2 block">
                        <Label className='text-white' htmlFor="repeat-password">Répéter le mot de passe</Label>
                      </div>
                      <TextInput className='pointer-events-auto' id="repeat-password" icon={FiRepeat} placeholder='•••' type="password" required shadow />
                    </div>
                    <div className="flex items-center gap-2 pt-4 w-full justify-center">
                      <div className="flex items-center gap-2">
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
                            À moins d'un mois de l'entrée en vigueur des nouvelles lois sur la protection de la vie privée des consommateurs 
                            de l'Union européenne, les entreprises du monde entier mettent à jour leurs accords de conditions d'utilisation.
                          </p>
                          <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            Le Règlement Général sur la Protection des Données (RGPD) de l'Union européenne entre en vigueur le 25 mai et 
                            vise à garantir un ensemble commun de droits en matière de données dans l'Union européenne. Il oblige les 
                            organisations à informer les utilisateurs dès que possible des violations de données à haut risque qui 
                            pourraient les affecter personnellement.
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
                    <Button className='bg-black hover:bg-gray-900 cursor-pointer pointer-events-auto' type="submit">
                      <MailOpen className="mr-2" /> Se connecter
                    </Button>
                  </motion.form>
                </SpotlightCard>
              ) : (
                <SpotlightCard className={`${isMobile ? 'w-[90%]' : 'w-[70%]'} max-w-4xl mx-auto flex flex-col justify-evenly pointer-events-auto`} spotlightColor="rgba(0, 229, 255, 0.2)">
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
                      className="text-5xl mb-auto mx-auto text-white"
                    />
                    <Separator className='bg-gray-400' />
                    <div className="text-center text-white mb-4">
                      Un code de vérification a été envoyé à {email}
                    </div>
                    <div>
                      <div className="mb-2 block">
                        <Label className='text-white' htmlFor="verificationCode">Code de vérification</Label>
                      </div>
                      <TextInput 
                        className='pointer-events-auto' 
                        id="verificationCode" 
                        type="text" 
                        icon={KeyRound}
                        placeholder="Entrez le code à 6 chiffres" 
                        required 
                        shadow 
                      />
                    </div>
                    <Button className='bg-black hover:bg-gray-900 cursor-pointer pointer-events-auto mt-4' type="submit">
                      <ArrowRight className="mr-2" /> Vérifier
                    </Button>
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
