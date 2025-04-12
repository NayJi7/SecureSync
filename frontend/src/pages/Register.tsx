// src/components/RegisterForm.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface FormData {
  username: string;
  email: string;
  password1: string;
  password2: string;
  nom: string;
  prenom: string;
  sexe: string;
  date_naissance: string;
  photo: File | null;
}

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password1: '',
    password2: '',
    nom: '',
    prenom: '',
    sexe: '',
    date_naissance: '',
    photo: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      if ((formData as any)[key] !== null) {
        data.append(key, (formData as any)[key]);
      }
    }

    try {
      const response = await axios.post('http://localhost:8000/api/register/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Inscription réussie !', response.data);
    } 
    catch (error: any) {
        if (error.response) {
          console.error('Erreur lors de l’inscription :', error.response.data); // <= Ajoute bien cette ligne
          alert(JSON.stringify(error.response.data, null, 2)); // tu peux aussi voir en popup pour debug
        } else {
          console.error('Erreur inconnue :', error);
        }
      }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="username" placeholder="Nom d'utilisateur" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password1" placeholder="Mot de passe" onChange={handleChange} required />
      <input type="password" name="password2" placeholder="Confirmez le mot de passe" onChange={handleChange} required />
      <input type="text" name="nom" placeholder="Nom" onChange={handleChange} />
      <input type="text" name="prenom" placeholder="Prénom" onChange={handleChange} />
      <select name="sexe" onChange={handleChange}>
        <option value="">Choisir le sexe</option>
        <option value="M">Homme</option>
        <option value="F">Femme</option>
        <option value="O">Autre</option>
      </select>
      <input type="date" name="date_naissance" onChange={handleChange} />
      <input type="file" name="photo" onChange={handleChange} />
      <button type="submit">S'inscrire</button>
    </form>
  );
};

export default RegisterForm;
