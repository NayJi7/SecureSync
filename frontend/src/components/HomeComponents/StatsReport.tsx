import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, Clock, Battery, Zap, TrendingUp, Users, FileText, ShieldAlert, UserCog, Layers, Crown, CalendarDays, Download, Loader2, Pencil } from 'lucide-react';
import { BsFileEarmarkPdf } from "react-icons/bs";
import { useDevice } from '@/hooks/use-device';
import {
  getPrisonData, countUserActions, countUsersByRole, countObjectChanges,
  countUsersBySection, calculateAveragePoints, calculateAverageAge, countUsersByGender,
  calculatePointsByRole, PrisonData
} from '@/services/prisonService';
import { generateStatsPDF } from '@/services/pdfService';

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
  prison_id?: string; // Ajout du champ prison_id comme optionnel
}

const StatsReport: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("apercu");
  const [timeRange, setTimeRange] = useState<'24h' | 'week' | 'month'>('24h');
  const [prisonData, setPrisonData] = useState<PrisonData | null>(null);
  const [prisonDataLoading, setPrisonDataLoading] = useState<boolean>(true);
  const [prisonId, setPrisonId] = useState<string | null>(localStorage.getItem('userPrison') || localStorage.getItem('selectedPrison'));
  const [generating, setGenerating] = useState<boolean>(false);
  const [isEditingCost, setIsEditingCost] = useState<boolean>(false);
  const [customCostRate, setCustomCostRate] = useState<number | null>(0.018);
  const { isMobile } = useDevice();

  // Effet pour s'assurer que les graphiques sont bien rendus après un changement d'onglet
  useEffect(() => {
    const triggerResize = () => {
      // Déclenche un redimensionnement de la fenêtre pour forcer les graphiques à se recalculer
      window.dispatchEvent(new Event('resize'));
    };

    // Attendez un court instant après le changement d'onglet pour rafraîchir les graphiques
    const timeoutId = setTimeout(triggerResize, 100);
    return () => clearTimeout(timeoutId);
  }, [activeTab]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('sessionToken');

        // Récupérer toutes les statistiques (nous filtrerons côté client)
        const response = await axios.get<Stat[]>('http://localhost:8000/api/stats/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Calculer la date limite selon la période sélectionnée
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
          case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 heures
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 jours
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 jours
            break;
          default:
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Par défaut: 24 heures
        }

        // Récupérer l'ID de la prison actuelle
        const prisonId = localStorage.getItem('userPrison');

        // Filtrer les statistiques selon la période sélectionnée ET l'ID de la prison
        const filteredStats = response.data
          .filter(stat => {
            const isInTimeRange = new Date(stat.date_creation) >= startDate;

            // Condition pour vérifier si la stat appartient à la prison actuelle:
            // - Si la stat n'a pas de prison_id (anciennes données), on l'inclut par défaut
            // - Si la stat a un prison_id, il doit correspondre à l'ID de prison actuelle
            const belongsToPrison = !stat.prison_id || stat.prison_id === prisonId || !prisonId;

            return isInTimeRange && belongsToPrison;
          })
          .sort((a, b) => new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime());

        // console.log(`Statistiques récupérées: ${filteredStats.length} entrées pour la période: ${timeRange} et prison ID: ${prisonId || 'toutes'}`);

        // Log pour debugging des IDs de prison dans les stats
        const prisonIds = [...new Set(filteredStats.map(stat => stat.prison_id || 'non défini'))];
        // console.log('IDs de prison dans les statistiques filtrées:', prisonIds);

        setStats(filteredStats);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        setError("Impossible de charger les statistiques. Veuillez réessayer plus tard.");
        setLoading(false);
      }
    };

    // Récupérer les statistiques et les données de la prison
    fetchStats();
    fetchPrisonData();

    // Actualisation des données toutes les 5 secondes
    const intervalId = setInterval(() => {
      fetchStats();
      fetchPrisonData();
    }, 3 * 60 * 1000); 

    return () => clearInterval(intervalId);
  }, [timeRange]); // Déclencher le useEffect lorsque la période change

  // Calculer les moyennes et tendances
  const calculateAverages = () => {
    if (!stats || stats.length === 0) return null;

    // Moyenne des dernières 24h
    const avgConsommation = stats.reduce((sum, stat) => sum + stat.consommation_total_actuelle, 0) / stats.length;
    const avgPourcentageAllumes = stats.reduce((sum, stat) => sum + stat.pourcentage_allumes, 0) / stats.length;
    const avgCoutHoraire = stats.reduce((sum, stat) => sum + stat.cout_horaire, 0) / stats.length;

    // Tendances (comparer première et dernière entrée)
    const firstStat = stats[0];
    const lastStat = stats[stats.length - 1];

    const consommationTrend = lastStat.consommation_total_actuelle - firstStat.consommation_total_actuelle;
    const pourcentageTrend = lastStat.pourcentage_allumes - firstStat.pourcentage_allumes;
    const coutTrend = lastStat.cout_horaire - firstStat.cout_horaire;

    return {
      avgConsommation,
      avgPourcentageAllumes,
      avgCoutHoraire,
      consommationTrend,
      pourcentageTrend,
      coutTrend,
      totalCout24h: avgCoutHoraire * 24, // Coût total estimé sur 24h
    };
  };

  // Transformer les données pour les graphiques
  const prepareChartData = () => {
    if (!stats || stats.length === 0) return { consommationData: [], objetTypesData: [], tendanceData: [] };

    // Définir le format de date selon la période
    let dateFormat: string;
    switch (timeRange) {
      case '24h':
        dateFormat = 'HH:mm';
        break;
      case 'week':
        dateFormat = 'EEE HH:mm';
        break;
      case 'month':
        dateFormat = 'dd/MM';
        break;
      default:
        dateFormat = 'HH:mm';
    }

    // Données pour le graphique de consommation
    const consommationData = stats.map(stat => ({
      date: format(new Date(stat.date_creation), dateFormat, { locale: fr }),
      consommation: parseFloat(stat.consommation_total_actuelle.toFixed(1)),
      objetsAllumés: stat.nbr_on,
    }));

    // Données pour le graphique en camembert des types d'objets
    const lastStat = stats[stats.length - 1];
    const objetTypesData = [
      { name: 'Portes', value: lastStat.porte_allumees, consommation: lastStat.porte_consommation },
      { name: 'Caméras', value: lastStat.camera_allumees, consommation: lastStat.camera_consommation },
      { name: 'Lumières', value: lastStat.lumiere_allumees, consommation: lastStat.lumiere_consommation },
      { name: 'Panneaux', value: lastStat.panneau_allumes, consommation: lastStat.panneau_consommation },
      { name: 'Thermostats', value: lastStat.thermostat_allumes, consommation: lastStat.thermostat_consommation },
      { name: 'Ventilation', value: lastStat.ventilation_allumees, consommation: lastStat.ventilation_consommation },
    ].filter(type => type.value > 0);

    // Données pour la tendance au fil du temps
    const tendanceData = stats.map(stat => ({
      date: format(new Date(stat.date_creation), dateFormat, { locale: fr }),
      pourcentageAllumés: parseFloat(stat.pourcentage_allumes.toFixed(1)),
      coûtHoraire: parseFloat(stat.cout_horaire.toFixed(2)),
    }));

    return { consommationData, objetTypesData, tendanceData };
  };

  const averages = calculateAverages();
  const { consommationData, objetTypesData, tendanceData } = prepareChartData();

  // Couleurs pour les camemberts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Fonction pour obtenir le titre selon la période sélectionnée
  const getTimeRangeTitle = () => {
    switch (timeRange) {
      case '24h':
        return 'dernières 24 heures';
      case 'week':
        return 'cette semaine';
      case 'month':
        return 'ce mois';
      default:
        return 'dernières 24 heures';
    }
  };

  // Fonction pour récupérer les données de la prison
  const fetchPrisonData = async () => {
    try {
      setPrisonDataLoading(true);
      const data = await getPrisonData();
      setPrisonData(data);
      setPrisonDataLoading(false);
      // console.log('Données de la prison récupérées:', data);
      // console.log('Nombre d\'utilisateurs (sans admin):', data.users.length);
      // console.log('Nombre de logs utilisateur (sans admin):', data.userLogs.length);
      // console.log('Nombre de logs d\'objets (sans admin):', data.objectLogs.length);

      // Vérification des rôles d'utilisateurs pour confirmer le filtrage
      const roles = data.users.map(user => user.role);
      // console.log('Rôles des utilisateurs filtrés:', [...new Set(roles)]);
    } catch (error) {
      console.error('Erreur lors de la récupération des données de la prison:', error);
      setPrisonDataLoading(false);
    }
  };

  // Fonction pour gérer le téléchargement du rapport PDF
  const handleDownloadPdf = async () => {
    setGenerating(true);
    try {
      // Ajout d'un petit délai pour permettre à l'interface de se mettre à jour
      await new Promise(resolve => setTimeout(resolve, 100));

      // Récupérer les calculs de base
      const baseAverages = calculateAverages();

      if (baseAverages) {
        // Appliquer le coût horaire personnalisé s'il existe
        if (customCostRate !== null) {
          baseAverages.avgCoutHoraire = customCostRate;
          baseAverages.totalCout24h = customCostRate * 24;
        }

        // Génération du PDF
        generateStatsPDF(timeRange, stats, baseAverages, prepareChartData(), prisonData);
      }

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8 flex flex-col items-center justify-center h-64">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <BarChart2 className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Rapport statistique - {isMobile ? <br /> : ''} {getTimeRangeTitle()}
                </h2>
              </div>
            </div>

            {/* Sélecteur de période même quand pas de stats */}
            <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Période :</span>
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    onClick={() => setTimeRange('24h')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-lg ${timeRange === '24h'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                      }`}
                  >
                    24h
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeRange('week')}
                    className={`px-4 py-2 text-sm font-medium ${timeRange === 'week'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 border-t border-b border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                      }`}
                  >
                    Semaine
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeRange('month')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-lg ${timeRange === 'month'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                      }`}
                  >
                    Mois
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-64">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>Aucune statistique disponible pour {getTimeRangeTitle()}.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <BarChart2 className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Rapport statistique - {isMobile ? <br /> : ''} {getTimeRangeTitle()}
              </h2>
            </div>
          </div>

          {/* Sélecteur de période et bouton de téléchargement */}
          <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Période :</span>
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setTimeRange('24h')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${timeRange === '24h'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                    }`}
                >
                  24h
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('week')}
                  className={`px-4 py-2 text-sm font-medium ${timeRange === 'week'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border-t border-b border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                    }`}
                >
                  Semaine
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('month')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${timeRange === 'month'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                    }`}
                >
                  Mois
                </button>
              </div>
            </div>

          </div>
        </div>
        <div className={`justify-between ${isMobile ? 'flex-col' : 'flex'}`}>
          <p className={`text-sm text-gray-500 dark:text-gray-400 mt-2 ${isMobile ? 'text-center mt-4' : ''}`}>
            Données collectées du {format(new Date(stats[0].date_creation), 'dd MMMM yyyy à HH:mm', { locale: fr })} au {format(new Date(stats[stats.length - 1].date_creation), 'dd MMMM yyyy à HH:mm', { locale: fr })}
          </p>
          {/* Bouton de téléchargement du rapport PDF */}
          <Button
            variant="outline"
            className={`flex mt-2 items-center gap-2 border-indigo-600 ${isMobile ? 'mx-auto' : ''}  ${generating ? 'bg-indigo-50 text-indigo-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'
              } dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950`}
            onClick={handleDownloadPdf}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BsFileEarmarkPdf className="h-4 w-4" />
            )}
            {generating ? 'Génération...' : 'Télécharger PDF'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Version mobile des onglets - affichée uniquement sur mobile */}
        <div className="md:hidden mb-4">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm"
          >
            <option value="apercu">📊 Aperçu - {getTimeRangeTitle()}</option>
            <option value="consommation">⚡ Consommation - {getTimeRangeTitle()}</option>
            <option value="objets">🔋 Types d'objets - {getTimeRangeTitle()}</option>
            <option value="tendances">📈 Tendances - {getTimeRangeTitle()}</option>
            <option value="prison">👥 Employés</option>
          </select>
        </div>

        {/* Version desktop des onglets - masquée sur mobile */}
        <TabsList className="mb-4 hidden md:flex">
          <TabsTrigger value="apercu" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Aperçu global
          </TabsTrigger>
          <TabsTrigger value="consommation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Consommation
          </TabsTrigger>
          <TabsTrigger value="objets" className="flex items-center gap-2">
            <Battery className="h-4 w-4" />
            Types d'objets
          </TabsTrigger>
          <TabsTrigger value="tendances" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tendances
          </TabsTrigger>
          <TabsTrigger value="prison" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employés
          </TabsTrigger>
        </TabsList>

        {/* Onglet Aperçu global */}
        <TabsContent value="apercu" className="space-y-4" style={{ minHeight: '400px' }}>
          {averages && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              <Card className="p-3 sm:p-4 border-l-4 border-l-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Consommation moyenne</p>
                    <p className="text-xl sm:text-2xl font-bold">{averages.avgConsommation.toFixed(1)} kWh</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`text-xs ${averages.consommationTrend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {averages.consommationTrend > 0 ? '↑' : '↓'} {Math.abs(averages.consommationTrend).toFixed(1)}kWh
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">depuis le début</span>
                </div>
              </Card>

              <Card className="p-3 sm:p-4 border-l-4 border-l-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Objets allumés</p>
                    <p className="text-xl sm:text-2xl font-bold">{averages.avgPourcentageAllumes.toFixed(1)}%</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                    <Battery className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`text-xs ${averages.pourcentageTrend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {averages.pourcentageTrend > 0 ? '↑' : '↓'} {Math.abs(averages.pourcentageTrend).toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">depuis le début</span>
                </div>
              </Card>

              <Card className="p-3 sm:p-4 border-l-4 border-l-purple-500 sm:col-span-2 md:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Coût estimé (24h)</p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {(customCostRate !== null ? customCostRate * 24 : averages?.avgCoutHoraire * 24).toFixed(2)}€
                    </p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                  </div>
                </div>
                <div className="mt-2">
                  {isEditingCost ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <span>Basé sur un coût horaire de </span>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={customCostRate !== null ? customCostRate : (averages.avgCoutHoraire * 180).toFixed(3)}
                        onChange={(e) => setCustomCostRate(parseFloat(e.target.value))}
                        className="w-16 mx-1 p-0.5 text-xs border border-purple-400 rounded dark:bg-gray-700"
                      />
                      <span>€</span>
                      <button
                        className="ml-1 text-green-500 hover:text-green-700"
                        onClick={() => setIsEditingCost(false)}
                        aria-label="Valider"
                      >
                        ✓
                      </button>
                      <button
                        className="ml-1 text-red-500 hover:text-red-700"
                        onClick={() => {
                          setIsEditingCost(false);
                          setCustomCostRate(null);
                        }}
                        aria-label="Annuler"
                      >
                        ✗
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      Basé sur un coût horaire de {customCostRate !== null ? customCostRate.toFixed(3) : averages.avgCoutHoraire.toFixed(3)}€
                      <Pencil
                        className="h-3 w-3 ml-1 cursor-pointer hover:text-purple-600 transition-colors"
                        onClick={() => setIsEditingCost(true)}
                      />
                    </span>
                  )}
                </div>
              </Card>
            </div>
          )}

          <Card className="p-3 sm:p-4">
            <h3 className="text-lg font-medium mb-3 sm:mb-4">Vue d'ensemble des dernières mesures</h3>
            <div className="h-[250px] sm:h-[300px] w-full relative" style={{ minWidth: "100px", minHeight: "200px" }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
                <BarChart
                  data={timeRange === '24h'
                    ? consommationData.slice(-8)  // Pour 24h, limiter à 8 entrées
                    : timeRange === 'week'
                      ? consommationData.slice(-14) // Pour semaine, limiter à 14 entrées
                      : consommationData.slice(-30) // Pour mois, limiter à 30 entrées
                  }
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{ fontSize: 10 }} width={30} />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fontSize: 10 }} width={30} />
                  <Tooltip contentStyle={{ fontSize: '12px', backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar yAxisId="left" dataKey="consommation" name="Conso (kWh)" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="objetsAllumés" name="Objets ON" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        {/* Onglet Consommation */}
        <TabsContent value="consommation" className="space-y-4" style={{ minHeight: '400px' }}>
          <Card className="p-3 sm:p-4">
            <h3 className="text-lg font-medium mb-3 sm:mb-4">Évolution de la consommation</h3>
            <div className="h-[250px] sm:h-[350px] w-full relative" style={{ minHeight: "200px" }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
                <LineChart data={consommationData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={30} />
                  <Tooltip contentStyle={{ fontSize: '12px', backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="consommation" name="Conso (kWh)" stroke="#8884d8" activeDot={{ r: 6 }} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Statistiques de consommation</h3>
              <table className="min-w-full">
                <tbody>
                  {averages && (
                    <>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600 dark:text-gray-300">Consommation minimale</td>
                        <td className="py-2 font-medium text-right">
                          {Math.min(...stats.map(s => s.consommation_total_actuelle)).toFixed(1)} kWh
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600 dark:text-gray-300">Consommation maximale</td>
                        <td className="py-2 font-medium text-right">
                          {Math.max(...stats.map(s => s.consommation_total_actuelle)).toFixed(1)} kWh
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600 dark:text-gray-300">Consommation moyenne</td>
                        <td className="py-2 font-medium text-right">{averages.avgConsommation.toFixed(1)} kWh</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600 dark:text-gray-300">Coût horaire moyen</td>
                        <td className="py-2 font-medium text-right">
                          {customCostRate !== null ? customCostRate.toFixed(3) : averages.avgCoutHoraire.toFixed(3)} €
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600 dark:text-gray-300">Coût estimé sur 24h</td>
                        <td className="py-2 font-medium text-right">
                          {customCostRate !== null ? (customCostRate * 24).toFixed(2) : averages.totalCout24h.toFixed(2)} €
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Répartition de la consommation</h3>
              <div className="h-[300px] w-full relative" style={{ minHeight: "200px" }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
                  <PieChart>
                    <Pie
                      data={objetTypesData}
                      dataKey="consommation"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ name, consommation }) => `${name}: ${consommation.toFixed(1)}kWh`}
                    >
                      {objetTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Types d'objets */}
        <TabsContent value="objets" className="space-y-4" style={{ minHeight: '400px' }}>
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Répartition des objets connectés</h3>
            <div className="h-[300px] w-full relative" style={{ minHeight: "200px" }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
                <PieChart>
                  <Pie
                    data={objetTypesData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {objetTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Détails par type d'objet (dernière mesure)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Type d'objet</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Objets allumés</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Consommation (kWh)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Conso. moyenne par objet</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {objetTypesData.map((type, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">{type.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{type.value}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{type.consommation.toFixed(1)} kWh</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {type.value > 0 ? (type.consommation / type.value).toFixed(1) : 0} kWh
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Onglet Tendances */}
        <TabsContent value="tendances" className="space-y-4" style={{ minHeight: '400px' }}>
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Évolution du pourcentage d'objets allumés</h3>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tendanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }} />
                  <Legend />
                  <Line type="monotone" dataKey="pourcentageAllumés" name="Objets allumés (%)" stroke="#82ca9d" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Évolution du coût horaire</h3>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tendanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `${parseFloat(value).toFixed(3)} €`} contentStyle={{ backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }} />
                  <Legend />
                  <Line type="monotone" dataKey="coûtHoraire" name="Coût horaire (€)" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {averages && (
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Résumé des tendances</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className={`p-3 sm:p-4 rounded-lg ${averages.consommationTrend > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                  <h4 className="font-medium flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    Consommation
                  </h4>
                  <div className="mt-2 flex items-center">
                    <span className={`text-xl sm:text-2xl font-bold ${averages.consommationTrend > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {averages.consommationTrend > 0 ? '↑' : '↓'} {Math.abs(averages.consommationTrend).toFixed(1)} kWh
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    {averages.consommationTrend > 0
                      ? 'Augmentation de la consommation'
                      : 'Diminution de la consommation'}
                  </p>
                </div>

                <div className={`p-3 sm:p-4 rounded-lg ${averages.pourcentageTrend > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                  <h4 className="font-medium flex items-center">
                    <Battery className="h-4 w-4 mr-1" />
                    Objets allumés
                  </h4>
                  <div className="mt-2 flex items-center">
                    <span className={`text-xl sm:text-2xl font-bold ${averages.pourcentageTrend > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {averages.pourcentageTrend > 0 ? '↑' : '↓'} {Math.abs(averages.pourcentageTrend).toFixed(1)}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    {averages.pourcentageTrend > 0
                      ? 'Plus d\'objets allumés qu\'avant'
                      : 'Moins d\'objets allumés qu\'avant'}
                  </p>
                </div>

                <div className={`p-3 sm:p-4 rounded-lg ${averages.coutTrend > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'} sm:col-span-2 md:col-span-1`}>
                  <h4 className="font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Coût horaire
                  </h4>
                  <div className="mt-2 flex items-center">
                    <span className={`text-xl sm:text-2xl font-bold ${averages.coutTrend > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {averages.coutTrend > 0 ? '↑' : '↓'} {Math.abs(averages.coutTrend).toFixed(3)}€
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    {averages.coutTrend > 0
                      ? 'Augmentation du coût énergétique'
                      : 'Diminution du coût énergétique'}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Prison - Données des utilisateurs et objets */}
        <TabsContent value="prison" className="space-y-4" style={{ minHeight: '400px' }}>
          {prisonDataLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : prisonData ? (
            <>
              {/* Section utilisateurs */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-medium">Utilisateurs de la prison</h3>
                  </div>
                </div>

                {/* Statistiques clés des utilisateurs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-emerald-500 p-2 bg-emerald-100 rounded-lg">
                        <Users size={18} />
                      </div>
                      <span className="text-xs text-emerald-700">Personnel</span>
                    </div>
                    <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">{prisonData.users.length}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Employés au total</p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-blue-500 p-2 bg-blue-100 rounded-lg">
                        <CalendarDays size={18} />
                      </div>
                      <span className="text-xs text-blue-700">Âge moyen</span>
                    </div>
                    <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">{calculateAverageAge(prisonData.users).toFixed(1)}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Années</p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-purple-500 p-2 bg-purple-100 rounded-lg">
                        <Crown size={18} />
                      </div>
                      <span className="text-xs text-purple-700">Points moyens</span>
                    </div>
                    <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">{calculateAveragePoints(prisonData.users).toFixed(0)}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Points par utilisateur</p>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-amber-500 p-2 bg-amber-100 rounded-lg">
                        <Layers size={18} />
                      </div>
                      <span className="text-xs text-amber-700">Sections</span>
                    </div>
                    <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">{Object.keys(countUsersBySection(prisonData.users)).length}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sections surveillées</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {/* Diagramme - Répartition par rôle */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      <UserCog className="h-4 w-4 mr-1.5 text-blue-500" />
                      Répartition par rôle
                    </h4>
                    <div className="h-[210px] w-full relative" style={{ minHeight: "200px" }}>
                      <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
                        <PieChart>
                          <Pie
                            data={Object.entries(countUsersByRole(prisonData.users)).map(([role, count]) => ({
                              name: role.charAt(0).toUpperCase() + role.slice(1),
                              value: count
                            }))}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            fill="#8884d8"
                            label={(entry) => entry.name}
                          >
                            {Object.entries(countUsersByRole(prisonData.users)).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip formatter={(value) => [`${value} utilisateur(s)`, 'Nombre']} contentStyle={{ backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Diagramme - Répartition par section */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      <Layers className="h-4 w-4 mr-1.5 text-amber-500" />
                      Répartition par section
                    </h4>
                    <div className="h-[200px] w-full relative" style={{ minHeight: "200px" }}>
                      <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
                        <BarChart
                          data={Object.entries(countUsersBySection(prisonData.users)).map(([section, count]) => ({
                            name: section.toUpperCase() === 'NON-DÉFINIE' ? 'Non définie' : `Section ${section.toUpperCase()}`,
                            value: count
                          }))}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} utilisateur(s)`, 'Nombre']} contentStyle={{ backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }} />
                          <Bar dataKey="value" fill="#F59E0B" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Diagramme - Répartition par genre */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      <Users className="h-4 w-4 mr-1.5 text-green-500" />
                      Répartition par genre
                    </h4>                      <div id="gender-distribution-chart" className="h-[210px] w-full relative" style={{ minHeight: "200px" }}>
                      <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
                        <PieChart>
                          <Pie
                            data={Object.entries(countUsersByGender(prisonData.users)).map(([gender, count]) => ({
                              name: gender === 'M' ? 'Masculin' : gender === 'F' ? 'Féminin' : gender === 'O' ? 'Autre' : 'Non défini',
                              value: count
                            }))}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            fill="#10B981"
                          >
                            {Object.entries(countUsersByGender(prisonData.users)).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#10B981', '#8B5CF6', '#F59E0B', '#6B7280'][index % 4]} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip formatter={(value) => [`${value} utilisateur(s)`, 'Nombre']} contentStyle={{ backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Points par rôle */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                    <Crown className="h-4 w-4 mr-1.5 text-purple-500" />
                    Points moyens par rôle
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rôle</th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre d'utilisateurs</th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Points totaux</th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Points moyens</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {Object.entries(calculatePointsByRole(prisonData.users)).map(([role, stats], index) => (
                          <tr key={role} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}>
                            <td className="px-3 py-3 text-sm capitalize">{role}</td>
                            <td className="px-3 py-3 text-sm">{stats.count}</td>
                            <td className="px-3 py-3 text-sm">{stats.total}</td>
                            <td className="px-3 py-3 text-sm font-medium">{stats.average.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Liste des utilisateurs */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3 flex items-center">
                    <Users className="h-4 w-4 mr-1.5 text-blue-500" />
                    Liste des utilisateurs
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom d'utilisateur</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom complet</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rôle</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Section</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Genre</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Âge</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Points</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {prisonData.users.map((user, index) => {
                          // Calcul de l'âge
                          let age = '-';
                          if (user.date_naissance) {
                            const birthdate = new Date(user.date_naissance);
                            const today = new Date();
                            let calculatedAge = today.getFullYear() - birthdate.getFullYear();
                            const m = today.getMonth() - birthdate.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
                              calculatedAge--;
                            }
                            age = `${calculatedAge}`;
                          }

                          // Formatage du genre
                          const genderMap: Record<string, string> = {
                            'M': 'Masculin',
                            'F': 'Féminin',
                            'O': 'Autre',
                            'N': 'Non précisé'
                          };

                          return (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}>
                              <td className="px-3 py-2 text-sm">{user.username}</td>
                              <td className="px-3 py-2 text-sm">{`${user.first_name || ''} ${user.last_name || ''}`.trim() || '-'}</td>
                              <td className="px-3 py-2 text-sm capitalize">{user.role || '-'}</td>
                              <td className="px-3 py-2 text-sm capitalize">{user.section ? `Section ${user.section.toUpperCase()}` : 'Non définie'}</td>
                              <td className="px-3 py-2 text-sm">{genderMap[user.sexe] || 'Non défini'}</td>
                              <td className="px-3 py-2 text-sm">{age}</td>
                              <td className="px-3 py-2 text-sm font-medium">{user.points || 0}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Activités récentes des utilisateurs */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Activités récentes</h4>
                  <div className="space-y-2">
                    {Object.entries(countUserActions(prisonData.userLogs)).slice(0, 5).map(([action, count]) => (
                      <div key={action} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5"></div>
                          <span className="text-sm capitalize">{action.replace('_', ' ')}</span>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total des actions</span>
                      <span className="text-sm font-bold">{prisonData.userLogs.length}</span>
                    </div>
                  </div>
                </div>

                {/* Activités des objets */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Activités des objets</h4>
                  <div className="space-y-2">
                    {Object.entries(countObjectChanges(prisonData.objectLogs)).slice(0, 5).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></div>
                          <span className="text-sm capitalize">{type}</span>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total des actions</span>
                      <span className="text-sm font-bold">{prisonData.objectLogs.length}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Erreur lors du chargement des données de la prison
              </p>
              <button
                onClick={fetchPrisonData}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Réessayer
              </button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsReport;