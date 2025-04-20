// React et hooks
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDevice } from "@/hooks/use-device"
import { Button } from '@/components/ui/button';
import axios from 'axios';

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
import TeamModal from '../components/TeamModal'
import ProfileModal from '../components/ProfileModal'
import ConnectedObjects from '../components/ConnectedObjects/ConnectedObjects';

// Icônes
import { HiAdjustments, HiClipboardList, HiDotsVertical, HiTrash } from "react-icons/hi"
import { MdDashboard, MdSecurity, MdOutlinePersonAdd } from "react-icons/md"
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from "react-icons/vsc"

// Interface pour le profil utilisateur
interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_naissance: string;
  sexe: string;
  photo: string | null;
}

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
  const { prisonId } = useParams<{ prisonId?: string }>();
  const { isMobile, isTablet } = useDevice();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [currentPrison, setCurrentPrison] = useState<string>(prisonId || localStorage.getItem('userPrison') || '');
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const isSmallScreen = isMobile || isTablet;

  // État pour stocker les données du profil utilisateur
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Récupération des données du profil au chargement du composant
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('sessionToken');
        const response = await axios.get('http://localhost:8000/api/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("API response data:", response.data);
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur API:", err);
        setError('Erreur lors du chargement du profil');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Configuration du dock
  const dockItems = [
    { icon: <VscHome size={20} />, label: 'Home', onClick: () => navigate(`/${currentPrison}/home`) },
    { icon: <VscArchive size={20} />, label: 'Archive', onClick: () => navigate(`/${currentPrison}/object`) },
    { icon: <VscAccount size={20} />, label: 'Profile', onClick: () => navigate(`/${currentPrison}/profile`) },
    { icon: <VscSettingsGear size={20} />, label: 'Settings', onClick: () => navigate(`/${currentPrison}/staff`) },
  ];

  // Contenu des tabs/menu
  const tabContents = {
    dashboard: (
      <div className="relative h-full">

        {/* ConnectedObjects always visible */}
        <div className="my-8">
          <ConnectedObjects />
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

    // Mettre à jour le titre de la page et le prison ID en fonction de l'URL
    if (prisonId) {
      setCurrentPrison(prisonId);

      // On pourrait charger les informations spécifiques à la prison ici
      console.log(`Page chargée pour l'établissement: ${prisonId}`);
    }

    return () => {
      document.body.classList.remove('home-page');
    };
  }, [prisonId]);

  const handleLogout = () => {
    // Nettoyer les données de session
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userPrison');
    localStorage.removeItem('selectedPrison');

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
                {/* Si chargement ou erreur, afficher une fallback */}
                {loading || error || !profile ? (
                  <AvatarFallback className="bg-gray-300">?</AvatarFallback>
                ) : (
                  <div className="w-8 h-8 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border-2 border-gray-200">
                      {(profile.first_name || profile.last_name) ?
                        `${profile.first_name?.charAt(0).toUpperCase() || ''}${profile.last_name?.charAt(0).toUpperCase() || ''}` :
                        profile.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                  </div>
                )}
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => setProfileModalOpen(true)}>Profil</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setStaffModalOpen(true)}>Équipe</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="danger" className="cursor-pointer transition-colors duration-200" onClick={handleLogout}>Déconnexion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* "Equipe" section in user parameters (handled by TeamModal.tsx component which is a home made component) */}
      <TeamModal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
      />

      {/* "Profil" section in user parameters */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        existingProfile={profile} // Passer le profil au composant modal
        setProfile={setProfile} // Permettre au modal de mettre à jour le profil parent
      />
    </div>
  )
}