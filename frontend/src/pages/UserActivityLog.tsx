import React, { useEffect, useState } from 'react';
import axios from 'axios';

type User = {
    id: number;
    username: string;
};

type Log = {
    id: number;
    user: User;
    action: string;
    timestamp: string;
};

const ACTION_LABELS: { [key: string]: string } = {
    login: 'Connexion',
    logout: 'Déconnexion',
    update_profile: 'Modification du profil',
    password_change: 'Changement de mot de passe',
    create: 'Création de compte',
    delete: 'Suppression de compte',
    otp_request: 'Demande de code OTP',
    otp_validate: 'Validation OTP',
};

const UserActivityLog: React.FC = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        axios.get('http://localhost:8000/api/Userslogs/') // à adapter selon ton endpoint
            .then(response => {
                setLogs(response.data);
            })
            .catch(error => {
                console.error('Erreur lors du chargement des logs :', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Chargement...</p>;

    return (
        <div>
            <h1>Logs d'activité des utilisateurs</h1>
            <table>
                <thead>
                    <tr>
                        <th>Utilisateur</th>
                        <th>Action</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.length > 0 ? (
                        logs.map((log) => (
                            <tr key={log.id}>
                                <td>{log.user.username}</td>
                                <td>{ACTION_LABELS[log.action] || log.action}</td>
                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={3}>Aucun log trouvé.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserActivityLog;
