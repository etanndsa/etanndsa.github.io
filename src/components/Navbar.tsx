import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { User, RefreshCw, Trash2, Users } from "lucide-react"; // Ajout d'icônes pour l'UX

export default function Navbar() {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false); // État pour le feedback visuel de chargement
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // init selected profile from localStorage
        const savedId = localStorage.getItem("selectedProfileId");
        if (savedId) setSelectedProfileId(savedId);

        // Load profiles function to be reused
        const loadProfiles = () => {
             const stored = localStorage.getItem("profiles");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        setProfiles(parsed);
                    }
                } catch (e) {
                    console.warn("Erreur en parsant profiles depuis localStorage", e);
                }
            } else {
                // Initial fetch if no local storage
                 fetch("/profiles.json")
                .then(res => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        setProfiles(data);
                        try { localStorage.setItem("profiles", JSON.stringify(data)); } catch { }
                    }
                })
                .catch(err => console.warn("Impossible de charger profiles.json", err));
            }
        }

        loadProfiles();

        // listen for external updates
        function onProfilesChanged() {
           loadProfiles();
        }
        window.addEventListener("profiles-changed", onProfilesChanged as EventListener);
        
        function onStorage(e: StorageEvent) {
            if (e.key === "profiles" || e.key === "selectedProfileId") {
                onProfilesChanged();
                const newId = localStorage.getItem("selectedProfileId");
                setSelectedProfileId(newId);
            }
        }
        window.addEventListener("storage", onStorage);

        return () => {
            window.removeEventListener("profiles-changed", onProfilesChanged as EventListener);
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (!dropdownRef.current) return;
            if (!(e.target instanceof Node)) return;
            if (!dropdownRef.current.contains(e.target)) setOpen(false);
        }
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

    function applyProfile(profile: any) {
        try {
            // 1. Nettoyage complet
            const keysToRemove = [
                "mesInfos", 
                "periodesStockees", 
                "salairesAvant20", 
                "formRetraite", 
                "confirmedRetirementDate"
            ];
            keysToRemove.forEach(k => localStorage.removeItem(k));

            // 2. Injection des données
            localStorage.setItem("selectedProfileId", String(profile.id));
            
            if (profile.mesInfos) {
                localStorage.setItem("mesInfos", JSON.stringify(profile.mesInfos));
            }
            if (profile.periodesStockees) {
                localStorage.setItem("periodesStockees", JSON.stringify(profile.periodesStockees));
            }
            if (profile.salairesAvant20) {
                localStorage.setItem("salairesAvant20", JSON.stringify(profile.salairesAvant20));
            }

            // 3. Rechargement
            window.location.reload();

        } catch (err) {
            console.error("Erreur en appliquant le profil", err);
            alert("Erreur lors du chargement du profil");
        }
    }

    function reloadProfilesFromFile() {
        setIsLoading(true);
        fetch('/profiles.json')
            .then(r => r.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setProfiles(data);
                    try { localStorage.setItem('profiles', JSON.stringify(data)); } catch {}
                    window.dispatchEvent(new Event('profiles-changed'));
                    // Feedback visuel court au lieu d'une alerte bloquante
                    setTimeout(() => {
                        setIsLoading(false);
                        setOpen(false); 
                    }, 500);
                }
            })
            .catch(err => {
                console.warn('Impossible de recharger profiles.json', err);
                setIsLoading(false);
                alert('Erreur lors de la récupération des données par défaut.');
            });
    }

    const current = profiles.find((p: any) => String(p.id) === String(selectedProfileId));

    return (
        <nav className="bg-white shadow-md rounded-b-3xl px-8 py-4">
            <div className="flex items-center justify-between">
                {/* Logo + Accueil */}
                <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-2 select-none">
                        <div className="bg-gray-900 text-white font-extrabold text-2xl w-10 h-10 flex items-center justify-center rounded-lg shadow-sm">
                            R
                        </div>
                        <span className="font-bold text-lg text-gray-800 tracking-tight">Retraite+</span>
                    </div>

                    <Link to="/" className="text-gray-800 text-sm font-semibold hover:text-purple-600 transition-colors">
                        Accueil
                    </Link>

                    <Link to="/ma-retraite" className="text-gray-800 text-sm font-semibold hover:text-purple-600 transition-colors">
                        Ma Retraite
                    </Link>
                </div>

                {/* Profil + dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <div className="flex items-center space-x-3">
                        <Link to="/profil" className="text-gray-800 text-sm font-semibold border px-4 py-2 rounded-lg hover:text-purple-600 hover:border-purple-600 transition-all">
                            Mon Profil
                        </Link>

                        <button
                            onClick={() => setOpen(o => !o)}
                            className={`flex items-center gap-2 text-gray-700 text-sm px-3 py-2 rounded-lg border transition ${open ? 'bg-gray-100 ring-2 ring-purple-100' : 'hover:bg-gray-50'}`}
                            aria-haspopup="menu"
                            aria-expanded={open}
                        >
                            <User size={18} />
                            <span className="max-w-[100px] truncate">
                                {current ? current.prenom : "Choisir un profil"}
                            </span>
                        </button>
                    </div>

                    {open && (
                        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                            
                            {/* En-tête du menu */}
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <Users size={14} /> Profils disponibles
                                </p>
                            </div>

                            {/* Liste des profils */}
                            <ul className="py-2 max-h-60 overflow-y-auto">
                                {profiles.map((p: any) => {
                                    const isSelected = String(p.id) === String(selectedProfileId);
                                    return (
                                        <li key={p.id}>
                                            <button
                                                onClick={() => applyProfile(p)}
                                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between group transition-colors ${isSelected ? 'bg-purple-50 text-purple-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                                            >
                                                <span>{p.prenom} {p.nom}</span>
                                                {isSelected && <span className="w-2 h-2 rounded-full bg-purple-600"></span>}
                                            </button>
                                        </li>
                                    );
                                })}
                                {profiles.length === 0 && (
                                    <li className="px-4 py-3 text-sm text-gray-400 text-center italic">
                                        Aucun profil chargé
                                    </li>
                                )}
                            </ul>

                            {/* Actions globales (Séparateur) */}
                            <div className="border-t border-gray-100 bg-gray-50/50 p-2 space-y-1">
                                <button
                                    onClick={reloadProfilesFromFile}
                                    disabled={isLoading}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm text-sm text-gray-600 flex items-center gap-3 transition-all"
                                >
                                    <div className={`p-1.5 rounded-md bg-blue-100 text-blue-600 ${isLoading ? 'animate-spin' : ''}`}>
                                        <RefreshCw size={14} />
                                    </div>
                                    <div>
                                        <span className="block font-medium text-gray-700">Réinitialiser les données</span>
                                        <span className="block text-xs text-gray-400">Recharger les profils par défaut</span>
                                    </div>
                                </button>

                                {selectedProfileId && (
                                    <button
                                        onClick={() => {
                                            const keysToRemove = [
                                                "mesInfos", "periodesStockees", "salairesAvant20", 
                                                "formRetraite", "confirmedRetirementDate", "selectedProfileId"
                                            ];
                                            keysToRemove.forEach(k => localStorage.removeItem(k));
                                            setSelectedProfileId(null);
                                            setOpen(false);
                                            window.location.reload();
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-sm text-red-600 flex items-center gap-3 transition-colors"
                                    >
                                        <div className="p-1.5 rounded-md bg-red-100 text-red-600">
                                            <Trash2 size={14} />
                                        </div>
                                        <span className="font-medium">Se déconnecter (Effacer)</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}