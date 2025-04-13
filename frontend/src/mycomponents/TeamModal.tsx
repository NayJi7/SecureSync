import React, { useState } from 'react';
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HiTrash } from "react-icons/hi";
import { MdSecurity, MdOutlinePersonAdd } from "react-icons/md";
import axios from 'axios';

// Types pour les données du personnel
type StaffMember = {
  id: number;
  name: string;
  role: string;
  department?: string;
  isLeader: boolean;
  photo?: string;
};

// Interface pour le formulaire d'ajout de garde
interface GuardFormData {
  username: string;
  email: string;
  password1: string;
  password2: string;
  nom: string;
  prenom: string;
  sexe: string;
  date_naissance: string;
  department: string;
  photo: File | null;
}

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember[];
  setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
}

const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose, staff, setStaff }) => {
  const [showAddGuardForm, setShowAddGuardForm] = useState(false);
  const [guardFormData, setGuardFormData] = useState<GuardFormData>({
    username: '',
    email: '',
    password1: '',
    password2: '',
    nom: '',
    prenom: '',
    sexe: '',
    date_naissance: '',
    department: 'Section A',
    photo: null,
  });

  // Fonctions pour gérer le personnel
  const handleDeleteGuard = (id: number) => {
    setStaff(staff.filter(member => member.id !== id));
  };

  const handleAddGuard = () => {
    if (showAddGuardForm) {
      // Fermer le formulaire s'il est déjà ouvert
      setShowAddGuardForm(false);
      // Réinitialiser le formulaire
      setGuardFormData({
        username: '',
        email: '',
        password1: '',
        password2: '',
        nom: '',
        prenom: '',
        sexe: '',
        date_naissance: '',
        department: 'Section A',
        photo: null,
      });
    } else {
      // Ouvrir le formulaire
      setShowAddGuardForm(true);
    }
  };

  // Gérer les changements dans le formulaire d'ajout de garde
  const handleGuardFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files) {
      setGuardFormData({ ...guardFormData, [name]: files[0] });
    } else {
      setGuardFormData({ ...guardFormData, [name]: value });
    }
  };

  // Soumettre le formulaire d'ajout de garde
  const handleGuardFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Créer un FormData pour l'envoi au serveur
    const data = new FormData();
    for (const key in guardFormData) {
      if ((guardFormData as any)[key] !== null) {
        data.append(key, (guardFormData as any)[key]);
      }
    }
    
    // Ajouter le département qui n'est pas un champ standard d'utilisateur
    data.append('department', guardFormData.department);
    data.append('is_leader', 'false'); // Les gardes ne sont pas des responsables
    data.append('role', 'Garde');
    
    try {
      // Envoyer les données au serveur
      const response = await axios.post('http://localhost:8000/api/register/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Garde ajouté avec succès !', response.data);
      
      // Ajouter le nouveau garde à la liste locale avec les données retournées par le serveur
      const newGuard: StaffMember = {
        id: response.data.id || Math.max(...staff.map(m => m.id)) + 1,
        name: `${guardFormData.prenom} ${guardFormData.nom}`,
        role: "Garde",
        department: guardFormData.department,
        isLeader: false,
        photo: response.data.photo_url || undefined
      };
      
      setStaff([...staff, newGuard]);
      
      // Fermer le formulaire et réinitialiser
      setShowAddGuardForm(false);
      setGuardFormData({
        username: '',
        email: '',
        password1: '',
        password2: '',
        nom: '',
        prenom: '',
        sexe: '',
        date_naissance: '',
        department: 'Section A',
        photo: null,
      });
    } 
    catch (error: any) {
      if (error.response) {
        console.error('Erreur lors de l\'ajout du garde:', error.response.data);
        alert('Erreur lors de l\'ajout du garde: ' + JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('Erreur inconnue:', error);
        alert('Une erreur s\'est produite lors de l\'ajout du garde.');
      }
    }
  };

  return (
    <Modal dismissible show={isOpen} onClose={onClose} size="xl">
      <ModalHeader>Personnel de la prison</ModalHeader>
      <ModalBody>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <MdSecurity className="text-blue-600" size={20} /> Responsables
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staff.filter(member => member.isLeader).map((leader) => (
                <div key={leader.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Avatar>
                    <AvatarImage src={leader.photo} alt={leader.name} />
                    <AvatarFallback>{leader.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{leader.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{leader.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <MdSecurity className="text-gray-600" size={20} /> Gardes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staff.filter(member => !member.isLeader).map((guard) => (
                <div key={guard.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 relative group">
                  <Avatar>
                    <AvatarImage src={guard.photo} alt={guard.name} />
                    <AvatarFallback>{guard.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{guard.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{guard.role} - {guard.department}</p>
                  </div>
                  <button 
                    className="text-red-600 hover:text-red-800 transition-colors"
                    onClick={() => handleDeleteGuard(guard.id)}
                    title="Supprimer ce garde"
                  >
                    <HiTrash size={20} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-center">
              <button 
                className="flex items-center gap-2 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                onClick={handleAddGuard}
              >
                <MdOutlinePersonAdd size={20} />
                {showAddGuardForm ? "Annuler" : "Ajouter un garde"}
              </button>
            </div>

            {showAddGuardForm && (
              <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <h4 className="font-medium text-lg mb-4 text-gray-900 dark:text-white">Ajouter un nouveau garde</h4>
                <form onSubmit={handleGuardFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                      <input 
                        type="text" 
                        name="prenom" 
                        value={guardFormData.prenom}
                        onChange={handleGuardFormChange} 
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white" 
                        placeholder="Prénom" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                      <input 
                        type="text" 
                        name="nom" 
                        value={guardFormData.nom}
                        onChange={handleGuardFormChange} 
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white" 
                        placeholder="Nom" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={guardFormData.email}
                        onChange={handleGuardFormChange} 
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white" 
                        placeholder="email@exemple.com" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom d'utilisateur</label>
                      <input 
                        type="text" 
                        name="username" 
                        value={guardFormData.username}
                        onChange={handleGuardFormChange} 
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white" 
                        placeholder="Nom d'utilisateur" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
                      <input 
                        type="password" 
                        name="password1" 
                        value={guardFormData.password1}
                        onChange={handleGuardFormChange} 
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white" 
                        placeholder="Mot de passe" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer mot de passe</label>
                      <input 
                        type="password" 
                        name="password2" 
                        value={guardFormData.password2}
                        onChange={handleGuardFormChange} 
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white" 
                        placeholder="Confirmer le mot de passe" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sexe</label>
                      <select 
                        name="sexe" 
                        value={guardFormData.sexe}
                        onChange={handleGuardFormChange} 
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white" 
                        required
                      >
                        <option value="">Choisir</option>
                        <option value="M">Homme</option>
                        <option value="F">Femme</option>
                        <option value="O">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de naissance</label>
                      <input 
                        type="date" 
                        name="date_naissance" 
                        value={guardFormData.date_naissance}
                        onChange={handleGuardFormChange} 
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                      <select 
                        name="department" 
                        value={guardFormData.department}
                        onChange={handleGuardFormChange} 
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white" 
                        required
                      >
                        <option value="Section A">Section A</option>
                        <option value="Section B">Section B</option>
                        <option value="Section C">Section C</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      type="button"
                      onClick={() => setShowAddGuardForm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default TeamModal;
