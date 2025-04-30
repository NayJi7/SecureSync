import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Squares from '../blocks/Backgrounds/Squares/squares.tsx';
import { useDevice } from '@/hooks/use-device';
import { motion } from 'framer-motion';

export default function NotFoundPage() {

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Composant Squares qui couvre l'ensemble de l'écran en arrière-plan */}
      <div className="absolute inset-0 z-0">
        <Squares
          speed={0.2}
          squareSize={60}
          direction='diagonal'
          borderColor='#fff'
          hoverFillColor='#222'
        />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-auto">
        <div className="relative z-10 flex flex-col min-h-screen pointer-events-auto">
          <main className="flex-grow container mx-auto px-4 flex items-center justify-center">
            <div className="max-w-3xl mx-auto backdrop-blur-md bg-black/40 p-8 sm:p-12 rounded-lg border border-green-900/30 shadow-2xl shadow-green-900/10 z-20 relative">
              <div className="text-center">
                <motion.div
                  className="text-green-500 mx-auto mb-6 w-24 h-24 flex items-center justify-center rounded-full bg-green-900/20"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  <AlertTriangle className="w-12 h-12" />
                </motion.div>

                <motion.h1
                  className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 text-white relative"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="absolute left-0 sm:left-0 top-0 -mt-2 w-1 h-10 sm:h-20 bg-gradient-to-b from-green-400 to-green-700 rounded-full"></div>
                  404
                </motion.h1>

                <motion.h2
                  className="text-xl sm:text-2xl md:text-3xl font-semibold mb-6 text-green-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  Page non trouvée
                </motion.h2>

                <motion.p
                  className="text-lg text-gray-300 mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  La page que vous recherchez semble introuvable. Elle a peut-être été déplacée, supprimée, ou n'a jamais existé.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <Link to="/">
                    <Button
                      size="lg"
                      className="bg-gradient-to-br from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white border-none shadow-lg shadow-green-900/20 transition-all duration-300 hover:shadow-green-900/40 hover:scale-105"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour à l'accueil
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  className="mt-10 pt-8 border-t border-green-900/30 text-gray-400 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  <p>
                    Si vous pensez qu'il s'agit d'une erreur, veuillez {" "}
                    <Link to="/contact" className="text-green-400 hover:text-green-300 transition-colors">
                      contacter le support
                    </Link>
                  </p>
                </motion.div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Add a style tag for custom drop shadow and full-page background */}
      <style>
        {`
          .drop-shadow-glow {
            filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.2));
          }
        `}
      </style>
    </div>
  );
}
