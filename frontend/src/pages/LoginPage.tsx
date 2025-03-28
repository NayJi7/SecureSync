import { useEffect } from 'react';
import Particles from '../blocks/Backgrounds/Particles/Particles.tsx';
import SpotlightCard from '../blocks/Components/SpotlightCard/SpotlightCard.tsx';
import { Checkbox, Label, TextInput } from "flowbite-react";
import { MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlurText from "../blocks/TextAnimations/BlurText/BlurText.tsx";
import { Separator } from "@/components/ui/separator"
import { HiMail } from "react-icons/hi";
import { TbLockPassword } from "react-icons/tb";
import { FiRepeat } from "react-icons/fi";
import { useIsMobile } from '@/hooks/use-mobile';

const handleAnimationComplete = () => {
  console.log('Animation completed!');
};

export default function LoginPage() {
  const isMobile = useIsMobile();

  useEffect(() => {
    // Ajouter la classe login-page au body lors du montage du composant
    document.body.classList.add('login-page');
    
    // La retirer lors du démontage du composant
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  return (
    // particles background 
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
        {/* Image - affichée uniquement sur les écrans non-mobiles */}
        {!isMobile && (
          <div className='w-4/5 h-full items-center justify-center flex'>
            <img className='w-auto h-11/12 rounded-2xl' src="https://www.lalibre.be/resizer/v2/BJYUKUYMC5HL7EZAHSL7B3MXFA.jpg?auth=98465b5b9263ff3b8dc1e34aadad1646214eb19c644f32c889f5a3d6f2c20fab&width=1200&height=800&quality=85&focal=3360%2C2240" alt="Prison Image" />
          </div>
        )}
        {/* Login form */}
        <div className='w-full h-full flex items-center justify-center'>
        <SpotlightCard className={`${isMobile ? 'w-[90%]' : 'w-[70%]'} max-w-4xl mx-auto flex flex-col md:flex-row justify-evenly pointer-events-auto`} spotlightColor="rgba(0, 229, 255, 0.2)">
            <form className="flex flex-col gap-4 pointer-events-none ">
              <BlurText
                text="Log In"
                delay={150}
                animateBy="words"
                direction="top"
                onAnimationComplete={handleAnimationComplete}
                className="text-5xl mb-auto mx-auto text-white"
              />
              <Separator className='bg-gray-400' />
              <div>
                <div className="mb-2 block">
                  <Label className='text-white' htmlFor="password2">Your email</Label>
                </div>
                <TextInput className='pointer-events-auto' id="email2" type="email" icon={HiMail} placeholder="name@gmail.com" required shadow />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label className='text-white' htmlFor="password2">Your password</Label>
                </div>
                <TextInput className='pointer-events-auto' id="password2" icon={TbLockPassword} type="password" required shadow />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label className='text-white' htmlFor="repeat-password">Repeat password</Label>
                </div>
                <TextInput className='pointer-events-auto' id="repeat-password" icon={FiRepeat} type="password" required shadow />
              </div>
              <div className="flex items-center gap-2 pt-4">
                <Checkbox className='pointer-events-auto' id="agree" />
                <Label  htmlFor="agree" className="flex text-white">
                  I agree with the&nbsp;
                  <a href="#" className="text-cyan-600 hover:text-cyan-400 dark:text-cyan-500 pointer-events-auto">
                    terms and conditions
                  </a>
                </Label>
              </div>
              <Button className='bg-black hover:bg-gray-900 cursor-pointer pointer-events-auto' type="submit">
                <MailOpen className="mr-2" /> Log In
              </Button>
            </form>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
