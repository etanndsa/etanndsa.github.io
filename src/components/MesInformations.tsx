import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, ArrowUp, Save, AlertCircle, ArrowDown, HelpCircle, X, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InfoPerso from "../../SVG/people-nearby-svgrepo-com.svg";
import Enfants from "../../SVG/child-friendly-svgrepo-com.svg";
import Carriere from "../../SVG/suitcase-tag-svgrepo-com.svg";

// --- INTERFACES ---
interface Enfant {
    prenom: string;
    nom: string;
    dateNaissance: string;
    adopte: boolean;
    ageAdoption?: number;
    adoptionAnnee?: number;
    trimestresAttribution?: number; 
    // Champs de partage
    partageAdoption?: number; 
    partageEducation?: number;
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

    // --- INFOS PERSO ---
    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [sexe, setSexe] = useState("Femme");
    const [dateNaissance, setDateNaissance] = useState("1960-08-08");
    const [handicape, setHandicape] = useState(false);
    const [handicapeDepuis, setHandicapeDepuis] = useState(""); 
    const [militaire, setMilitaire] = useState(false);

    // --- ENFANTS ---
    const [enfants, setEnfants] = useState<Enfant[]>([]);
    const [nouvelEnfant, setNouvelEnfant] = useState<Enfant>({
        prenom: "",
        nom: "",
        dateNaissance: "",
        adopte: false,
        partageAdoption: 4,
        partageEducation: 4
    });
    const [adoptionAnneeText, setAdoptionAnneeText] = useState<string>("");
    const [editingChildIndex, setEditingChildIndex] = useState<number | null>(null);
    
    // ✅ UX : État pour afficher/masquer les options avancées (Répartition)
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

    // --- CARRIÈRE ---
    const [periodes, setPeriodes] = useState<Periode[]>([]);
    const [salairesAvant20, setSalairesAvant20] = useState<SalairesAvant20Raw>({});
    const [erreursPeriodes, setErreursPeriodes] = useState<{ [key: number]: string }>({});

    // --- GESTION SCROLL ---
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) setShowScrollTop(true);
            else setShowScrollTop(false);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
    const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });

    // --- CHARGEMENT INITIAL ---
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
                    if (parsed.handicapeDepuis) setHandicapeDepuis(parsed.handicapeDepuis);
                    if (parsed.militaire !== undefined) setMilitaire(parsed.militaire);
                    if (parsed.enfants) {
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
            
            // Chargement périodes... (inchangé)
            const storedPeriodes = localStorage.getItem("periodesStockees");
            if (storedPeriodes) try { setPeriodes(JSON.parse(storedPeriodes)); } catch {}
            const storedSalaires = localStorage.getItem("salairesAvant20");
            if (storedSalaires) try { setSalairesAvant20(JSON.parse(storedSalaires)); } catch {}
        };

        loadFromLocalStorage();
        const onProfilesChanged = () => loadFromLocalStorage();
        window.addEventListener('profiles-changed', onProfilesChanged as EventListener);
        return () => window.removeEventListener('profiles-changed', onProfilesChanged as EventListener);
    }, []);

    // Reset auto des trimestres par défaut
    useEffect(() => {
        if (editingChildIndex === null) {
            const defaut = sexe === "Femme" ? 4 : 0;
            setNouvelEnfant(prev => ({ ...prev, partageAdoption: defaut, partageEducation: defaut }));
        }
    }, [sexe, editingChildIndex]);

    const validerDonnees = () => {
        const data = { nom, prenom, sexe, dateNaissance, handicape, handicapeDepuis, militaire, enfants };
        localStorage.setItem("mesInfos", JSON.stringify(data));
        window.dispatchEvent(new Event('profiles-changed'));
    };

    const validerEtAllerProfil = () => {
        validerDonnees();
        alert("✅ Informations enregistrées avec succès !");
        navigate("/profil");
    };

    // --- LOGIQUE ENFANTS ---

    const resetFormulaireEnfant = () => {
        const defaut = sexe === "Femme" ? 4 : 0;
        setNouvelEnfant({ 
            prenom: "", 
            nom: "", 
            dateNaissance: "", 
            adopte: false, 
            partageAdoption: defaut,
            partageEducation: defaut
        });
        setAdoptionAnneeText("");
        setEditingChildIndex(null);
        setShowAdvancedOptions(false); // ✅ On referme le panneau avancé
    };

    const ajouterOuModifierEnfant = () => {
        if (!nouvelEnfant.prenom || !nouvelEnfant.nom || !nouvelEnfant.dateNaissance) return;
        
        const enfantValidé = { ...nouvelEnfant };
        if (enfantValidé.adopte) {
             const parsedYear = parseInt(adoptionAnneeText);
             if(!isNaN(parsedYear)) enfantValidé.adoptionAnnee = parsedYear;
        }

        if (editingChildIndex !== null) {
            const updatedEnfants = [...enfants];
            updatedEnfants[editingChildIndex] = enfantValidé;
            setEnfants(updatedEnfants);
        } else {
            setEnfants([...enfants, enfantValidé]);
        }
        resetFormulaireEnfant();
    };

    const demarrerModificationEnfant = (index: number) => {
        const enfant = enfants[index];
        setNouvelEnfant(enfant);
        setAdoptionAnneeText(enfant.adoptionAnnee ? String(enfant.adoptionAnnee) : '');
        setEditingChildIndex(index);
        // ✅ En mode édition, on ouvre le panneau pour voir les détails
        setShowAdvancedOptions(true); 
        
        const formElement = document.getElementById('form-enfant');
        if(formElement) formElement.scrollIntoView({ behavior: 'smooth' });
    };

    const supprimerEnfant = (index: number) => {
        if (window.confirm("Voulez-vous vraiment supprimer cet enfant ?")) {
            setEnfants(enfants.filter((_, i) => i !== index));
            if (editingChildIndex === index) resetFormulaireEnfant();
        }
    };

    // ... (Logique Carrière et Périodes inchangée pour abréger, tu peux copier-coller tes fonctions existantes ici) ...
    const sauvegarderCarriereLongue = () => { localStorage.setItem("salairesAvant20", JSON.stringify(salairesAvant20)); alert("✅ Enregistré !"); };
    const updateSalaireAvant20 = (year: number, field: 'amount'|'devise', value: any) => { setSalairesAvant20(prev => ({ ...prev, [year]: { amount: field==='amount'?parseFloat(value)||0:(prev[year]?.amount||0), devise: field==='devise'?value:(prev[year]?.devise||"EUR") } })); };
    const sauvegarderPeriodes = (updated: Periode[]) => { localStorage.setItem("periodesStockees", JSON.stringify(updated)); setPeriodes(updated); };
    const ajouterPeriode = () => { const newId = periodes.length===0?1:Math.max(...periodes.map(p=>p.id))+1; setPeriodes([...periodes, {id:newId, debut:"", fin:"", salaire:0, salaireEuro:0, type:'TRAVAIL'} as Periode]); };
    const updatePeriode = (id: number, data: Partial<Periode>) => { setPeriodes(periodes.map(p=>p.id===id?{...p, ...data}:p)); };
    const validerPeriode = (id: number) => { /* ... ton code existant ... */ };
    const supprimerPeriode = (id: number) => { setPeriodes(periodes.filter(p=>p.id!==id)); };


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
                            
                            <div className="md:col-span-2 flex flex-col space-y-2">
                                <div className="flex items-center space-x-3">
                                    <input id="handicape" type="checkbox" checked={handicape} onChange={e => { setHandicape(e.target.checked); if(!e.target.checked) setHandicapeDepuis(""); }} className="w-5 h-5 accent-purple-600" />
                                    <label htmlFor="handicape">Je suis reconnu(e) en situation de handicap</label>
                                </div>
                                {handicape && (
                                    <div className="flex items-center space-x-3 ml-8 animate-fade-in-down">
                                        <label htmlFor="handicapeDepuis" className="text-sm text-gray-600">Depuis l'année :</label>
                                        <input id="handicapeDepuis" type="number" placeholder="Ex: 1995" value={handicapeDepuis} onChange={e => setHandicapeDepuis(e.target.value)} className="p-2 border rounded-lg w-32 text-center" />
                                    </div>
                                )}
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

                {/* -------------------- 👶 Enfants (VERSION UX AMÉLIORÉE) -------------------- */}
                {ongletActif === "enfants" && (
                    <section>
                        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-3"><img src={Enfants} className="w-8 h-8" /> Enfants</h2>
                        <div className="bg-gray-50 p-6 rounded-2xl shadow-inner space-y-6">
                            
                            {/* LISTE */}
                            {enfants.length === 0 ? <p className="text-center text-gray-600">Aucun enfant enregistré.</p> : (
                                <ul className="space-y-3">
                                    {enfants.map((e, i) => (
                                        <li key={i} className={`bg-white p-4 rounded-xl shadow flex justify-between items-center transition-all ${editingChildIndex === i ? "ring-2 ring-purple-500 bg-purple-50" : ""}`}>
                                            <div>
                                                <span className="font-bold">{e.prenom} {e.nom}</span> ({e.dateNaissance}) 
                                                {e.adopte && ` - Adopté en ${e.adoptionAnnee}`}
                                                <span className="text-xs text-gray-500 block mt-1">
                                                    {e.adopte 
                                                        ? `${(e.partageAdoption||0)} (Adoption) + ${(e.partageEducation||0)} (Éduc) = ${ (e.partageAdoption||0) + (e.partageEducation||0)} trimestres`
                                                        : sexe === "Femme" 
                                                            ? "8 trimestres validés (Maternité + Éducation)"
                                                            : `${e.partageEducation || 0} trimestres (Partage Éducation)`
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button onClick={() => demarrerModificationEnfant(i)} className="text-purple-600 hover:bg-purple-100 p-2 rounded-full transition"><Pencil size={20} /></button>
                                                <button onClick={() => supprimerEnfant(i)} className="text-red-500 hover:bg-red-100 p-2 rounded-full transition"><Trash2 size={20} /></button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* FORMULAIRE AJOUT / EDITION */}
                            <div id="form-enfant" className="border-t pt-4 mt-4 space-y-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">
                                    {editingChildIndex !== null ? "✏️ Modifier l'enfant" : "➕ Ajouter un enfant"}
                                </h3>
                                
                                <div className="grid md:grid-cols-4 gap-4 items-start">
                                    <input type="text" placeholder="Prénom" value={nouvelEnfant.prenom} onChange={e => setNouvelEnfant({ ...nouvelEnfant, prenom: e.target.value })} className="p-2 border rounded-lg" />
                                    <input type="text" placeholder="Nom" value={nouvelEnfant.nom} onChange={e => setNouvelEnfant({ ...nouvelEnfant, nom: e.target.value })} className="p-2 border rounded-lg" />
                                    <input type="date" value={nouvelEnfant.dateNaissance} onChange={e => setNouvelEnfant({ ...nouvelEnfant, dateNaissance: e.target.value })} className="p-2 border rounded-lg" />
                                    
                                    <div className="flex flex-col pt-2">
                                        <div className="flex items-center space-x-2">
                                            <input type="checkbox" checked={nouvelEnfant.adopte} onChange={e => {
                                                const isAdopte = e.target.checked;
                                                setNouvelEnfant({ ...nouvelEnfant, adopte: isAdopte });
                                                // ✅ UX : Si on coche Adopté, on ouvre automatiquement les options avancées
                                                if(isAdopte) setShowAdvancedOptions(true);
                                            }} className="w-5 h-5 accent-purple-600" />
                                            <span>Adopté</span>
                                        </div>
                                        {nouvelEnfant.adopte && (
                                            <div className="mt-2 animate-fade-in">
                                                <input type="number" placeholder="Année (Ex: 2010)" value={adoptionAnneeText} onChange={e => setAdoptionAnneeText(e.target.value)} className="p-2 border rounded-lg text-sm w-full bg-gray-50" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* BOUTON TOGGLE OPTIONS AVANCÉES */}
                                <div className="flex justify-end mt-2">
                                    <button 
                                        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                                        className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800 underline"
                                    >
                                        {showAdvancedOptions ? <X size={12}/> : <Settings size={12}/>}
                                        {showAdvancedOptions ? "Masquer la répartition des trimestres" : "Gérer la répartition des trimestres (Avancé)"}
                                    </button>
                                </div>

                                {/* LOGIQUE DE PARTAGE DES TRIMESTRES (CONDITIONNELLE) */}
                                {showAdvancedOptions && (
                                    <div className="md:col-span-4 mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100 animate-fade-in-down">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-2 text-sm text-blue-800 font-semibold">
                                                <HelpCircle size={16} />
                                                <span>Répartition des trimestres (Partage parents)</span>
                                            </div>
                                            
                                            <p className="text-xs text-gray-600 mb-2">
                                                Pour un enfant adopté (ou né après 2010), les parents peuvent se répartir les trimestres.
                                                <br/>Par défaut, la mère a souvent la priorité.
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Champ 1 */}
                                                <div className="flex flex-col">
                                                    <label className="text-xs font-medium text-gray-700 mb-1">
                                                        {nouvelEnfant.adopte ? "Majoration Adoption (Max 4)" : "Majoration Maternité (Max 4)"}
                                                    </label>
                                                    {nouvelEnfant.adopte ? (
                                                        <select 
                                                            value={nouvelEnfant.partageAdoption ?? (sexe === "Femme" ? 4 : 0)} 
                                                            onChange={e => setNouvelEnfant({...nouvelEnfant, partageAdoption: parseInt(e.target.value)})}
                                                            className="p-2 border rounded-lg text-sm bg-white"
                                                        >
                                                            {[0,1,2,3,4].map(n => <option key={n} value={n}>{n} trimestre(s)</option>)}
                                                        </select>
                                                    ) : (
                                                        <div className="text-sm font-bold text-gray-500 p-2 bg-gray-100 rounded border">
                                                            {sexe === "Femme" ? "4 (Automatique Mère)" : "0 (Impossible Père)"}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Champ 2 */}
                                                <div className="flex flex-col">
                                                    <label className="text-xs font-medium text-gray-700 mb-1">
                                                        Majoration Éducation (Max 4)
                                                    </label>
                                                    <select 
                                                        value={nouvelEnfant.partageEducation ?? (sexe === "Femme" ? 4 : 0)} 
                                                        onChange={e => setNouvelEnfant({...nouvelEnfant, partageEducation: parseInt(e.target.value)})}
                                                        className="p-2 border rounded-lg text-sm bg-white"
                                                    >
                                                        {[0,1,2,3,4].map(n => <option key={n} value={n}>{n} trimestre(s)</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* BOUTONS D'ACTION FORMULAIRE */}
                                <div className="flex gap-3 pt-2">
                                    {editingChildIndex !== null && (
                                        <button onClick={resetFormulaireEnfant} className="flex-1 flex items-center justify-center bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                                            <X size={18} className="mr-2" /> Annuler
                                        </button>
                                    )}
                                    <button onClick={ajouterOuModifierEnfant} className={`flex-1 flex items-center justify-center text-white px-4 py-2 rounded-lg transition ${editingChildIndex !== null ? "bg-blue-600 hover:bg-blue-700" : "bg-purple-600 hover:bg-purple-700"}`}>
                                        {editingChildIndex !== null ? <><Check size={18} className="mr-2" /> Mettre à jour</> : <><Plus size={18} className="mr-2" /> Ajouter</>}
                                    </button>
                                </div>
                            </div>

                            <button onClick={validerEtAllerProfil} className="w-full bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition text-lg font-semibold shadow-lg mt-6">
                                ✅ Sauvegarder et voir mon profil
                            </button>
                        </div>
                    </section>
                )}

                {/* ... (Onglet Carrière inchangé) ... */}
                 {ongletActif === "carriere" && (
                    <section>
                         {/* Contenu carrière déjà présent dans ton code */}
                         <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-3"><img src={Carriere} className="w-8 h-8" /> Carrière</h2>
                         <div className="bg-gray-50 p-4 rounded-xl shadow space-y-4 border-2 border-blue-100">
                            {/* Copier coller ton bloc carrière existant ici */}
                            {/* Je l'ai allégé pour la réponse mais il faut garder ton code précédent pour cette partie */}
                             <h3 className="text-lg font-bold flex items-center gap-2 text-blue-800">Salaires avant 20 ans</h3>
                             {/* ... logique salairesAvant20 ... */}
                             <div className="flex justify-end mt-2 pt-2 border-t border-gray-200">
                                <button onClick={sauvegarderCarriereLongue} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"><Save size={16} /> Enregistrer</button>
                            </div>
                         </div>
                         <div className="bg-gray-50 p-6 mt-5 rounded-2xl shadow-inner space-y-6">
                            {/* ... liste periodes ... */}
                            {/* Je ne remets pas tout le bloc carrière pour pas saturer la réponse, il n'a pas changé */}
                             <div className="space-y-4">
                                 {periodes.map(p => (
                                     <div key={p.id} className="bg-white p-2 mb-2 rounded shadow">Période {p.debut} - {p.fin} ({p.type}) <button onClick={()=>supprimerPeriode(p.id)} className="text-red-500 ml-2">X</button></div>
                                 ))}
                                 <button onClick={ajouterPeriode} className="px-4 py-2 bg-purple-600 text-white rounded-xl">Ajouter Période (Voir code précédent pour détails)</button>
                             </div>
                         </div>
                    </section>
                )}

            </div>
        </div>
    );
}