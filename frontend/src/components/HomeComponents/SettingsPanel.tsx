import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { createRoot } from 'react-dom/client';
import { Settings, Save, RefreshCw, AlertCircle, Moon, Bell, Shield, Lock, BarChart2 } from 'lucide-react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  prison?: string;
  role?: string;
  points?: number;
}

interface UserSettings {
  language: string;
  notifications_enabled: boolean;
  analytics_consent: boolean;
  session_timeout: number;
  security_level: string;
  dark_mode: boolean;
  display_notifications: boolean;
  system_alerts: boolean;
  security_alerts: boolean;
  activity_alerts: boolean;
  maintenance_alerts: boolean;
}

const SettingsPanel: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeSideTab, setActiveSideTab] = useState<string>("appearance");

  // Options de fréquence d'envoi des statistiques (en millisecondes)
  const frequencyOptions = [
    { label: "Toutes les 5 minutes", value: 5 * 60 * 1000 },
    { label: "Toutes les 15 minutes", value: 15 * 60 * 1000 },
    { label: "Toutes les 30 minutes", value: 30 * 60 * 1000 },
    { label: "Toutes les heures", value: 60 * 60 * 1000 },
    { label: "Toutes les 6 heures", value: 6 * 60 * 60 * 1000 },
    { label: "Une fois par jour", value: 24 * 60 * 60 * 1000 },
  ];

  // Récupérer la valeur initiale depuis localStorage (par défaut: 1 heure)
  const [currentFrequency, setCurrentFrequency] = useState<number>(
    parseInt(localStorage.getItem('statsFrequency') || '3600000')
  );

  // Activation/désactivation de la collecte de statistiques
  const [statsEnabled, setStatsEnabled] = useState<boolean>(
    localStorage.getItem('statsEnabled') !== 'false'
  );

  // Modifier uniquement l'état local lorsque la fréquence change
  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFrequency = parseInt(e.target.value);
    setCurrentFrequency(newFrequency);
  };

  // États pour les paramètres utilisateur
  const [settings, setSettings] = useState<UserSettings>({
    language: localStorage.getItem("language") || "fr",
    notifications_enabled: localStorage.getItem("notifications") !== "disabled",
    analytics_consent: localStorage.getItem("analyticsConsent") === "true",
    session_timeout: parseInt(localStorage.getItem("sessionTimeout") || "60"),
    security_level: localStorage.getItem("securityLevel") || "standard",
    dark_mode: localStorage.getItem("theme") === "dark",
    display_notifications: localStorage.getItem("displayNotifications") === "true" || true,
    system_alerts: localStorage.getItem("systemAlerts") === "true" || true,
    security_alerts: localStorage.getItem("securityAlerts") === "true" || true,
    activity_alerts: localStorage.getItem("activityAlerts") === "true" || true,
    maintenance_alerts: localStorage.getItem("maintenanceAlerts") === "true" || true
  });

  // Effet pour appliquer le mode sombre
  useEffect(() => {
    // Sauvegarder seulement dans localStorage sans modifier le document HTML
    localStorage.setItem("theme", settings.dark_mode ? "dark" : "light");
    
    // Émettre un événement personnalisé pour que HomePage puisse réagir
    const themeChangeEvent = new CustomEvent("homeThemeChanged", { 
      detail: { dark: settings.dark_mode } 
    });
    document.dispatchEvent(themeChangeEvent);
  }, [settings.dark_mode]);

  // Récupération du profil utilisateur
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('sessionToken');
        
        const response = await axios.get('http://localhost:8000/api/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setProfile(response.data);

        setLoading(false);
      } catch (err: any) {

        if (err.response?.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
          localStorage.removeItem('sessionToken');
          navigate('/login');
          return;
        }

        setError('Erreur lors du chargement du profil: ' + 
          (err.response?.data?.detail || 'Problème de connexion au serveur'));
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Fonction pour gérer les changements dans les paramètres
  const handleChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Fonction pour sauvegarder les paramètres
  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // Sauvegarde en local storage uniquement
      localStorage.setItem("language", settings.language);
      localStorage.setItem("notifications", settings.notifications_enabled ? "enabled" : "disabled");
      localStorage.setItem("analyticsConsent", settings.analytics_consent.toString());
      localStorage.setItem("sessionTimeout", settings.session_timeout.toString());
      localStorage.setItem("securityLevel", settings.security_level);
      localStorage.setItem("theme", settings.dark_mode ? "dark" : "light");
      
      // Sauvegarde des préférences de statistiques
      localStorage.setItem("statsEnabled", statsEnabled.toString());
      localStorage.setItem("statsFrequency", currentFrequency.toString());
      
      // Afficher un log sur la fréquence d'envoi sauvegardée
      const selectedOption = frequencyOptions.find(option => option.value === currentFrequency);
      console.log(`Fréquence d'envoi des statistiques sauvegardée: ${selectedOption?.label || currentFrequency + 'ms'}`);
      
      // Notifier l'utilisateur des changements de fréquence
      if (parseInt(localStorage.getItem('statsFrequency') || '0') !== currentFrequency) {
        toast.success("Fréquence modifiée", {
          description: `Fréquence d'envoi: ${selectedOption?.label || `${currentFrequency}ms`}`
        });
      }
      
      // Déclencher des événements pour notifier les autres composants
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'statsEnabled',
        newValue: statsEnabled.toString()
      }));
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'statsFrequency',
        newValue: currentFrequency.toString()
      }));
      
      // Sauvegarde des préférences de notifications
      localStorage.setItem("displayNotifications", settings.display_notifications.toString());
      localStorage.setItem("systemAlerts", settings.system_alerts.toString());
      localStorage.setItem("securityAlerts", settings.security_alerts.toString());
      localStorage.setItem("activityAlerts", settings.activity_alerts.toString());
      localStorage.setItem("maintenanceAlerts", settings.maintenance_alerts.toString());
      
      // Émettre un événement pour mettre à jour le gestionnaire de session
      const sessionTimeoutEvent = new CustomEvent("sessionTimeoutChanged", { 
        detail: { timeout: settings.session_timeout } 
      });
      document.dispatchEvent(sessionTimeoutEvent);

      // Afficher une notification de succès plus visible (comme celle des erreurs)
      setError(null);
      // Utiliser setSuccessMessage à la place du toast
      const successElement = (
        <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300 rounded-md flex items-start">
          <Save className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>Paramètres sauvegardés avec succès. Vos préférences ont été mises à jour.</p>
        </div>
      );
      
      const successContainer = document.createElement("div");
      successContainer.id = "settings-success-message";
      document.querySelector(".container")?.prepend(successContainer);
      
      // Rendu de l'élément React dans le conteneur DOM
      const root = createRoot(successContainer);
      root.render(successElement);
      
      // Supprimer la notification après 3 secondes
      setTimeout(() => {
        const element = document.getElementById("settings-success-message");
        if (element) element.remove();
      }, 3000);
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
      
      setError('Erreur lors de la sauvegarde des paramètres');
      
      toast.error("Erreur", {
        description: "Un problème est survenu lors de la sauvegarde des paramètres"
      });
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour réinitialiser les paramètres
  const resetSettings = () => {
    // Réinitialiser les paramètres principaux
    setSettings({
      language: "fr",
      notifications_enabled: true,
      analytics_consent: false,
      session_timeout: 60,
      security_level: "standard",
      dark_mode: false,
      display_notifications: true,
      system_alerts: true,
      security_alerts: true,
      activity_alerts: true,
      maintenance_alerts: true
    });
    
    // Réinitialiser les paramètres de statistiques
    setStatsEnabled(true);
    setCurrentFrequency(3600000); // 1 heure par défaut
    
    // Enregistrer dans le localStorage
    localStorage.setItem("statsEnabled", "true");
    localStorage.setItem("statsFrequency", "3600000");
    
    // Envoyer les événements pour informer les autres composants
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'statsEnabled',
      newValue: "true"
    }));
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'statsFrequency',
      newValue: "3600000"
    }));

    toast.info("Paramètres réinitialisés", {
      description: "Vos paramètres ont été restaurés aux valeurs par défaut"
    });
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Définir des catégories de paramètres
  const paramCategories = [
    { id: "appearance", label: "Apparence", icon: <Moon className="h-5 w-5" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-5 w-5" /> },
    { id: "statistics", label: "Statistiques", icon: <BarChart2 className="h-5 w-5" /> },
    { id: "security", label: "Sécurité", icon: <Shield className="h-5 w-5" /> },
    { id: "privacy", label: "Confidentialité", icon: <Lock className="h-5 w-5" /> }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Settings className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Paramètres</h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {profile ? `${profile.username} - ${profile.role || 'Utilisateur'}` : 'Chargement...'}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar de navigation */}
          <div className="md:col-span-1">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <nav className="space-y-1">
                {paramCategories.map(category => (
                  <button
                    key={category.id}
                    className={`w-full flex items-center px-3 py-2 rounded-md transition-colors ${
                      activeSideTab === category.id
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                    onClick={() => setActiveSideTab(category.id)}
                  >
                    <div className="mr-3">{category.icon}</div>
                    <span>{category.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="md:col-span-3">
            <div className="overflow-x-auto backdrop-blur-md bg-white/10 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                {/* Onglet d'apparence */}
                {activeSideTab === "appearance" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Apparence</h3>
                  <div className="space-y-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                    <div className='w-full'>
                      <Label htmlFor="dark-mode" className="flex items-center justify-between mr-2 gap-2">
                        <div className="flex items-center gap-2">
                          <Moon className="h-5 w-5" />
                          Mode sombre
                        </div>
                        <Switch
                        id="dark-mode"
                        checked={settings.dark_mode}
                        onCheckedChange={(checked) => handleChange("dark_mode", checked)}
                        />
                      </Label>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                        <p>
                        Adapte l'interface avec des couleurs sombres pour réduire la fatigue visuelle et économiser la batterie.
                        </p>
                      </div>
                    </div>
                    </div>
                  </Card>
                  </div>
                </div>
                )}

                {/* Onglet de notifications */}
                {activeSideTab === "notifications" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Notifications</h3>
                  <div className="space-y-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                    <div className='w-full'>
                      <Label htmlFor="notifications-toggle" className="flex items-center justify-between mr-2 gap-2">
                        <div className='flex items-center gap-2'>
                          <Bell className="h-5 w-5" />
                          Activer les notifications
                        </div>
                        <Switch
                          id="notifications-toggle"
                          checked={settings.notifications_enabled}
                          onCheckedChange={(checked) => handleChange("notifications_enabled", checked)}
                        />
                      </Label>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                        <p>
                        Permet d'être informé des gains de points liés à l'utilisation de l'application.
                        </p>
                      </div>
                    </div>
                    </div>
                  </Card>
                  </div>
                </div>
                )}

              {/* Onglet de sécurité */}
              {activeSideTab === "security" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Sécurité</h3>
                  <Card className="p-4 space-y-6">
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Expiration de session (minutes)
                          </Label>
                          <span className="text-sm font-medium">{settings.session_timeout}</span>
                        </div>
                        <Slider
                          value={[settings.session_timeout]}
                          min={15}
                          max={120}
                          step={15}
                          onValueChange={(value) => handleChange("session_timeout", value[0])}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>15 min</span>
                          <span>120 min</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                          <p>
                            Votre session expirera automatiquement après {settings.session_timeout} minutes d'inactivité, vous obligeant à vous reconnecter pour des raisons de sécurité. Cette mesure protège vos données en votre absence.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Onglet de confidentialité */}
              {activeSideTab === "privacy" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Confidentialité</h3>
                  <Card className="p-4">
                    <div className="flex items-center justify-between mr-2">
                      <Label htmlFor="analytics-consent" className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Autoriser la collecte de données analytiques
                      </Label>
                      <Switch
                        id="analytics-consent"
                        checked={settings.analytics_consent}
                        onCheckedChange={(checked) => handleChange("analytics_consent", checked)}
                      />
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                      <p>
                        Ces données nous aident à comprendre comment vous utilisez notre application 
                        et à l'améliorer. Aucune information personnelle n'est collectée.
                      </p>
                      <p className="mt-2">
                        Vos données sont stockées conformément à notre politique de confidentialité 
                        et au Règlement Général sur la Protection des Données (RGPD).
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              {/* Onglet de statistiques */}
              {activeSideTab === "statistics" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Configuration des statistiques</h3>
                  <Card className="p-4">
                    <div className="flex items-center justify-between mr-2">
                      <Label htmlFor="stats-toggle" className="flex items-center gap-2">
                        <BarChart2 className="h-5 w-5" />
                        Collecte automatique des statistiques
                      </Label>
                      <Switch
                        id="stats-toggle"
                        checked={statsEnabled}
                        onCheckedChange={(isChecked) => {
                          setStatsEnabled(isChecked);
                          localStorage.setItem('statsEnabled', isChecked.toString());
                          
                          // Afficher un log dans la console
                          console.log(`Collecte automatique de statistiques ${isChecked ? 'activée' : 'désactivée'}`);
                          
                          window.dispatchEvent(new StorageEvent('storage', {
                            key: 'statsEnabled',
                            newValue: isChecked.toString()
                          }));
                          
                          // Afficher une notification toast
                          toast.info(isChecked ? "Collecte activée" : "Collecte désactivée", {
                            description: isChecked 
                              ? "Les statistiques seront collectées et envoyées automatiquement" 
                              : "Les statistiques ne seront plus collectées automatiquement"
                          });
                        }}
                      />
                    </div>
                    
                    {/* Bouton pour envoyer manuellement les statistiques (debug) */}
                    {/*
                     <div className="mt-4 flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:border-blue-800 dark:hover:bg-blue-800/50"
                        onClick={() => {
                          // Déclencher l'événement d'envoi manuel des statistiques
                          window.dispatchEvent(new CustomEvent('sendStatsManually'));
                          
                          // Afficher un log dans la console
                          console.log("Envoi manuel des statistiques demandé à:", new Date().toLocaleTimeString());
                          
                          // Notification toast
                          toast.success("Envoi des statistiques", {
                            description: "Demande d'envoi manuel des statistiques envoyée"
                          });
                        }}
                      >
                        <BarChart2 className="h-4 w-4" />
                        <span>Envoyer les statistiques maintenant (debug)</span>
                      </Button>
                    </div> 
                    */}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                      <Label htmlFor="frequency-select" className="flex items-center gap-2">
                        Fréquence d'envoi des statistiques
                      </Label>
                      <select
                        id="frequency-select"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={currentFrequency}
                        onChange={handleFrequencyChange}
                        disabled={!statsEnabled}
                      >
                        {frequencyOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                      <p>Les statistiques d'utilisation des objets connectés sont collectées automatiquement et envoyées à notre base de données centrale pour analyse. Ces données sont utilisées pour optimiser l'efficacité énergétique et améliorer la surveillance du système.</p>
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* Boutons d'actions */}
            <div className="flex justify-evenly mt-8">
              <Button 
                variant="outline" 
                onClick={resetSettings} 
                className="border-gray-300 dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Réinitialiser
              </Button>
              <Button 
                onClick={saveSettings} 
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Enregistrer</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
