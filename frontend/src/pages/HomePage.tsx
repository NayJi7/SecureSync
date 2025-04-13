// React et hooks
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDevice } from "@/hooks/use-device"
import { Button } from '@/components/ui/button';

// Composants locaux
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
import Dock from '../blocks/Components/Dock/Dock'
import TeamModal from '../mycomponents/TeamModal'

// Icônes
import { HiAdjustments, HiClipboardList, HiDotsVertical, HiTrash } from "react-icons/hi"
import { MdDashboard, MdSecurity, MdOutlinePersonAdd } from "react-icons/md"
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from "react-icons/vsc"


// Types pour les données du personnel
type StaffMember = {
  id: number;
  name: string;
  role: string;
  department?: string;
  isLeader: boolean;
  photo?: string;
};

export default function HomePage({ children }: { children?: React.ReactNode }) {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useDevice();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: 1, name: "Jean Dupont", role: "Directeur", isLeader: true, photo: "/profile_pics/user_1/default_kiki.png" },
    { id: 2, name: "Marie Martin", role: "Directrice adjointe", isLeader: true, photo: "/profile_pics/user_2/default_kiki.png" },
    { id: 3, name: "Pierre Dubois", role: "Chef de la sécurité", isLeader: true, photo: "/profile_pics/user_3/default_a.png" },
    { id: 4, name: "Sophie Leroy", role: "Garde", department: "Section A", isLeader: false, photo: "/profile_pics/user_4/default_adam.png" },
    { id: 5, name: "Lucas Moreau", role: "Garde", department: "Section B", isLeader: false, photo: "/profile_pics/user_5/default_ad.png" },
    { id: 6, name: "Camille Bernard", role: "Garde", department: "Section A", isLeader: false, photo: "/profile_pics/user_None/default_toto.png" },
    { id: 7, name: "Thomas Petit", role: "Garde", department: "Section C", isLeader: false, photo: "/profile_pics/user_None/default_test.png" },
  ]);
  const isSmallScreen = isMobile || isTablet;

  // Configuration du dock
  const dockItems = [
    { icon: <VscHome size={20} />, label: 'Home', onClick: () => alert('Home!') },
    { icon: <VscArchive size={20} />, label: 'Archive', onClick: () => alert('Archive!') },
    { icon: <VscAccount size={20} />, label: 'Profile', onClick: () =>navigate('/profile') },
    { icon: <VscSettingsGear size={20} />, label: 'Settings', onClick: () => alert('Settings!') },
  ];

  // Contenu des tabs/menu
  const tabContents = {
    dashboard: (
      <div className="relative h-full">
        <div>
          Ceci est <span className="font-medium text-gray-800 dark:text-white">le contenu associé à l'onglet Dashboard</span>.
          Cliquer sur un autre onglet basculera la visibilité de celui-ci pour le suivant. Le JavaScript de l'onglet 
          échange les classes pour contrôler la visibilité et le style du contenu.
        </div>
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <Dock
            className="text-white bg-sidebar"
            color="#000"
            items={dockItems}
            panelHeight={isSmallScreen ? 60 : 70}
            baseItemSize={isSmallScreen ? 40 : 50}
            magnification={isSmallScreen ? 60 : 70}
          />
        </div>
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
    <div className="flex flex-col min-h-screen">
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
      <div className="absolute w-full h-20 bg-sidebar z-10"></div>
      <div className="w-full flex justify-between items-center h-full">
          <div className="flex-1 p-4 flex gap-4 h-full">
        <div className={`flex items-center justify-center z-10 h-full ${isSmallScreen ? 'mt-1.5' : '-mt-1.5'}`}>
            <a href="/landing" className="flex items-center">
            <img src="/src/assets/logo-band.png" alt="SmartHub Logo" className={`${isSmallScreen ? 'w-32' : 'w-38'}`} />
            </a>
        </div>
            {children}
            
            {isSmallScreen ? (
              <div className="w-full mt-1.5">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium z-10 ml-2">
                    {activeTab === "dashboard" ? "Dashboard" : 
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
                        Dashboard
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
                
                {/* Contenu des onglets avec styles améliorés pour assurer la visibilité */}
                <div className="absolute left-0 pt-6 px-4 w-full min-h-[calc(100vh-120px)] z-5">
                  {activeTab === "dashboard" && tabContents.dashboard}
                  {activeTab === "settings" && tabContents.settings}
                  {activeTab === "contacts" && tabContents.contacts}
                  {activeTab === "disabled" && tabContents.disabled}
                </div>
              </div>
            ) : (
              <Tabs 
                className="w-full [&_button]:cursor-pointer z-10" 
                aria-label="Onglets avec icônes" 
                variant="underline"
                onActiveTabChange={(tab) => {
                  if (tab === 0) setActiveTab("dashboard");
                  else if (tab === 1) setActiveTab("settings");
                  else if (tab === 2) setActiveTab("contacts");
                  else setActiveTab("disabled");
                }}
              >
                <TabItem title="Dashboard" icon={MdDashboard}>
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
              <DropdownMenuTrigger className="mt-2 rounded-full h-8 z-10">
                <Avatar className="cursor-pointer">
                  <AvatarImage src="https://lh3.googleusercontent.com/ogw/AF2bZyhd184Wz5LlpcbpEbmK8TIg73_K9X5kKiP_EvFsDVHit4Gj=s32-c-mo" />
                  <AvatarFallback className="bg-gray-300">AT</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">Profil</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setTeamModalOpen(true)}>Équipe</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="danger" className="cursor-pointer transition-colors duration-200" onClick={handleLogout}>Déconnexion</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      
        {/* "Equipe" section in user parameters (handled by TeamModal.tsx component which is a home made component) */}
        <TeamModal 
          isOpen={teamModalOpen} 
          onClose={() => setTeamModalOpen(false)} 
          staff={staff} 
          setStaff={setStaff} 
        />
    </div>
  )
}
