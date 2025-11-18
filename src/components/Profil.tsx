import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IconProfil from "../../SVG/people-nearby-svgrepo-com.svg"

interface Enfant {
    prenom: string;
    nom: string;
    dateNaissance: string;
    adopte: boolean;
    ageAdoption?: number;
}

interface User {
    nom?: string;
    prenom?: string;
    dateNaissance?: string;
    sexe?: string;
    handicape?: boolean;
    enfants?: Enfant[];
    statut?: string;
}

export default function Profil() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User>({});

    useEffect(() => {
        const data = localStorage.getItem("mesInfos");
        if (data) {
            const parsed = JSON.parse(data);
            setUser({
                nom: parsed.nom || "",
                prenom: parsed.prenom || "",
                dateNaissance: parsed.dateNaissance || "",
                sexe: parsed.sexe || "",
                handicape: parsed.handicape || false,
                enfants: parsed.enfants || [],
                statut: "Retraité",
            });
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pt-24 p-6 flex flex-col items-center">
            <h1 className="text-4xl font-extrabold text-blue-900 mb-10 text-center flex items-center justify-center gap-3">
                <img src={IconProfil} alt="Profil" className="w-10 h-10" />
                Mon Profil
            </h1>

            <div className="bg-white shadow-2xl rounded-[2rem] p-10 w-full max-w-4xl space-y-10">

                {/* Informations personnelles */}
                <section className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-inner space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center">Informations personnelles</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <p><strong>Nom :</strong> {user.nom}</p>
                        <p><strong>Prénom :</strong> {user.prenom}</p>
                        <p><strong>Date de naissance :</strong> {user.dateNaissance}</p>
                        <p><strong>Sexe :</strong> {user.sexe}</p>
                        <p><strong>Statut :</strong> {user.statut}</p>
                        <p>
                            <strong>Handicap :</strong> {user.handicape ? "Travailleur handicapé" : "Travailleur non handicapé"}
                        </p>
                    </div>
                </section>

                {/* Enfants */}
                <section className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-inner space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center">Enfants</h2>
                    {user.enfants && user.enfants.length > 0 ? (
                        <ul className="space-y-3">
                            {user.enfants.map((e, i) => (
                                <li key={i} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
                                    <div>
                                        <p><strong>Nom :</strong> {e.nom}</p>
                                        <p><strong>Prénom :</strong> {e.prenom}</p>
                                        <p><strong>Date de naissance :</strong> {e.dateNaissance}</p>
                                        {e.adopte && e.ageAdoption && (
                                            <p><strong>Adopté(e) à :</strong> {e.ageAdoption} ans</p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-600">Aucun enfant enregistré.</p>
                    )}
                </section>

                {/* Actions */}
                <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-inner space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center">Paramètres</h2>
                    <button
                        onClick={() => navigate("/mes-informations")}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition"
                    >
                        Modifier mes informations
                    </button>
                </section>
            </div>
        </div>
    );
}