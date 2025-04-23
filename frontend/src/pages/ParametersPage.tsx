import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import { Settings, Save, RefreshCw, AlertCircle, Moon, Globe, Bell, Shield, Lock } from 'lucide-react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDevice } from "@/hooks/use-device";

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

const ParametersPage: React.FC = () => {
  const navigate = useNavigate();
  const { prisonId } = useParams<{ prisonId?: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeSideTab, setActiveSideTab] = useState<string>("appearance");
  const currentPrisonId = prisonId || localStorage.getItem('userPrison') || localStorage.getItem('selectedPrison');

  // États pour les paramètres utilisateur
  const [settings, setSettings] = useState<UserSettings>({
    language: localStorage.getItem("language") || "fr",
    notifications_enabled: localStorage.getItem("notifications") !== "disabled",
    analytics_consent: localStorage.getItem("analyticsConsent") === "true",
    session_timeout: parseInt(localStorage.getItem("sessionTimeout") || "60"),
    security_level: localStorage.getItem("securityLevel") || "standard",
    dark_mode: localStorage.getItem("theme") === "dark",
    display_notifications: true,
    system_alerts: true,
    security_alerts: true,
    activity_alerts: true,
    maintenance_alerts: true
  });

  // Effet pour appliquer le mode sombre
  useEffect(() => {
    if (settings.dark_mode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
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

        // Récupérer les paramètres depuis l'API
        try {
          const settingsResponse = await axios.get('http://localhost:8000/api/user/settings/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (settingsResponse.data) {
            setSettings(prev => ({
              ...prev,
              ...settingsResponse.data,
            }));
          }
        } catch (settingsError) {
          console.warn("Impossible de récupérer les paramètres utilisateur:", settingsError);
          // On continue avec les paramètres par défaut
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Erreur API:", err);

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
      // Sauvegarde en local storage
      localStorage.setItem("language", settings.language);
      localStorage.setItem("notifications", settings.notifications_enabled ? "enabled" : "disabled");
      localStorage.setItem("analyticsConsent", settings.analytics_consent.toString());
      localStorage.setItem("sessionTimeout", settings.session_timeout.toString());
      localStorage.setItem("securityLevel", settings.security_level);
      localStorage.setItem("theme", settings.dark_mode ? "dark" : "light");

      // Envoyer les paramètres à l'API backend
      const token = localStorage.getItem("sessionToken");
      if (token) {
        await axios.post(
          "http://localhost:8000/api/user/settings/",
          {
            language: settings.language,
            notifications_enabled: settings.notifications_enabled,
            analytics_consent: settings.analytics_consent,
            session_timeout: settings.session_timeout,
            security_level: settings.security_level,
            dark_mode: settings.dark_mode,
            display_notifications: settings.display_notifications,
            system_alerts: settings.system_alerts,
            security_alerts: settings.security_alerts,
            activity_alerts: settings.activity_alerts,
            maintenance_alerts: settings.maintenance_alerts,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }

      toast.success("Paramètres sauvegardés", {
        description: "Vos préférences ont été mises à jour avec succès"
      });
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
      
      setError('Erreur lors de la sauvegarde: ' + 
        (error.response?.data?.detail || 'Problème de connexion au serveur'));
      
      toast.error("Erreur", {
        description: "Un problème est survenu lors de la sauvegarde des paramètres"
      });
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour réinitialiser les paramètres
  const resetSettings = () => {
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
    { id: "security", label: "Sécurité", icon: <Shield className="h-5 w-5" /> },
    { id: "language", label: "Langue", icon: <Globe className="h-5 w-5" /> },
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
                        <Label htmlFor="dark-mode" className="flex items-center gap-2">
                          <Moon className="h-5 w-5" />
                          Mode sombre
                        </Label>
                        <Switch
                          id="dark-mode"
                          checked={settings.dark_mode}
                          onCheckedChange={(checked) => handleChange("dark_mode", checked)}
                        />
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
                      <div className="flex items-center justify-between mb-4">
                        <Label htmlFor="notifications-toggle">Activer les notifications</Label>
                        <Switch
                          id="notifications-toggle"
                          checked={settings.notifications_enabled}
                          onCheckedChange={(checked) => handleChange("notifications_enabled", checked)}
                        />
                      </div>
                      
                      {settings.notifications_enabled && (
                        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300">Types d'alertes</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="security-alerts">Alertes de sécurité</Label>
                              <Switch
                                id="security-alerts"
                                checked={settings.security_alerts}
                                onCheckedChange={(checked) => handleChange("security_alerts", checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="system-updates">Mises à jour système</Label>
                              <Switch
                                id="system-updates"
                                checked={settings.system_alerts}
                                onCheckedChange={(checked) => handleChange("system_alerts", checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="activity-alerts">Activités inhabituelles</Label>
                              <Switch
                                id="activity-alerts"
                                checked={settings.activity_alerts}
                                onCheckedChange={(checked) => handleChange("activity_alerts", checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="maintenance-alerts">Maintenance</Label>
                              <Switch
                                id="maintenance-alerts"
                                checked={settings.maintenance_alerts}
                                onCheckedChange={(checked) => handleChange("maintenance_alerts", checked)}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              )}

              {/* Onglet de sécurité */}
              {activeSideTab === "security" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Sécurité</h3>
                  <Card className="p-4 space-y-6">
                    <div className="space-y-2">
                      <Label>Niveau de sécurité</Label>
                      <Select 
                        value={settings.security_level} 
                        onValueChange={(value) => handleChange("security_level", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="elevated">Élevé</SelectItem>
                          <SelectItem value="maximum">Maximum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Expiration de session (minutes)</Label>
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
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button variant="outline" className="w-full">
                        Changer le mot de passe
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Onglet de langue */}
              {activeSideTab === "language" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Langue</h3>
                  <Card className="p-4">
                    <Label className="mb-2 block">Sélectionner une langue</Label>
                    <Select 
                      value={settings.language} 
                      onValueChange={(value) => handleChange("language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une langue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </Card>
                </div>
              )}

              {/* Onglet de confidentialité */}
              {activeSideTab === "privacy" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Confidentialité</h3>
                  <Card className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="analytics-consent">
                        Autoriser la collecte de données analytiques
                      </Label>
                      <Switch
                        id="analytics-consent"
                        checked={settings.analytics_consent}
                        onCheckedChange={(checked) => handleChange("analytics_consent", checked)}
                      />
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
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
            </div>

            {/* Boutons d'actions */}
            <div className="flex justify-evenly mt-8">
              <Button 
                variant="outline" 
                onClick={resetSettings} 
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
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

export default ParametersPage;
