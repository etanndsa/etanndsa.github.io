import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InfoPerso from "../../SVG/people-nearby-svgrepo-com.svg"
import Enfants from "../../SVG/child-friendly-svgrepo-com.svg"
import Carriere from "../../SVG/suitcase-tag-svgrepo-com.svg"

interface Enfant {
    prenom: string;
    nom: string;
    dateNaissance: string;
    adopte: boolean;
    ageAdoption?: number;
    adoptionAnnee?: number;
}

interface Periode {
    salaireEuro: number;
    id: number;
    debut: string;
    fin: string;
    salaire: number;
    devise?: "EUR" | "FRF";
    valide?: boolean;
}

type Onglet = "infos" | "enfants" | "carriere";

export default function MesInformations() {
    const navigate = useNavigate();
    const [ongletActif, setOngletActif] = useState<Onglet>("infos");

    // Infos perso
    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [sexe, setSexe] = useState("Femme");
    const [dateNaissance, setDateNaissance] = useState("1960-08-08");
    const [handicape, setHandicape] = useState(false);
    const [militaire, setMilitaire] = useState(false);
    const [erreursPeriodes, setErreursPeriodes] = useState<{ [key: number]: string }>({});


    // Enfants
    const [enfants, setEnfants] = useState<Enfant[]>([]);
    const [nouvelEnfant, setNouvelEnfant] = useState<Enfant>({
        prenom: "",
        nom: "",
        dateNaissance: "",
        adopte: false,
    });
    const [adoptionAnneeError, setAdoptionAnneeError] = useState<string | null>(null);
    const [adoptionAnneeText, setAdoptionAnneeText] = useState<string>("");

    // Carrière
    const [periodes, setPeriodes] = useState<Periode[]>([]);

    // Chargement initial
    // Chargement initial + ré-ecoute lors des changements de profils
    useEffect(() => {
        const loadFromLocalStorage = () => {
            const data = localStorage.getItem("mesInfos");
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.nom !== undefined) setNom(parsed.nom);
                    if (parsed.prenom !== undefined) setPrenom(parsed.prenom);
                    if (parsed.sexe !== undefined) setSexe(parsed.sexe);
                    if (parsed.dateNaissance !== undefined) setDateNaissance(parsed.dateNaissance);
                    if (parsed.handicape !== undefined) setHandicape(parsed.handicape);
                    if (parsed.militaire !== undefined) setMilitaire(parsed.militaire);
                    if (parsed.enfants !== undefined) {
                        const nowYear = new Date().getFullYear();
                        const normalized = (parsed.enfants || []).map((en: any) => {
                            let year: number | undefined = undefined;
                            if (Array.isArray(en?.adoptionAnnee) && en.adoptionAnnee.length > 0) {
                                const y = parseInt(en.adoptionAnnee[0]);
                                if (!Number.isNaN(y) && /^\d{4}$/.test(String(y)) && y >= 1900 && y <= nowYear) year = y;
                            } else if (en?.adoptionAnnee != null) {
                                const y = parseInt(en.adoptionAnnee);
                                if (!Number.isNaN(y) && /^\d{4}$/.test(String(y)) && y >= 1900 && y <= nowYear) year = y;
                            }
                            return { ...en, adoptionAnnee: year };
                        });
                        setEnfants(normalized);
                    }
                } catch (e) {
                    console.warn('Erreur en lisant mesInfos depuis localStorage', e);
                }
            }

            const storedPeriodes = localStorage.getItem("periodesStockees");
            if (storedPeriodes) {
                try {
                    const parsed: Periode[] = JSON.parse(storedPeriodes);
                    setPeriodes(parsed);
                } catch (e) {
                    console.warn('Erreur en lisant periodesStockees depuis localStorage', e);
                }
            }
        };

        // load once at mount
        loadFromLocalStorage();

        // when a profile is applied in the same tab, Navbar dispatches 'profiles-changed'
        const onProfilesChanged = () => loadFromLocalStorage();
        window.addEventListener('profiles-changed', onProfilesChanged as EventListener);

        // storage event for cross-tab updates
        const onStorage = (e: StorageEvent) => {
            if (!e.key) return;
            if (['mesInfos', 'periodesStockees', 'profiles', 'selectedProfileId'].includes(e.key)) {
                loadFromLocalStorage();
            }
        };
        window.addEventListener('storage', onStorage);

        return () => {
            window.removeEventListener('profiles-changed', onProfilesChanged as EventListener);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    // Sauvegarde globale
    const validerDonnees = () => {
        const data = {
            nom,
            prenom,
            sexe,
            dateNaissance,
            handicape,
            militaire,
            enfants
        };
        localStorage.setItem("mesInfos", JSON.stringify(data));
        // If user is editing a saved profile, update that profile record in localStorage so the Navbar dropdown updates
        try {
            const selectedId = localStorage.getItem("selectedProfileId");
            if (selectedId) {
                const stored = localStorage.getItem("profiles");
                let profiles = [] as any[];
                if (stored) {
                    try { profiles = JSON.parse(stored); } catch { profiles = []; }
                }

                // find and update profile
                let updated = false;
                const newProfiles = profiles.map(p => {
                    if (String(p.id) === String(selectedId)) {
                        updated = true;
                        // keep other profile fields but update mesInfos and name
                        const newMesInfos = { ...(p.mesInfos || {}), ...data };
                        return { ...p, mesInfos: newMesInfos, prenom: data.prenom || p.prenom, nom: data.nom || p.nom };
                    }
                    return p;
                });

                // if profile not found but there is a selectedId, optionally create one
                if (!updated) {
                    const newProfile = { id: selectedId, prenom: data.prenom, nom: data.nom, mesInfos: data, periodesStockees: JSON.parse(localStorage.getItem('periodesStockees') || '[]') };
                    newProfiles.push(newProfile);
                }

                // persist and notify listeners
                try {
                    localStorage.setItem("profiles", JSON.stringify(newProfiles));
                    window.dispatchEvent(new Event('profiles-changed'));
                } catch (e) {
                    console.warn("Impossible de sauvegarder profiles dans localStorage", e);
                }
            }
        } catch (e) {
            console.warn("Erreur lors de la synchronisation du profil", e);
        }
    };

    // Périodes
    const sauvegarderPeriodes = (updatedPeriodes: Periode[]) => {
        localStorage.setItem("periodesStockees", JSON.stringify(updatedPeriodes));
        setPeriodes(updatedPeriodes);
    };

    const ajouterPeriode = () => {
        const newId = periodes.length === 0 ? 1 : Math.max(...periodes.map(p => p.id)) + 1;
        setPeriodes([...periodes, { id: newId, debut: "", fin: "", salaire: 0, salaireEuro: 0 } as Periode]);
    };

    const updatePeriode = (id: number, data: Partial<Periode>) => {
        const updated = periodes.map(p => p.id === id ? { ...p, ...data } : p);
        setPeriodes(updated);
    };

    const validerPeriode = (id: number) => {
        const periode = periodes.find(p => p.id === id);
        if (!periode) return;

        // 🔄 Conversion FRANC → EURO si nécessaire
        let salaireEuro = periode.salaire;
        if (periode.devise === "FRF") {
            salaireEuro = +(periode.salaire / 6.55957).toFixed(2);
        }

        // On prépare la période avec conversion + validation
        const updatedPeriodes = periodes.map(p =>
            p.id === id
                ? {
                    ...p,
                    salaireEuro: salaireEuro, // 💡 nouvelle propriete pour le calcul
                    valide: true
                }
                : p
        );

        // Note: chevauchements autorisés — on ne bloque plus la validation pour chevauchement.
        // Si nécessaire, on peut ajouter un avertissement plutôt qu'empêcher la sauvegarde.

        // Vérification salaire uniquement (le champ "trimestres" n'est plus utilisé)
        if (salaireEuro <= 0) {
            setErreursPeriodes(prev => ({ ...prev, [id]: "❌ Salaire incorrect" }));
            return;
        }

        // Tout ok → sauvegarde
        setErreursPeriodes(prev => ({ ...prev, [id]: "" }));
        sauvegarderPeriodes(updatedPeriodes);
    };

    const supprimerPeriode = (id: number) => {
        const updated = periodes.filter(p => p.id !== id);
        sauvegarderPeriodes(updated);
    };

    // Enfants
    const ajouterEnfant = () => {
        if (!nouvelEnfant.prenom || !nouvelEnfant.nom || !nouvelEnfant.dateNaissance) return;

        // If adopted, validate adoptionAnneeText before adding
        if (nouvelEnfant.adopte) {
            const { validYears, invalid } = (function parseYears(raw: string) {
                const tokens = (raw || "").split(',').map(s => s.trim()).filter(s => s.length > 0);
                const nowYear = new Date().getFullYear();
                const validYears: number[] = [];
                const invalid: string[] = [];
                for (const t of tokens) {
                    if (/^\d{4}$/.test(t)) {
                        const y = parseInt(t, 10);
                        if (y >= 1900 && y <= nowYear) validYears.push(y);
                        else invalid.push(t);
                    } else {
                        invalid.push(t);
                    }
                }
                return { validYears, invalid };
            })(adoptionAnneeText);

            if (invalid.length > 0) {
                setAdoptionAnneeError('Années invalides: ' + invalid.join(', '));
                return; // don't add until fixed
            }

            // attach first parsed year to the enfant object (single year)
            nouvelEnfant.adoptionAnnee = validYears.length > 0 ? validYears[0] : undefined;
        }

        setEnfants([...enfants, nouvelEnfant]);
        setNouvelEnfant({ prenom: "", nom: "", dateNaissance: "", adopte: false });
        setAdoptionAnneeText("");
        setAdoptionAnneeError(null);
    };
    const modifierEnfant = (index: number) => {
        const enfant = enfants[index];
        setNouvelEnfant(enfant);
        // populate the text input for editing (single year)
        setAdoptionAnneeText(enfant.adoptionAnnee ? String(enfant.adoptionAnnee) : '');
        setEnfants(enfants.filter((_, i) => i !== index));
    };
    const supprimerEnfant = (index: number) => {
        setEnfants(enfants.filter((_, i) => i !== index));
    };

    const validerEtAllerProfil = () => {
        validerDonnees();
        alert("✅ Informations enregistrées avec succès !");
        navigate("/profil");
    };

    const salairesValides = periodes
        .filter(p => p.valide)
        .map(p => p.salaireEuro ?? p.salaire); // fallback si pas converti


    salairesValides.sort((a, b) => b - a);

    const top25 = salairesValides.slice(0, 25);

    const samMoyen = top25.length > 0
        ? (top25.reduce((a, b) => a + b, 0) / top25.length).toFixed(2)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center pt-24 p-6">
            <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-4xl space-y-10">

                {/* 🧭 Onglets */}
                <div className="flex justify-center space-x-4 border-b pb-4 mb-8">
                    {["infos", "enfants", "carriere"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setOngletActif(tab as Onglet)}
                            className={`px-4 py-2 rounded-full font-medium transition ${ongletActif === tab
                                ? "bg-purple-600 text-white shadow-lg"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {tab === "infos" ? (
                                <span className="flex items-center gap-2">
                                    <img src={InfoPerso} className="w-5 h-5" />
                                    Infos perso
                                </span>
                            ) : tab === "enfants" ? (
                                <span className="flex items-center gap-2">
                                    <img src={Enfants} className="w-5 h-5" />
                                    Enfants
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <img src={Carriere} className="w-5 h-5" />
                                    Carrière
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* -------------------- 🧍 Infos personnelles -------------------- */}
                {ongletActif === "infos" && (
                    <section>
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 flex items-center justify-center gap-3">
                            <img src={InfoPerso} className="w-8 h-8" />
                            Informations personnelles
                        </h2>

                        <div className="bg-gray-50 p-6 rounded-2xl shadow-inner grid md:grid-cols-2 gap-4">

                            {/* Nom */}
                            <input
                                type="text"
                                placeholder="Nom"
                                value={nom}
                                onChange={e => setNom(e.target.value)}
                                className="p-2 border rounded-lg text-center"
                            />

                            {/* Prénom */}
                            <input
                                type="text"
                                placeholder="Prénom"
                                value={prenom}
                                onChange={e => setPrenom(e.target.value)}
                                className="p-2 border rounded-lg text-center"
                            />

                            {/* Sexe */}
                            <select
                                value={sexe}
                                onChange={e => {
                                    setSexe(e.target.value);
                                    if (e.target.value !== "Homme") {
                                        setMilitaire(false); // 🔄 reset si pas un homme
                                    }
                                }}
                                className="p-2 border rounded-lg text-center"
                            >
                                <option>Femme</option>
                                <option>Homme</option>
                                <option>Autre</option>
                            </select>

                            {/* Date de naissance */}
                            <input
                                type="date"
                                value={dateNaissance}
                                onChange={e => setDateNaissance(e.target.value)}
                                className="p-2 border rounded-lg text-center"
                            />

                            {/* Handicap */}
                            <div className="md:col-span-2 flex items-center space-x-3">
                                <input
                                    id="handicape"
                                    type="checkbox"
                                    checked={handicape}
                                    onChange={e => setHandicape(e.target.checked)}
                                    className="w-5 h-5 accent-purple-600"
                                />
                                <label htmlFor="handicape">Je suis reconnu(e) en situation de handicap</label>
                            </div>

                            {/* 🔵 Service militaire — uniquement si Homme */}
                            {sexe === "Homme" && (
                                <div className="md:col-span-2 flex items-center space-x-3">
                                    <input
                                        id="militaire"
                                        type="checkbox"
                                        checked={militaire}
                                        onChange={e => setMilitaire(e.target.checked)}
                                        className="w-5 h-5 accent-purple-600"
                                    />
                                    <label htmlFor="militaire">J'ai effectué le service militaire</label>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center mt-6">
                            <button
                                onClick={validerEtAllerProfil}
                                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                            >
                                ✅ Valider mes informations
                            </button>
                        </div>
                    </section>
                )}

                {/* -------------------- 👶 Enfants -------------------- */}
                {ongletActif === "enfants" && (
                    <section>
                        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-3">
                            <img src={Enfants} className="w-8 h-8" />
                            Enfants
                        </h2>
                        <div className="bg-gray-50 p-6 rounded-2xl shadow-inner space-y-6">
                            {enfants.length === 0 ? <p className="text-center text-gray-600">Aucun enfant enregistré.</p> : (
                                <ul className="space-y-3">
                                    {enfants.map((e, i) => (
                                        <li key={i} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
                                            <div>
                                                {e.prenom} {e.nom} <br /> {e.dateNaissance}
                                                {e.adopte && (
                                                    <div className="text-sm text-gray-600">(Adopté à {e.ageAdoption ?? '—'} ans)</div>
                                                )}
                                                {e.adoptionAnnee != null && (
                                                    <div className="text-sm text-gray-600">Année d'adoption: {e.adoptionAnnee}</div>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <Pencil size={20} className="cursor-pointer text-purple-600" onClick={() => modifierEnfant(i)} />
                                                <Trash2 size={20} className="cursor-pointer text-red-500" onClick={() => supprimerEnfant(i)} />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="border-t pt-4 mt-4 space-y-3">
                                <div className="grid md:grid-cols-4 gap-4 items-end">
                                    <input type="text" placeholder="Prénom" value={nouvelEnfant.prenom} onChange={e => setNouvelEnfant({ ...nouvelEnfant, prenom: e.target.value })} className="p-2 border rounded-lg" />
                                    <input type="text" placeholder="Nom" value={nouvelEnfant.nom} onChange={e => setNouvelEnfant({ ...nouvelEnfant, nom: e.target.value })} className="p-2 border rounded-lg" />
                                    <input type="date" value={nouvelEnfant.dateNaissance} onChange={e => setNouvelEnfant({ ...nouvelEnfant, dateNaissance: e.target.value })} className="p-2 border rounded-lg" />
                                    <div className="flex flex-col">
                                        <p className="text-sm text-gray-600 mb-1">Adopté</p>
                                        <div className="flex items-center space-x-2">
                                            <input type="checkbox" checked={nouvelEnfant.adopte} onChange={e => setNouvelEnfant({ ...nouvelEnfant, adopte: e.target.checked })} className="w-5 h-5 accent-purple-600" />
                                            {nouvelEnfant.adopte && (
                                                <>
                                                    <input type="number" placeholder="Âge adoption" value={nouvelEnfant.ageAdoption || ""} onChange={e => setNouvelEnfant({ ...nouvelEnfant, ageAdoption: parseInt(e.target.value) || undefined })} className="p-2 border rounded-lg w-28 mr-2" />
                                                    <div className="flex flex-col">
                                                        <input type="number" placeholder="Année adoption (YYYY)" min={1900} max={new Date().getFullYear()} value={adoptionAnneeText} onChange={e => {
                                                            setAdoptionAnneeText(e.target.value);
                                                            setAdoptionAnneeError(null);
                                                        }} onBlur={e => {
                                                            const raw = e.target.value.trim();
                                                            if (!raw) {
                                                                setAdoptionAnneeError(null);
                                                                setNouvelEnfant({ ...nouvelEnfant, adoptionAnnee: undefined });
                                                                return;
                                                            }
                                                            if (/^\d{4}$/.test(raw)) {
                                                                const y = parseInt(raw, 10);
                                                                const nowYear = new Date().getFullYear();
                                                                if (y >= 1900 && y <= nowYear) {
                                                                    setAdoptionAnneeError(null);
                                                                    setNouvelEnfant({ ...nouvelEnfant, adoptionAnnee: y });
                                                                } else {
                                                                    setAdoptionAnneeError('Année hors plage plausible');
                                                                }
                                                            } else {
                                                                setAdoptionAnneeError('Format attendu: YYYY (ex: 2014)');
                                                            }
                                                        }} className="p-2 border rounded-lg" />
                                                        {adoptionAnneeError && <div className="text-sm text-red-600 mt-1">{adoptionAnneeError}</div>}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 mt-3">
                                    <button onClick={ajouterEnfant} className="w-full flex items-center justify-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                                        <Plus size={18} className="mr-2" /> Ajouter / Enregistrer
                                    </button>
                                    <button onClick={validerEtAllerProfil} className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                                        ✅ Sauvegarder les enfants
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* -------------------- 💼 Carrière -------------------- */}
                {ongletActif === "carriere" && (
                    <section>
                        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-3">
                            <img src={Carriere} className="w-8 h-8" />
                            Carrière
                        </h2>

                        <div className="bg-gray-50 p-6 rounded-2xl shadow-inner space-y-6">

                            {/* -------------------- PÉRIODES -------------------- */}
                            <div className="space-y-4">
                                {periodes.map(p => {
                                    const isDisabled = p.valide;

                                    return (
                                        <div key={p.id} className={`bg-white p-4 rounded-xl shadow space-y-3 ${isDisabled ? "bg-gray-100 opacity-70" : ""}`}>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">

                                                {/* Date début */}
                                                <label className="flex flex-col text-sm">
                                                    <span className="text-xs text-gray-500">Date de début</span>
                                                    <input
                                                        type="date"
                                                        value={p.debut}
                                                        onChange={e => updatePeriode(p.id, { debut: e.target.value })}
                                                        className="p-2 border rounded-lg"
                                                        disabled={isDisabled}
                                                    />
                                                </label>

                                                {/* Date fin */}
                                                <label className="flex flex-col text-sm">
                                                    <span className="text-xs text-gray-500">Date de fin</span>
                                                    <input
                                                        type="date"
                                                        value={p.fin}
                                                        onChange={e => updatePeriode(p.id, { fin: e.target.value })}
                                                        className="p-2 border rounded-lg"
                                                        disabled={isDisabled}
                                                    />
                                                </label>

                                                {/* (Champ "trimestres" retiré) */}

                                                {/* Salaire */}
                                                <label className={`flex flex-col text-sm ${isDisabled ? "text-gray-400" : ""}`}>
                                                    <span className="text-xs text-gray-500">Salaire de la période</span>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={p.salaire || ""}
                                                        onChange={e => updatePeriode(p.id, { salaire: parseFloat(e.target.value) || 0 })}
                                                        className={`p-2 border rounded-lg text-center ${p.salaire <= 0 ? "border-red-500" : ""}`}
                                                        disabled={isDisabled}
                                                    />
                                                </label>
                                                {/* Devise */}
                                                <label className="flex flex-col text-sm">
                                                    <span className="text-xs text-gray-500">Devise</span>
                                                    <select
                                                        value={p.devise || "EUR"}
                                                        onChange={e => updatePeriode(p.id, { devise: e.target.value as "EUR" | "FRF" })}
                                                        disabled={isDisabled}
                                                        className="p-2 border rounded-lg"
                                                    >
                                                        <option value="EUR">Euro (€)</option>
                                                        <option value="FRF">Franc (₣)</option>
                                                    </select>
                                                </label>

                                                {/* Actions */}
                                                <div className="flex justify-end gap-2">

                                                    {/* Modifier */}
                                                    <button
                                                        type="button"
                                                        onClick={() => updatePeriode(p.id, { valide: false })}
                                                        className="p-2 rounded-lg hover:bg-gray-100"
                                                        title="Modifier"
                                                    >
                                                        <Pencil size={18} className="text-purple-600" />
                                                    </button>

                                                    {/* Valider */}
                                                    <button
                                                        type="button"
                                                        onClick={() => validerPeriode(p.id) }
                                                        className="p-2 rounded-lg hover:bg-green-100"
                                                    >
                                                        <Check size={18} className="text-green-600" />
                                                    </button>

                                                    {/* Supprimer */}
                                                    <button
                                                        type="button"
                                                        onClick={() => supprimerPeriode(p.id)}
                                                        className="p-2 rounded-lg hover:bg-red-100"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={18} className="text-red-600" />
                                                    </button>

                                                </div>
                                            </div>

                                            {/* Erreurs éventuelles */}
                                            {erreursPeriodes[p.id] && (
                                                <p className="text-red-600 text-sm">{erreursPeriodes[p.id]}</p>
                                            )}
                                        </div>
                                    );
                                })}

                                <button
                                    onClick={() => ajouterPeriode()}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 flex items-center gap-2"
                                >
                                    <Plus size={16} /> Ajouter une période
                                </button>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow text-center">
                                <h3 className="text-lg font-bold">📊 Salaire annuel moyen (25 meilleures années)</h3>
                                <p className="text-xl text-purple-600 font-semibold mt-2">
                                    {samMoyen} € / an
                                </p>
                            </div>

                        </div>
                    </section>
                )}

            </div>
        </div>
    );
}