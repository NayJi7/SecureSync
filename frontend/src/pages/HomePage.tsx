// React et hooks
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

// Composants locaux
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TabItem, Tabs } from "flowbite-react"

// Icônes
import { HiAdjustments, HiClipboardList } from "react-icons/hi"
import { MdDashboard } from "react-icons/md"


export default function HomePage({ children }: { children?: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Ajouter la classe home-page au body lors du montage du composant
    document.body.classList.add('home-page');
    
    // La retirer lors du démontage du composant
    return () => {
      document.body.classList.remove('home-page');
    };
  }, []);

  const handleLogout = () => {
    // Ici vous pourriez ajouter du code pour supprimer le token d'authentification
    // localStorage.removeItem('authToken');
    // sessionStorage.removeItem('authToken');
    
    // Redirection vers la page de connexion
    navigate('/login');
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="w-full flex justify-between items-center">
          <div className="flex-1 p-4 flex gap-4">
            <SidebarTrigger className="mt-3 cursor-pointer" />
            {children}
            
            <Tabs className="w-full [&_button]:cursor-pointer" aria-label="Onglets avec icônes" variant="underline">
              <TabItem title="Tableau de bord" icon={MdDashboard}>
                Ceci est <span className="font-medium text-gray-800 dark:text-white">le contenu associé à l'onglet Tableau de bord</span>.
                Cliquer sur un autre onglet basculera la visibilité de celui-ci pour le suivant. Le JavaScript de l'onglet 
                échange les classes pour contrôler la visibilité et le style du contenu.
              </TabItem>
              <TabItem title="Paramètres" icon={HiAdjustments}>
                Ceci est <span className="font-medium text-gray-800 dark:text-white">le contenu associé à l'onglet Paramètres</span>.
                Cliquer sur un autre onglet basculera la visibilité de celui-ci pour le suivant. Le JavaScript de l'onglet 
                échange les classes pour contrôler la visibilité et le style du contenu.
              </TabItem>
              <TabItem title="Contacts" icon={HiClipboardList}>
                Ceci est <span className="font-medium text-gray-800 dark:text-white">le contenu associé à l'onglet Contacts</span>.
                Cliquer sur un autre onglet basculera la visibilité de celui-ci pour le suivant. Le JavaScript de l'onglet 
                échange les classes pour contrôler la visibilité et le style du contenu.
              </TabItem>
              <TabItem disabled title="Désactivé">
                Contenu désactivé
              </TabItem>
            </Tabs>

            <DropdownMenu>
              <DropdownMenuTrigger className="mt-3 rounded-full h-8">
                <Avatar className="cursor-pointer">
                  <AvatarImage src="https://lh3.googleusercontent.com/ogw/AF2bZyhd184Wz5LlpcbpEbmK8TIg73_K9X5kKiP_EvFsDVHit4Gj=s32-c-mo" />
                  <AvatarFallback className="bg-gray-300">AT</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">Profil</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Facturation</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Équipe</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="danger" className="cursor-pointer transition-colors duration-200" onClick={handleLogout}>Déconnexion</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
