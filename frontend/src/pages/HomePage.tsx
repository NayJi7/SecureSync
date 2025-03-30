// React et hooks
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDevice } from "@/hooks/use-device"

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
import Waves from '../blocks/Backgrounds/Waves/Waves'

// Icônes
import { HiAdjustments, HiClipboardList, HiDotsVertical } from "react-icons/hi"
import { MdDashboard } from "react-icons/md"


export default function HomePage({ children }: { children?: React.ReactNode }) {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useDevice();
  const [activeTab, setActiveTab] = useState("dashboard");
  const isSmallScreen = isMobile || isTablet;

  // Contenu des tabs/menu
  const tabContents = {
    dashboard: (
      <div>
        Ceci est <span className="font-medium text-gray-800 dark:text-white">le contenu associé à l'onglet Tableau de bord</span>.
        Cliquer sur un autre onglet basculera la visibilité de celui-ci pour le suivant. Le JavaScript de l'onglet 
        échange les classes pour contrôler la visibilité et le style du contenu.
      </div>
    ),
    settings: (
      <div>
        Ceci est <span className="font-medium text-gray-800 dark:text-white">le contenu associé à l'onglet Paramètres</span>.
        Cliquer sur un autre onglet basculera la visibilité de celui-ci pour le suivant. Le JavaScript de l'onglet 
        échange les classes pour contrôler la visibilité et le style du contenu.
      </div>
    ),
    contacts: (
      <div>
        Ceci est <span className="font-medium text-gray-800 dark:text-white">le contenu associé à l'onglet Contacts</span>.
        Cliquer sur un autre onglet basculera la visibilité de celui-ci pour le suivant. Le JavaScript de l'onglet 
        échange les classes pour contrôler la visibilité et le style du contenu.
      </div>
    ),
    disabled: (
      <div>Contenu désactivé</div>
    )
  };

  useEffect(() => {
    document.body.classList.add('home-page');
    return () => {
      document.body.classList.remove('home-page');
    };
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };
  
  return (
    <SidebarProvider>
      <Waves
        lineColor="#000"
        backgroundColor="rgba(255, 255, 255, 0.2)"
        waveSpeedX={0.02}
        waveSpeedY={0.01}
        waveAmpX={40}
        waveAmpY={20}
        friction={0.9}
        tension={0.01}
        maxCursorMove={120}
        xGap={12}
        yGap={36}
        dot={false}
      />
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <div className="absolute w-full h-20 bg-sidebar"></div>
        <div className="w-full flex justify-between items-center">
          <div className="flex-1 p-4 flex gap-4">
            <SidebarTrigger className="z-10 mt-2.5 cursor-pointer" />
            {children}
            
            {isSmallScreen ? (
              <div className="w-full mt-1.5">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium z-10">
                    {activeTab === "dashboard" ? "Tableau de bord" : 
                     activeTab === "settings" ? "Paramètres" : 
                     activeTab === "contacts" ? "Contacts" : "Désactivé"}
                  </h2>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                      <HiDotsVertical className="w-5 h-5 z-10" />
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className={`flex items-center gap-2 ${activeTab === "dashboard" ? "bg-gray-100 dark:bg-gray-600" : ""}`}
                        onClick={() => setActiveTab("dashboard")}
                      >
                        <MdDashboard className="w-4 h-4" />
                        Tableau de bord
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className={`flex items-center gap-2 ${activeTab === "settings" ? "bg-gray-100 dark:bg-gray-600" : ""}`}
                        onClick={() => setActiveTab("settings")}
                      >
                        <HiAdjustments className="w-4 h-4" />
                        Paramètres
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className={`flex items-center gap-2 ${activeTab === "contacts" ? "bg-gray-100 dark:bg-gray-600" : ""}`}
                        onClick={() => setActiveTab("contacts")}
                      >
                        <HiClipboardList className="w-4 h-4" />
                        Contacts
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="tab-content">
                  {tabContents[activeTab as keyof typeof tabContents]}
                </div>
              </div>
            ) : (
              <Tabs 
                className="w-full [&_button]:cursor-pointer" 
                aria-label="Onglets avec icônes" 
                variant="underline"
                onActiveTabChange={(tab) => {
                  if (tab === 0) setActiveTab("dashboard");
                  else if (tab === 1) setActiveTab("settings");
                  else if (tab === 2) setActiveTab("contacts");
                  else setActiveTab("disabled");
                }}
              >
                <TabItem title="Tableau de bord" icon={MdDashboard}>
                  {tabContents.dashboard}
                </TabItem>
                <TabItem title="Paramètres" icon={HiAdjustments}>
                  {tabContents.settings}
                </TabItem>
                <TabItem title="Contacts" icon={HiClipboardList}>
                  {tabContents.contacts}
                </TabItem>
                <TabItem disabled title="Désactivé">
                  {tabContents.disabled}
                </TabItem>
              </Tabs>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger className="mt-2 rounded-full h-8">
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
