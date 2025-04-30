// filepath: /home/adamt/gitstore/SecureSync/frontend/src/services/pdfService.ts
import jsPDF from 'jspdf';
// Import autoTable directly from jspdf-autotable
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';

// Extend jsPDF type to include the lastAutoTable property
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY?: number;
    };
  }
}
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import { countUsersByRole, countUsersBySection, countUsersByGender, calculateAverageAge, calculateAveragePoints, calculatePointsByRole, PrisonData } from './prisonService';

interface Stat {
  id: number;
  date_creation: string;
  nombre_objets: number;
  pourcentage_allumes: number;
  nbr_on: number;
  nbr_off: number;
  type: number;
  consommation_total_actuelle: number;
  consommation_moyenne: number;
  cout_horaire: number;
  porte_allumees: number;
  porte_consommation: number;
  camera_allumees: number;
  camera_consommation: number;
  lumiere_allumees: number;
  lumiere_consommation: number;
  panneau_allumes: number;
  panneau_consommation: number;
  thermostat_allumes: number;
  thermostat_consommation: number;
  ventilation_allumees: number;
  ventilation_consommation: number;
  prison_id?: string;
}

interface Averages {
  avgConsommation: number;
  avgPourcentageAllumes: number;
  avgCoutHoraire: number;
  consommationTrend: number;
  pourcentageTrend: number;
  coutTrend: number;
  totalCout24h: number;
}

interface ChartData {
  consommationData: {
    date: string;
    consommation: number;
    objetsAllumés: number;
  }[];
  objetTypesData: {
    name: string;
    value: number;
    consommation: number;
  }[];
  tendanceData: {
    date: string;
    pourcentageAllumés: number;
    coûtHoraire: number;
  }[];
}

/**
 * Récupère le nom complet de la prison à partir de son ID
 */
const getPrisonName = (prisonId: string): string => {
  const prisonMap: Record<string, string> = {
    'paris': 'Paris',
    'lyon': 'Lyon',
    'marseille': 'Marseille',
    'cergy': 'Cergy'
  };
  
  return prisonMap[prisonId] || prisonId;
};

/**
 * Capture un graphique et retourne son image en base64
 * @param chartId ID de l'élément DOM contenant le graphique
 * @returns Promise avec le data URL de l'image
 */
export const captureChart = async (chartId: string): Promise<string> => {
  try {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
      console.error(`Element with ID ${chartId} not found`);
      return '';
    }

    const canvas = await html2canvas(chartElement, {
      scale: 2, // Augmenter la résolution de l'image
      useCORS: true,
      logging: false,
      backgroundColor: window.getComputedStyle(chartElement).backgroundColor || '#ffffff'
    });
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error(`Error capturing chart ${chartId}:`, error);
    return '';
  }
};

/**
 * Génère un rapport PDF avec les statistiques
 * 
 * @param timeRange Période sélectionnée ('24h', 'week', 'month')
 * @param stats Données de statistiques
 * @param averages Moyennes calculées
 * @param chartData Données pour les graphiques
 * @param prisonData Données de la prison (utilisateurs, logs, etc.)
 * @param chartImages Images des graphiques capturées (optional)
 */
export const generateStatsPDF = async (
  timeRange: '24h' | 'week' | 'month',
  stats: Stat[],
  averages: Averages | null,
  chartData: ChartData,
  prisonData: PrisonData | null,
  chartImages?: {
    consommation?: string;
    objetTypes?: string;
    tendances?: string;
  }
): Promise<void> => {
  try {
    // Créer une nouvelle instance de jsPDF
    const doc = new jsPDF();

    // Variable pour garder une trace de la dernière position Y du tableau
    let lastTableY = 0;
    
    // Définir les couleurs et styles
    const primaryColor = '#4F46E5'; // indigo-600
    const textColor = '#1F2937'; // gray-800
    const lightColor = '#9CA3AF'; // gray-400
    
    // ------- Page de titre -------
    // Logo SecureSync
    try {
      // Importer le logo depuis les assets
      const logoPath = new URL('/public/logo-square.png', import.meta.url).href;
      doc.addImage(logoPath, 'PNG', 85, 15, 40, 40); // x, y, width, height
    } catch (error) {
      console.error("Erreur lors de l'ajout du logo:", error);
    }
    
    // Titre du rapport avec le type et la prison
    let periodText = '';
    switch(timeRange) {
      case '24h':
        periodText = 'Journalier';
        break;
      case 'week':
        periodText = 'Hebdomadaire';
        break;
      case 'month':
        periodText = 'Mensuel';
        break;
    }
    
    // Récupérer le nom de la prison
    let prisonName = '';
    if (stats.length > 0 && stats[0].prison_id) {
      const prisonId = stats[0].prison_id;
      prisonName = getPrisonName(prisonId);
    }
    
    // Titre complet
    doc.setFontSize(24);
    doc.setTextColor(primaryColor);
    doc.text(`Rapport ${periodText}`, 105, 70, { align: 'center' });
    
    // Nom de la prison en sous-titre
    doc.setFontSize(16);
    doc.setTextColor(textColor);
    if (prisonName) {
      doc.text(`Prison de ${prisonName}`, 105, 80, { align: 'center' });
    }
    
    // Dates des statistiques
    if (stats.length > 0) {
      const startDate = format(new Date(stats[0].date_creation), 'dd MMMM yyyy à HH:mm', { locale: fr });
      const endDate = format(new Date(stats[stats.length - 1].date_creation), 'dd MMMM yyyy à HH:mm', { locale: fr });
      doc.setFontSize(10);
      doc.setTextColor(lightColor);
      doc.text(`Données collectées du ${startDate} au ${endDate}`, 105, 90, { align: 'center' });
    }
    
    // Date de génération
    doc.setFontSize(10);
    doc.setTextColor(lightColor);
    doc.text(`Rapport généré le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}`, 105, 85, { align: 'center' });
    
    // Logo ou image (à remplacer par votre propre image)
    // doc.addImage('chemin_vers_logo', 'PNG', 85, 80, 40, 40);
    
    // ------- Résumé des statistiques -------
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(primaryColor);
    doc.text('Résumé des statistiques', 14, 20);
    
    if (averages) {
      doc.setFontSize(12);
      doc.setTextColor(textColor);
      doc.text('Consommation moyenne:', 14, 30);
      doc.text(`${averages.avgConsommation.toFixed(1)} kWh`, 100, 30);
      
      doc.text('Pourcentage d\'objets allumés:', 14, 38);
      doc.text(`${averages.avgPourcentageAllumes.toFixed(1)} %`, 100, 38);
      
      doc.text('Coût horaire moyen:', 14, 46);
      doc.text(`${averages.avgCoutHoraire.toFixed(3)} €`, 100, 46);
      
      doc.text('Coût estimé sur 24h:', 14, 54);
      doc.text(`${averages.totalCout24h.toFixed(2)} €`, 100, 54);
      
      doc.text('Tendance consommation:', 14, 62);
      doc.text(`${averages.consommationTrend > 0 ? '+' : ''}${averages.consommationTrend.toFixed(1)} kWh`, 100, 62);
      
      doc.text('Tendance objets allumés:', 14, 70);
      doc.text(`${averages.pourcentageTrend > 0 ? '+' : ''}${averages.pourcentageTrend.toFixed(1)} %`, 100, 70);
      
      doc.text('Tendance coût horaire:', 14, 78);
      doc.text(`${averages.coutTrend > 0 ? '+' : ''}${averages.coutTrend.toFixed(3)} €`, 100, 78);
    }

    // ------- Détails des statistiques -------
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(primaryColor);
    doc.text('Détails par type d\'objet', 14, 20);
    
    // Tableau des objets
    if (chartData.objetTypesData.length > 0) {
      const tableData = chartData.objetTypesData.map(obj => [
        obj.name,
        obj.value.toString(),
        `${obj.consommation.toFixed(1)} kWh`,
        obj.value > 0 ? `${(obj.consommation / obj.value).toFixed(1)} kWh` : '0 kWh'
      ]);
      
      // Utiliser autoTable directement
      autoTable(doc, {
        startY: 25,
        head: [['Type d\'objet', 'Objets allumés', 'Consommation', 'Conso. moyenne/objet']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [79, 70, 229],  // indigo-600
          textColor: [255, 255, 255]
        },
        alternateRowStyles: {
          fillColor: [243, 244, 246]  // gray-100
        }
      });
      
      // Ajouter le graphique des types d'objets s'il est disponible
      if (chartImages?.objetTypes) {
        const finalY = doc.lastAutoTable?.finalY || 140;
        doc.setFontSize(14);
        doc.setTextColor(primaryColor);
        doc.text('Graphique de répartition des objets', 14, finalY + 10);
        doc.addImage(chartImages.objetTypes, 'PNG', 14, finalY + 20, 180, 100);
      }
    }
    
    // ------- Statistiques des utilisateurs -------
    if (prisonData) {
      doc.addPage();
      doc.setFontSize(16);
      doc.setTextColor(primaryColor);
      doc.text('Statistiques des utilisateurs', 14, 20);
      
      // Statistiques générales
      doc.setFontSize(12);
      doc.setTextColor(textColor);
      doc.text(`Nombre total d'utilisateurs: ${prisonData.users.length}`, 14, 30);
      doc.text(`Âge moyen: ${calculateAverageAge(prisonData.users).toFixed(1)} ans`, 14, 38);
      doc.text(`Points moyens par utilisateur: ${calculateAveragePoints(prisonData.users).toFixed(0)} points`, 14, 46);
      doc.text(`Nombre de sections actives: ${Object.keys(countUsersBySection(prisonData.users)).length}`, 14, 54);
      
      // Tableau de répartition par rôle
      const roleData = Object.entries(countUsersByRole(prisonData.users)).map(([role, count]) => [
        role.charAt(0).toUpperCase() + role.slice(1),  // Capitalize role
        count.toString()
      ]);
      
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      doc.text('Répartition par rôle', 14, 65);
      
      lastTableY = 70;
      autoTable(doc, {
        startY: 70,
        head: [['Rôle', 'Nombre d\'utilisateurs']],
        body: roleData,
        theme: 'striped',
        headStyles: { 
          fillColor: [79, 70, 229],  // indigo-600
          textColor: [255, 255, 255]
        },
        didDrawPage: function(data) {
          if (data && data.cursor) {
            lastTableY = data.cursor.y;
          }
        }
      });
      
      // Tableau de répartition par section
      const sectionData = Object.entries(countUsersBySection(prisonData.users)).map(([section, count]) => [
        section.toUpperCase() === 'NON-DÉFINIE' ? 'Non définie' : `Section ${section.toUpperCase()}`,
        count.toString()
      ]);
      
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      doc.text('Répartition par section', 14, lastTableY + 10);
      
      autoTable(doc, {
        startY: lastTableY + 15,
        head: [['Section', 'Nombre d\'utilisateurs']],
        body: sectionData,
        theme: 'striped',
        headStyles: { 
          fillColor: [79, 70, 229],  // indigo-600
          textColor: [255, 255, 255]
        },
        didDrawPage: function(data) {
          if (data && data.cursor) {
            lastTableY = data.cursor.y;
          }
        }
      });
      
      // Tableau de répartition par genre
      const genderData = Object.entries(countUsersByGender(prisonData.users)).map(([gender, count]) => {
        let genderLabel;
        switch(gender) {
          case 'M': genderLabel = 'Masculin'; break;
          case 'F': genderLabel = 'Féminin'; break;
          case 'O': genderLabel = 'Autre'; break;
          default: genderLabel = 'Non défini';
        }
        return [genderLabel, count.toString()];
      });
      
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      doc.text('Répartition par genre', 14, lastTableY + 10);
      
      autoTable(doc, {
        startY: lastTableY + 15,
        head: [['Genre', 'Nombre d\'utilisateurs']],
        body: genderData,
        theme: 'striped',
        headStyles: { 
          fillColor: [79, 70, 229],  // indigo-600
          textColor: [255, 255, 255]
        },
        didDrawPage: function(data) {
          if (data && data.cursor) {
            lastTableY = data.cursor.y;
          }
        }
      });
      
      // Tableau des points par rôle
      const pointsByRoleData = Object.entries(calculatePointsByRole(prisonData.users)).map(([role, stats]) => [
        role.charAt(0).toUpperCase() + role.slice(1),  // Capitalize role
        stats.count.toString(),
        stats.total.toString(),
        stats.average.toFixed(1)
      ]);
      
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      doc.text('Points par rôle', 14, 20);
      
      autoTable(doc, {
        startY: 25,
        head: [['Rôle', 'Utilisateurs', 'Points totaux', 'Points moyens']],
        body: pointsByRoleData,
        theme: 'striped',
        headStyles: { 
          fillColor: [79, 70, 229],  // indigo-600
          textColor: [255, 255, 255]
        }
      });
    }
    
    // ------- Sauvegarder le PDF -------
      // Déterminer le type de rapport
      let periodLabel = '';
      switch(timeRange) {
        case '24h':
          periodLabel = 'Journalier';
          break;
        case 'week':
          periodLabel = 'Hebdomadaire';
          break;
        case 'month':
          periodLabel = 'Mensuel';
          break;
      }
      
      // Récupérer le nom de la prison
      if (stats.length > 0 && stats[0].prison_id) {
        prisonName = getPrisonName(stats[0].prison_id);
      }
      
      // Créer le nom de fichier au format demandé
      const dateStr = format(new Date(), 'dd-MM-yyyy');
      const fileName = `Rapport ${periodLabel} Prison de ${prisonName} - ${dateStr}.pdf`;
      doc.save(fileName);
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    alert("Une erreur s'est produite lors de la génération du PDF. Veuillez réessayer.");
  }
};
