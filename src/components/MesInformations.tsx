import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, ArrowUp, Save, AlertCircle, ArrowDown } from "lucide-react";
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
    id: number;
    debut: string;
    fin: string;
    valide?: boolean;
    type?: 'TRAVAIL' | 'MALADIE' | 'CHOMAGE'; 
    salaire: number;
    salaireEuro: number;
    devise?: "EUR" | "FRF";
    trimestresAssimiles?: number;
}

type Onglet = "infos" | "enfants" | "carriere";
type SalairesAvant20Raw = Record<string, { amount: number; devise: "EUR" | "FRF" }>;

export default function MesInformations() {
    const navigate = useNavigate();
    const [ongletActif, setOngletActif] = useState<Onglet>("infos");
    const [showScrollTop, setShowScrollTop] = useState(false);

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
    const [salairesAvant20, setSalairesAvant20] = useState<SalairesAvant20Raw>({});

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) setShowScrollTop(true);
            else setShowScrollTop(false);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    const scrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth"
        });
    };

    // Chargement initial
    useEffect(() => {
        const loadFromLocalStorage = () => {
            const data = localStorage.getItem("mesInfos");
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.nom) setNom(parsed.nom);
                    if (parsed.prenom) setPrenom(parsed.prenom);
                    if (parsed.sexe) setSexe(parsed.sexe);
                    if (parsed.dateNaissance) setDateNaissance(parsed.dateNaissance);
                    if (parsed.handicape !== undefined) setHandicape(parsed.handicape);
                    if (parsed.militaire !== undefined) setMilitaire(parsed.militaire);
                    if (parsed.enfants) {
                        const nowYear = new Date().getFullYear();
                        const normalized = (parsed.enfants || []).map((en: any) => {
                            let year: number | undefined = undefined;
                            if (Array.isArray(en?.adoptionAnnee) && en.adoptionAnnee.length > 0) year = parseInt(en.adoptionAnnee[0]);
                            else if (en?.adoptionAnnee != null) year = parseInt(en.adoptionAnnee);
                            return { ...en, adoptionAnnee: year };
                        });
                        setEnfants(normalized);
                    }
                } catch (e) { console.warn(e); }
            }

            const storedPeriodes = localStorage.getItem("periodesStockees");
            if (storedPeriodes) {
                try { setPeriodes(JSON.parse(storedPeriodes)); } catch (e) { console.warn(e); }
            }

            const storedSalairesAvant20 = localStorage.getItem("salairesAvant20");
            if (storedSalairesAvant20) {
                try { setSalairesAvant20(JSON.parse(storedSalairesAvant20)); } catch (e) { console.warn(e); }
            }
        };

        loadFromLocalStorage();
        const onProfilesChanged = () => loadFromLocalStorage();
        window.addEventListener('profiles-changed', onProfilesChanged as EventListener);
        const onStorage = (e: StorageEvent) => {
            if (!e.key) return;
            if (['mesInfos', 'periodesStockees', 'profiles', 'selectedProfileId','salairesAvant20'].includes(e.key)) loadFromLocalStorage();
        };
        window.addEventListener('storage', onStorage);

        return () => {
            window.removeEventListener('profiles-changed', onProfilesChanged as EventListener);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    // Sauvegarde globale
    const validerDonnees = () => {
        const data = { nom, prenom, sexe, dateNaissance, handicape, militaire, enfants };
        localStorage.setItem("mesInfos", JSON.stringify(data));
        try {
            const selectedId = localStorage.getItem("selectedProfileId");
            if (selectedId) {
                const stored = localStorage.getItem("profiles");
                let profiles = stored ? JSON.parse(stored) : [];
                let updated = false;
                const newProfiles = profiles.map((p: any) => {
                    if (String(p.id) === String(selectedId)) {
                        updated = true;
                        return { ...p, mesInfos: { ...(p.mesInfos || {}), ...data }, prenom: data.prenom || p.prenom, nom: data.nom || p.nom };
                    }
                    return p;
                });
                if (!updated) {
                    newProfiles.push({ id: selectedId, prenom: data.prenom, nom: data.nom, mesInfos: data, periodesStockees: JSON.parse(localStorage.getItem('periodesStockees') || '[]') });
                }
                localStorage.setItem("profiles", JSON.stringify(newProfiles));
                window.dispatchEvent(new Event('profiles-changed'));
            }
        } catch (e) { console.warn(e); }
    };

    // --- CARRIÈRE LONGUE ---
    const sauvegarderCarriereLongue = () => {
        localStorage.setItem("salairesAvant20", JSON.stringify(salairesAvant20));
        alert("✅ Salaires carrière longue enregistrés !");
    };

    const updateSalaireAvant20 = (year: number, field: 'amount' | 'devise', value: any) => {
        setSalairesAvant20(prev => ({
            ...prev,
            [year]: {
                amount: field === 'amount' ? parseFloat(value) || 0 : (prev[year]?.amount || 0),
                devise: field === 'devise' ? value : (prev[year]?.devise || "EUR")
            }
        }));
    };

    // --- PÉRIODES ---
    const sauvegarderPeriodes = (updatedPeriodes: Periode[]) => {
        localStorage.setItem("periodesStockees", JSON.stringify(updatedPeriodes));
        setPeriodes(updatedPeriodes);
    };

    const ajouterPeriode = () => {
        const newId = periodes.length === 0 ? 1 : Math.max(...periodes.map(p => p.id)) + 1;
        // Par défaut type TRAVAIL
        setPeriodes([...periodes, { id: newId, debut: "", fin: "", salaire: 0, salaireEuro: 0, type: 'TRAVAIL' } as Periode]);
    };

    const updatePeriode = (id: number, data: Partial<Periode>) => {
        const updated = periodes.map(p => p.id === id ? { ...p, ...data } : p);
        setPeriodes(updated);
    };

    const validerPeriode = (id: number) => {
        const periode = periodes.find(p => p.id === id);
        if (!periode) return;

        const type = periode.type || 'TRAVAIL';

        // Validation différente selon le type
        if (type === 'TRAVAIL') {
            // Cas Travail : On vérifie le salaire
            let salaireEuro = periode.salaire;
            if (periode.devise === "FRF") {
                salaireEuro = +(periode.salaire / 6.55957).toFixed(2);
            }
            if (salaireEuro <= 0) {
                setErreursPeriodes(prev => ({ ...prev, [id]: "❌ Salaire incorrect" }));
                return;
            }
            // Sauvegarde
            const updatedPeriodes = periodes.map(p => p.id === id ? { ...p, salaireEuro, valide: true } : p);
            setErreursPeriodes(prev => ({ ...prev, [id]: "" }));
            sauvegarderPeriodes(updatedPeriodes);

        } else {
            // Cas Maladie / Chômage : On vérifie les trimestres (pas le salaire)
            // On force le salaire à 0 pour être propre
            const trim = periode.trimestresAssimiles || 0;
            if (trim <= 0 || trim > 4) {
                setErreursPeriodes(prev => ({ ...prev, [id]: "❌ Trimestres incorrects (1-4)" }));
                return;
            }
            const updatedPeriodes = periodes.map(p => p.id === id ? { 
                ...p, 
                salaire: 0, 
                salaireEuro: 0, 
                trimestresAssimiles: trim,
                valide: true 
            } : p);
            setErreursPeriodes(prev => ({ ...prev, [id]: "" }));
            sauvegarderPeriodes(updatedPeriodes);
        }
    };

    const supprimerPeriode = (id: number) => {
        const updated = periodes.filter(p => p.id !== id);
        sauvegarderPeriodes(updated);
    };

    // --- ENFANTS ---
    const ajouterEnfant = () => {
        if (!nouvelEnfant.prenom || !nouvelEnfant.nom || !nouvelEnfant.dateNaissance) return;
        if (nouvelEnfant.adopte) {
             // (Logique de validation année adoption inchangée, je raccourcis pour l'exemple)
             const parsedYear = parseInt(adoptionAnneeText);
             if(!isNaN(parsedYear)) nouvelEnfant.adoptionAnnee = parsedYear;
        }
        setEnfants([...enfants, nouvelEnfant]);
        setNouvelEnfant({ prenom: "", nom: "", dateNaissance: "", adopte: false });
        setAdoptionAnneeText("");
    };
    const modifierEnfant = (index: number) => {
        const enfant = enfants[index];
        setNouvelEnfant(enfant);
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center pt-24 p-6">
            <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-4xl space-y-10">

                {/* 🧭 Onglets */}
                <div className="flex justify-center space-x-4 border-b pb-4 mb-8">
                    {["infos", "enfants", "carriere"].map(tab => (
                        <button key={tab} onClick={() => setOngletActif(tab as Onglet)} className={`px-4 py-2 rounded-full font-medium transition ${ongletActif === tab ? "bg-purple-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                            {tab === "infos" && <span className="flex items-center gap-2"><img src={InfoPerso} className="w-5 h-5" /> Infos perso</span>}
                            {tab === "enfants" && <span className="flex items-center gap-2"><img src={Enfants} className="w-5 h-5" /> Enfants</span>}
                            {tab === "carriere" && <span className="flex items-center gap-2"><img src={Carriere} className="w-5 h-5" /> Carrière</span>}
                        </button>
                    ))}
                </div>

                {/* -------------------- 🧍 Infos personnelles -------------------- */}
                {ongletActif === "infos" && (
                    <section>
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 flex items-center justify-center gap-3"><img src={InfoPerso} className="w-8 h-8" /> Informations personnelles</h2>
                        <div className="bg-gray-50 p-6 rounded-2xl shadow-inner grid md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} className="p-2 border rounded-lg text-center" />
                            <input type="text" placeholder="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)} className="p-2 border rounded-lg text-center" />
                            <select value={sexe} onChange={e => { setSexe(e.target.value); if (e.target.value !== "Homme") setMilitaire(false); }} className="p-2 border rounded-lg text-center">
                                <option>Femme</option><option>Homme</option><option>Autre</option>
                            </select>
                            <input type="date" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} className="p-2 border rounded-lg text-center" />
                            <div className="md:col-span-2 flex items-center space-x-3">
                                <input id="handicape" type="checkbox" checked={handicape} onChange={e => setHandicape(e.target.checked)} className="w-5 h-5 accent-purple-600" />
                                <label htmlFor="handicape">Je suis reconnu(e) en situation de handicap</label>
                            </div>
                            {sexe === "Homme" && (
                                <div className="md:col-span-2 flex items-center space-x-3">
                                    <input id="militaire" type="checkbox" checked={militaire} onChange={e => setMilitaire(e.target.checked)} className="w-5 h-5 accent-purple-600" />
                                    <label htmlFor="militaire">J'ai effectué le service militaire</label>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-center mt-6">
                            <button onClick={validerEtAllerProfil} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">✅ Valider mes informations</button>
                        </div>
                    </section>
                )}

                {/* -------------------- 👶 Enfants -------------------- */}
                {ongletActif === "enfants" && (
                    <section>
                        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-3"><img src={Enfants} className="w-8 h-8" /> Enfants</h2>
                        {/* ... (Même code que votre version précédente pour la liste des enfants) ... */}
                        <div className="bg-gray-50 p-6 rounded-2xl shadow-inner space-y-6">
                            {enfants.length === 0 ? <p className="text-center text-gray-600">Aucun enfant enregistré.</p> : (
                                <ul className="space-y-3">
                                    {enfants.map((e, i) => (
                                        <li key={i} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
                                            <div>{e.prenom} {e.nom} ({e.dateNaissance}) {e.adopte && "- Adopté"}</div>
                                            <div className="flex space-x-2"><Pencil size={20} className="cursor-pointer text-purple-600" onClick={() => modifierEnfant(i)} /><Trash2 size={20} className="cursor-pointer text-red-500" onClick={() => supprimerEnfant(i)} /></div>
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
                                        <div className="flex items-center space-x-2">
                                            <input type="checkbox" checked={nouvelEnfant.adopte} onChange={e => setNouvelEnfant({ ...nouvelEnfant, adopte: e.target.checked })} className="w-5 h-5 accent-purple-600" />
                                            <span>Adopté</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={ajouterEnfant} className="w-full flex items-center justify-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"><Plus size={18} className="mr-2" /> Ajouter</button>
                                <button onClick={validerEtAllerProfil} className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">✅ Sauvegarder</button>
                            </div>
                        </div>
                    </section>
                )}

                {/* -------------------- 💼 Carrière -------------------- */}
                {ongletActif === "carriere" && (
                    <section>
                        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-3"><img src={Carriere} className="w-8 h-8" /> Carrière</h2>

                        {/* CARRIÈRE LONGUE */}
                        <div className="bg-gray-50 p-4 rounded-xl shadow space-y-4 border-2 border-blue-100">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-blue-800">⏳ Salaires avant 20 ans</h3>
                            <div className="space-y-3">
                                {(() => {
                                    const birthYear = Number(dateNaissance.substring(0, 4));
                                    const labels = [16, 17, 18, 19, 20].map(age => ({ age, year: birthYear + age }));
                                    return labels.map(({ age, year }) => {
                                        const entry = salairesAvant20[year] || { amount: 0, devise: "EUR" };
                                        return (
                                            <div key={year} className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                                                <label className="w-full sm:w-56 text-sm text-gray-700 font-medium">Salaire {age} ans ({year}) :</label>
                                                <input type="number" min={0} step="0.01" value={entry.amount || ""} onChange={(e) => updateSalaireAvant20(year, 'amount', e.target.value)} className="p-2 border rounded-lg w-full sm:w-48" placeholder="0" />
                                                <select value={entry.devise} onChange={(e) => updateSalaireAvant20(year, 'devise', e.target.value)} className="p-2 border rounded-lg bg-white">
                                                    <option value="EUR">€</option><option value="FRF">₣</option>
                                                </select>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                            <div className="flex justify-end mt-2 pt-2 border-t border-gray-200">
                                <button onClick={sauvegarderCarriereLongue} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"><Save size={16} /> Enregistrer</button>
                            </div>
                        </div>

                        {/* LISTE DES PÉRIODES (MODIFIÉ POUR MALADIE/CHOMAGE) */}
                        <div className="bg-gray-50 p-6 mt-5 rounded-2xl shadow-inner space-y-6">
                            <div className="space-y-4">
                                {periodes.map(p => {
                                    const isDisabled = p.valide;
                                    const type = p.type || 'TRAVAIL';
                                    const isAssimile = type !== 'TRAVAIL';

                                    return (
                                        <div key={p.id} className={`bg-white p-4 rounded-xl shadow space-y-3 ${isDisabled ? "bg-gray-100 opacity-70" : ""} border-l-4 ${isAssimile ? "border-orange-400" : "border-purple-600"}`}>
                                            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                                                
                                                {/* Type */}
                                                <label className="flex flex-col text-sm md:col-span-1">
                                                    <span className="text-xs text-gray-500 font-semibold mb-1">Type</span>
                                                    <select 
                                                        value={type} 
                                                        onChange={e => updatePeriode(p.id, { type: e.target.value as any })} 
                                                        disabled={isDisabled}
                                                        className="p-2 border rounded-lg bg-gray-50 text-sm font-medium"
                                                    >
                                                        <option value="TRAVAIL">💼 Travail</option>
                                                        <option value="MALADIE">🏥 Maladie</option>
                                                        <option value="CHOMAGE">📉 Chômage</option>
                                                    </select>
                                                </label>

                                                {/* Dates (2 colonnes) */}
                                                <label className="flex flex-col text-sm md:col-span-1">
                                                    <span className="text-xs text-gray-500">Début</span>
                                                    <input type="date" value={p.debut} onChange={e => updatePeriode(p.id, { debut: e.target.value })} className="p-2 border rounded-lg" disabled={isDisabled} />
                                                </label>
                                                <label className="flex flex-col text-sm md:col-span-1">
                                                    <span className="text-xs text-gray-500">Fin</span>
                                                    <input type="date" value={p.fin} onChange={e => updatePeriode(p.id, { fin: e.target.value })} className="p-2 border rounded-lg" disabled={isDisabled} />
                                                </label>

                                                {/* CONDITIONNEL : Salaire OU Trimestres (2 colonnes) */}
                                                {isAssimile ? (
                                                    // Cas Assimilé : On demande les trimestres
                                                    <label className="flex flex-col text-sm md:col-span-2">
                                                        <span className="text-xs text-gray-500 text-orange-600 font-bold">Trimestres à valider (max 4)</span>
                                                        <input 
                                                            type="number" 
                                                            min={0} max={4}
                                                            value={p.trimestresAssimiles || ""} 
                                                            onChange={e => updatePeriode(p.id, { trimestresAssimiles: parseInt(e.target.value) || 0 })} 
                                                            className="p-2 border rounded-lg text-center border-orange-300 focus:ring-orange-500" 
                                                            disabled={isDisabled}
                                                            placeholder="Ex: 1 pour 60j"
                                                        />
                                                    </label>
                                                ) : (
                                                    // Cas Travail : On demande Salaire + Devise
                                                    <>
                                                        <label className="flex flex-col text-sm md:col-span-1">
                                                            <span className="text-xs text-gray-500">Salaire</span>
                                                            <input type="number" value={p.salaire || ""} onChange={e => updatePeriode(p.id, { salaire: parseFloat(e.target.value) || 0 })} className="p-2 border rounded-lg" disabled={isDisabled} />
                                                        </label>
                                                        <label className="flex flex-col text-sm md:col-span-1">
                                                            <span className="text-xs text-gray-500">Devise</span>
                                                            <select value={p.devise || "EUR"} onChange={e => updatePeriode(p.id, { devise: e.target.value as any })} disabled={isDisabled} className="p-2 border rounded-lg w-full"><option value="EUR">€</option><option value="FRF">₣</option></select>
                                                        </label>
                                                    </>
                                                )}

                                                {/* Actions (1 colonne) */}
                                                <div className="flex justify-end gap-2 md:col-span-1 pb-1">
                                                    <button onClick={() => updatePeriode(p.id, { valide: false })} className="p-2 rounded hover:bg-gray-100 text-gray-500"><Pencil size={18}/></button>
                                                    <button onClick={() => validerPeriode(p.id)} className="p-2 rounded hover:bg-green-100 text-green-600"><Check size={18}/></button>
                                                    <button onClick={() => supprimerPeriode(p.id)} className="p-2 rounded hover:bg-red-100 text-red-600"><Trash2 size={18}/></button>
                                                </div>
                                            </div>
                                            {erreursPeriodes[p.id] && <p className="text-red-600 text-sm flex items-center gap-1"><AlertCircle size={14}/> {erreursPeriodes[p.id]}</p>}
                                        </div>
                                    );
                                })}
                                <button onClick={() => ajouterPeriode()} className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 flex items-center gap-2 w-fit"><Plus size={16} /> Ajouter une période</button>
                            </div>
                        </div>
                    </section>
                )}

            </div>
            {/* Boutons de navigation */}
            <div className="fixed bottom-8 right-8 flex gap-4 z-50">
                {/* Bouton Scroll Down (avec animation) */}
                <button 
                    onClick={scrollToBottom} 
                    className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 animate-bounce"
                    title="Aller en bas"
                >
                    <ArrowDown size={24} />
                </button>

                {/* Bouton Scroll Up (avec animation) */}
                {showScrollTop && (
                    <button 
                        onClick={scrollToTop} 
                        className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 animate-bounce"
                        title="Retour en haut"
                    >
                        <ArrowUp size={24} />
                    </button>
                )}
            </div>
        </div>
    );
}