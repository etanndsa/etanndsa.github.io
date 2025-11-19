import { calculateRetraiteFromPeriods } from "../utils/calculRetraite";
import FormulaireRetraite from "./FormulaireRetraites";
import { useState, useEffect } from "react";

export default function MaRetraite() {
    const [valeurs, setValeurs] = useState(() => {
        const saved = localStorage.getItem("formRetraite");
        return saved ? JSON.parse(saved) : { retirementAge: "" };
    });

    useEffect(() => {
        localStorage.setItem("formRetraite", JSON.stringify(valeurs));
    }, [valeurs]);

    function handleChange(nom: string, valeur: any) {
        setValeurs((prev: any) => ({ ...prev, [nom]: valeur }));
    }

    // --- date confirmée ---
    const [confirmedDate, setConfirmedDate] = useState<string | null>(() => {
        return localStorage.getItem("confirmedRetirementDate");
    });

    // --- résultat complet ---
    const [resultat, setResultat] = useState<any | null>(null);

    // --- NOUVEAU : État pour la retraite progressive (par défaut 100% = retraite complète) ---
    const [pourcentageRetraite, setPourcentageRetraite] = useState(100);

    async function handleConfirm(date: string) {
        if (!date) {
            alert("Veuillez choisir une date avant de confirmer.");
            return;
        }

        setConfirmedDate(date);
        localStorage.setItem("confirmedRetirementDate", date);

        try {
            // récupération données stockées
            const mesInfos = JSON.parse(localStorage.getItem("mesInfos") || "{}");
            const periodes = JSON.parse(localStorage.getItem("periodesStockees") || "[]");

            if (!mesInfos.dateNaissance) {
                alert("Veuillez entrer la date de naissance dans les informations personnelles.");
                return;
            }

            // construction de l'objet PersonInfo attendu par le moteur
            const person = {
                dateNaissance: mesInfos.dateNaissance,
                handicape: mesInfos.handicape ?? false,
                militaire: mesInfos.militaire ?? false, // Ajout gestion militaire
                enfants: mesInfos.enfants ?? [],
                ageDepartSouhaite: date
            };

            // appel du nouveau moteur complet CNAV
            const res = calculateRetraiteFromPeriods(person, periodes, date);

            setResultat(res);
            setPourcentageRetraite(100); // Reset à 100% à chaque nouveau calcul

            alert("Calcul effectué !");
        } catch (e) {
            console.error("Erreur lors du calcul de retraite :", e);
            alert("Erreur lors du calcul. Voir la console.");
        }
    }

    // ---------------- UI ----------------

    // Extraction des données
    const pensionNette100 = resultat?.pensionMensuelleNette ?? 0;
    const pensionBrute100 = resultat?.pensionMensuelleBrute ?? 0;
    const trimestresAcquis = resultat?.trimestresTotal ?? 0;
    const trimestresRequis = resultat?.trimestresRequis ?? 0;
    const taux = resultat?.tauxEffectif ?? 0;
    const manque = trimestresRequis - trimestresAcquis;
    
    // Calcul dynamique pour la retraite progressive
    const pensionProgressiveNette = (pensionNette100 * pourcentageRetraite) / 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center pt-10 p-6 space-y-8">

            <FormulaireRetraite
                valeurs={valeurs}
                onChange={handleChange}
                onConfirm={handleConfirm}
            />

            {confirmedDate && (
                <div className="w-full max-w-2xl bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-center">
                    ✅ Date confirmée : <strong>{confirmedDate}</strong>
                </div>
            )}

            {resultat && (
                <div className="w-full max-w-3xl space-y-6">
                    
                    {/* BLOC 1 : LE TEXTE EXPLICATIF (ANALYSE) */}
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-600">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Analyse de votre situation</h3>
                        
                        <div className="text-gray-700 space-y-3 text-lg">
                            <p>
                                Pour un départ le <strong>{confirmedDate}</strong>, votre pension de base du Régime Général est estimée à :
                            </p>
                            
                            <div className="text-3xl font-bold text-purple-700 my-2">
                                {pensionNette100.toFixed(2)} € <span className="text-sm font-normal text-gray-500">nets / mois</span>
                            </div>
                            
                            <hr className="my-4"/>

                            <p>
                                <strong>Situation des trimestres :</strong> Vous avez validé <strong>{trimestresAcquis}</strong> trimestres 
                                sur les <strong>{trimestresRequis}</strong> requis pour votre génération.
                            </p>

                            {manque > 0 ? (
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-orange-800">
                                    ⚠️ <strong>Attention :</strong> Il vous manque <strong>{manque} trimestre{manque > 1 ? "s" : ""}</strong> pour obtenir le taux plein. 
                                    <br/>
                                    Une <strong>décote</strong> définitive est appliquée sur votre pension (Votre taux est de {(taux*100).toFixed(3)}% au lieu de 50%).
                                </div>
                            ) : (
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-green-800">
                                    ✅ <strong>Félicitations !</strong> Vous avez atteint le <strong>taux plein</strong> (50%).
                                    {manque < 0 && <span> Vous avez même {Math.abs(manque)} trimestre(s) de surcote !</span>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BLOC 2 : SIMULATEUR RETRAITE PROGRESSIVE */}
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            ⚖️ Option : Retraite Progressive
                        </h3>
                        
                        <p className="text-gray-600 mb-4">
                            Si vous souhaitez continuer à travailler à temps partiel, vous pouvez percevoir une fraction de votre retraite.
                            <br/><em>Sélectionnez la part de retraite que vous souhaitez toucher :</em>
                        </p>

                        {/* Boutons de sélection */}
                        <div className="flex justify-center gap-2 mb-6">
                            {[30, 50, 70, 100].map((pct) => (
                                <button
                                    key={pct}
                                    onClick={() => setPourcentageRetraite(pct)}
                                    className={`px-4 py-2 rounded-full font-medium transition ${
                                        pourcentageRetraite === pct 
                                        ? "bg-blue-600 text-white shadow-lg scale-105" 
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    {pct === 100 ? "Retraite Totale (100%)" : `${pct}% Pension`}
                                </button>
                            ))}
                        </div>

                        {/* Résultat dynamique */}
                        <div className="bg-blue-50 p-4 rounded-xl text-center">
                            <span className="text-gray-700">Montant perçu pour une retraite à <strong>{pourcentageRetraite}%</strong> :</span>
                            <div className="text-4xl font-bold text-blue-700 mt-2">
                                {pensionProgressiveNette.toFixed(2)} € <span className="text-lg font-normal text-gray-500">/ mois</span>
                            </div>
                            {pourcentageRetraite < 100 && (
                                <p className="text-sm text-blue-600 mt-2 italic">
                                    (Cela implique que vous continuiez à travailler à {100 - pourcentageRetraite}% de temps partiel)
                                </p>
                            )}
                        </div>
                    </div>

                    {/* BLOC 3 : DÉTAILS TECHNIQUES (Pliable ou discret) */}
                    <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-600">
                        <h4 className="font-bold mb-2">Détails techniques :</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>SAM (Salaire Annuel Moyen) : {resultat.sam} €</li>
                            <li>Pension Brute (100%) : {pensionBrute100.toFixed(2)} €</li>
                            <li>Trimestres Cotisés : {resultat.trimestresAcquis}</li>
                            <li>Majoration (Enfants/Service) : {resultat.trimestresMajoration}</li>
                        </ul>
                    </div>

                </div>
            )}
        </div>
    );
}