import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

export default function Navbar() {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // init selected profile from localStorage
        const savedId = localStorage.getItem("selectedProfileId");
        if (savedId) setSelectedProfileId(savedId);

        // Load profiles from localStorage (persisted edits) when available, otherwise fetch default and persist a copy
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

        // listen for external updates to profiles (custom event dispatched by editor forms)
        function onProfilesChanged() {
            const s = localStorage.getItem("profiles");
            if (!s) return;
            try {
                const parsed = JSON.parse(s);
                if (Array.isArray(parsed)) setProfiles(parsed);
            } catch { }
        }
        window.addEventListener("profiles-changed", onProfilesChanged as EventListener);
        // also listen to storage for cross-tab changes
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
            localStorage.setItem("mesInfos", JSON.stringify(profile.mesInfos || {}));
            localStorage.setItem("periodesStockees", JSON.stringify(profile.periodesStockees || []));
            localStorage.setItem("selectedProfileId", String(profile.id));
            setSelectedProfileId(String(profile.id));
            // small UX: close dropdown
            setOpen(false);
            // notify other components in the same tab to reload from localStorage
            try { window.dispatchEvent(new Event('profiles-changed')); } catch {}
        } catch (err) {
            console.error("Erreur en appliquant le profil", err);
        }
    }

    // force reload profiles.json from public and update localStorage + state
    function reloadProfilesFromFile() {
        fetch('/profiles.json')
            .then(r => r.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setProfiles(data);
                    try { localStorage.setItem('profiles', JSON.stringify(data)); } catch {}
                    window.dispatchEvent(new Event('profiles-changed'));
                    alert('Profiles rechargés depuis /profiles.json');
                }
            })
            .catch(err => {
                console.warn('Impossible de recharger profiles.json', err);
                alert('Erreur lors du rechargement des profils (voir console)');
            });
    }

    const current = profiles.find((p: any) => String(p.id) === String(selectedProfileId));

    return (
        <nav className="bg-white shadow-md rounded-b-3xl px-8 py-4">
            <div className="flex items-center justify-between">
                {/* Logo + Accueil */}
                <div className="flex items-center space-x-8">
                    {/* Logo */}
                    <div className="flex items-center space-x-2 select-none">
                        <div className="bg-gray-900 text-white font-extrabold text-2xl w-10 h-10 flex items-center justify-center rounded-lg shadow-sm">
                            R
                        </div>
                        <span className="font-bold text-lg text-gray-800 tracking-tight">Retraite+</span>
                    </div>

                    {/* Accueil */}
                    <Link to="/" className="text-gray-800 text-sm font-semibold hover:text-purple-600 transition-colors">
                        Accueil
                    </Link>

                    {/* MaRetraite */}
                    <Link to="/ma-retraite" className="text-gray-800 text-sm font-semibold hover:text-purple-600 transition-colors">
                        Ma Retraite
                    </Link>
                </div>

                {/* Profil + dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <div className="flex items-center space-x-3">
                        <Link to="/profil" className="text-gray-800 text-sm font-semibold border px-4 py-2 rounded-lg hover:text-purple-600 hover:border-purple-600 transition-all">
                            Profil
                        </Link>

                        <button
                            onClick={() => setOpen(o => !o)}
                            className="text-gray-700 text-sm px-3 py-2 rounded-lg border hover:bg-gray-50 transition"
                            aria-haspopup="menu"
                            aria-expanded={open}
                        >
                            {current ? current.prenom : "Sélectionner profil"}
                        </button>
                    </div>

                    {open && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
                            <ul className="py-2">
                                {profiles.map((p: any) => (
                                    <li key={p.id}>
                                        <button
                                            onClick={() => applyProfile(p)}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                                        >
                                            {p.prenom} {p.nom ? ` ${p.nom}` : ""}
                                        </button>
                                    </li>
                                ))}
                                <li>
                                    <button
                                        onClick={() => {
                                            // clear profile
                                            localStorage.removeItem("mesInfos");
                                            localStorage.removeItem("periodesStockees");
                                            localStorage.removeItem("selectedProfileId");
                                            setSelectedProfileId(null);
                                            setOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                                    >
                                        Effacer le profil courant
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => { reloadProfilesFromFile(); setOpen(false); }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                                    >
                                        Recharger profils depuis fichier
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}