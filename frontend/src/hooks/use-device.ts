import * as React from "react"

const MOBILE_BREAKPOINT = 640 // Smartphones
const TABLET_BREAKPOINT = 1024 // Tablettes

export function useDevice() {
  const [windowWidth, setWindowWidth] = React.useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  )
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setWindowWidth(width)
      setIsMobile(width < MOBILE_BREAKPOINT)
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
    }

    // Vérifier à l'initialisation
    checkDevice()

    // Ajouter un écouteur d'événement pour le redimensionnement de la fenêtre
    window.addEventListener("resize", checkDevice)

    // Nettoyer l'écouteur d'événement lors du démontage
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  const isLessThan = React.useCallback((minWidth: number) => {
    return windowWidth < minWidth
  }, [windowWidth])

  return { 
    isMobile: !!isMobile, 
    isTablet: !!isTablet,
    isDesktop: !isMobile && !isTablet,
    windowWidth,
    isLessThan
  }
}