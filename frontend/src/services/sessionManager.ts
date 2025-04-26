// src/services/sessionManager.ts
import { toast } from "sonner";

class SessionManager {
  private lastActivityTime: number;
  private sessionTimeout: number; // en millisecondes
  private checkInterval: number = 60000; // Vérifier chaque minute
  private intervalId: number | null = null;

  constructor() {
    this.lastActivityTime = Date.now();
    // Récupérer le timeout configuré ou utiliser la valeur par défaut (60 minutes)
    const configuredTimeout = parseInt(localStorage.getItem('sessionTimeout') || '60');
    this.sessionTimeout = configuredTimeout * 60 * 1000; // Conversion en millisecondes
    
    // Configurer les écouteurs d'événements pour détecter l'activité
    this.setupActivityListeners();
  }

  // Configurer les écouteurs d'activité utilisateur
  private setupActivityListeners(): void {
    const activityEvents = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    // Enregistrer chaque activité
    activityEvents.forEach(event => {
      window.addEventListener(event, () => this.updateActivity());
    });
  }

  // Mise à jour du timestamp de dernière activité
  public updateActivity(): void {
    this.lastActivityTime = Date.now();
  }

  // Démarrer la surveillance de session
  public startSessionMonitoring(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }

    // Mettre à jour le timeout configuré
    const configuredTimeout = parseInt(localStorage.getItem('sessionTimeout') || '60');
    this.sessionTimeout = configuredTimeout * 60 * 1000;

    // Vérifier régulièrement si la session est expirée
    this.intervalId = window.setInterval(() => {
      this.checkSessionStatus();
    }, this.checkInterval);

    console.info(`Session monitoring started with timeout: ${this.sessionTimeout / 60000} minutes`);
  }

  // Arrêter la surveillance de session
  public stopSessionMonitoring(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.info('Session monitoring stopped');
    }
  }

  // Vérifier si la session doit expirer
  private checkSessionStatus(): void {
    const now = Date.now();
    const timeElapsed = now - this.lastActivityTime;

    // Si le temps écoulé depuis la dernière activité est supérieur au timeout configuré
    if (timeElapsed > this.sessionTimeout) {
      console.info(`Session expired after ${timeElapsed / 60000} minutes of inactivity`);
      this.handleSessionExpiration();
    }
  }

  // Gérer l'expiration de session
  private handleSessionExpiration(): void {
    // Arrêter la surveillance
    this.stopSessionMonitoring();

    // Supprimer les tokens d'authentification
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionToken');

    // Informer l'utilisateur
    toast.error("Session expirée", {
      description: "Votre session a expiré en raison d'une période d'inactivité. Veuillez vous reconnecter."
    });

    // Rediriger vers la page de connexion
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  }
}

// Export d'une instance unique du gestionnaire de session
const sessionManager = new SessionManager();
export default sessionManager;
