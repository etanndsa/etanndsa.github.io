import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Profil from "./components/Profil";
import MesInformations from "./components/MesInformations";
import MaRetraite from "./components/MaRetraite";

// -------------------------
// Page d'accueil / Simulateur
// -------------------------
function Simulateur() {
    const infosPerso  = JSON.parse(localStorage.getItem("mesInfos") || "{}");
    const periodes = JSON.parse(localStorage.getItem("periodesStockees") || "[]");


    const champsObligatoires = [
        { key: "nom", label: "Nom" },
        { key: "prenom", label: "Prénom" },
        { key: "dateNaissance", label: "Date de naissance" }
        // tu peux ajouter d’autres champs ici
    ];

    const infosManquantesInfosPerso = champsObligatoires
        .filter(ch => !infosPerso[ch.key] || infosPerso[ch.key].trim() === "")
        .map(ch => ch.label);

     // 🔹 Vérification des périodes
    const aucunePeriode = !Array.isArray(periodes) || periodes.length === 0;

    // 🔹 On regroupe tout ce qui manque
    const infosManquantes = [...infosManquantesInfosPerso];
    const profilComplet = infosManquantes.length === 0;
    if (aucunePeriode) {
        infosManquantes.push("Périodes de travail / Trimestres");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center pt-24 p-6">
            <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-4xl space-y-6 text-center">

                <h1 className="text-3xl font-bold text-gray-800">Bienvenue sur Retraite+</h1>

                {!profilComplet ? (
                    <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
                        ⚠️ Votre profil est incomplet. Veuillez compléter les informations suivantes pour calculer votre retraite :
                        <ul className="list-disc list-inside mt-2 text-left">
                            {infosManquantes.map((info, i) => (
                                <li key={i}>{info}</li>
                            ))}
                        </ul>
                        <div className="mt-4">
                            <Link
                                to="/profil"
                                className="text-white bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                            >
                                Compléter mon profil
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-green-100 text-green-800 rounded-lg">
                        ✅ Votre profil est complet. Vous pouvez maintenant calculer votre retraite.
                        <div className="mt-4">
                            <Link
                                to="/ma-retraite"
                                className="text-white bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                            >
                                Voir ma retraite
                            </Link>
                        </div>
                    </div>
                )}

                <p className="text-gray-500 mt-6">
                    Retraite+ vous aide à estimer votre pension en fonction de vos informations personnelles et carrière.
                </p>

                {/* ----------------- Bloc Actualités ----------------- */}
                <div className="bg-white shadow-md rounded-xl p-6 mt-8 space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800">Actualités Retraite</h2>
                    <ul className="space-y-2">
                        {[
                            "PASS 2025 mis à jour à 47 100 € / an",
                            "Réforme retraite : départ anticipé travailleurs handicapés",
                            "Surcote : +1,25 % par trimestre supplémentaire au-delà du taux plein"
                        ].map((actu, index) => (
                            <li key={index} className="flex items-start space-x-2">
                                <span className="text-blue-500 font-bold">🔹</span>
                                <span className="text-gray-700">{actu}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ----------------- Liens rapides ----------------- */}
                <div className="bg-white shadow-inner rounded-xl p-6 flex flex-col md:flex-row justify-around items-center gap-4 mt-6">
                    <Link
                        to="/profil"
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition w-full md:w-auto text-center"
                    >
                        Mon profil
                    </Link>
                    <Link
                        to="/ma-retraite"
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition w-full md:w-auto text-center"
                    >
                        Calculer ma retraite
                    </Link>
                    <Link
                        to="/mes-informations"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition w-full md:w-auto text-center"
                    >
                        Mes informations
                    </Link>
                </div>
            </div>
        </div>
    );
}

// -------------------------
// App principal
// -------------------------
export default function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Simulateur />} />
                <Route path="/profil" element={<Profil />} />
                <Route path="/mes-informations" element={<MesInformations />} />
                <Route path="/ma-retraite" element={<MaRetraite />} />
            </Routes>
        </Router>
    );
}