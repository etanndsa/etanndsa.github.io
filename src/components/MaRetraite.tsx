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
                enfants: mesInfos.enfants ?? [],
                ageDepartSouhaite: date
            };

            // appel du nouveau moteur complet CNAV
            const res = calculateRetraiteFromPeriods(person, periodes, date);

            setResultat(res);

            alert("Calcul effectué !");
        } catch (e) {
            console.error("Erreur lors du calcul de retraite :", e);
            alert("Erreur lors du calcul. Voir la console.");
        }
    }

    // ---------------- UI ----------------

    const pensionMensuelleNette = resultat?.pensionMensuelleNette ?? null;
    const pensionMensuelleBrute = resultat?.pensionMensuelleBrute ?? null;
    const trimestresRequis = resultat?.trimestresRequis ?? null;
    const handicape = resultat?.handicape ?? false;

    // message résumé
    let message = "Aucun calcul effectué.";
    let messageColor = "text-gray-700";

    if (resultat) {
        const manque = resultat.trimestresTotal - resultat.trimestresRequis;

        if (manque < 0) {
            message = `⚠️ Il manque ${Math.abs(manque)} trimestre(s) pour le taux plein.`;
            messageColor = "text-orange-600";
        } else if (manque === 0) {
            message = "✅ Taux plein atteint.";
            messageColor = "text-green-600";
        } else {
            message = `💪 ${manque} trimestre(s) supplémentaires.`;
            messageColor = "text-blue-600";
        }
    }

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
                <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm max-w-lg w-full">

                    <p className={`text-lg font-semibold mb-4 ${messageColor}`}>{message}</p>

                    <div className="mb-3">
                        <span className="text-gray-700">Pension nette estimée :</span>{" "}
                        <span className="font-bold text-gray-900">
                            {pensionMensuelleNette
                                ? `${pensionMensuelleNette.toFixed(2)} € / mois`
                                : "—"}
                        </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                        (Brut : {pensionMensuelleBrute
                            ? `${pensionMensuelleBrute.toFixed(2)} € / mois`
                            : "—"} — Trimestres requis : {trimestresRequis ?? "—"}
                        {handicape ? " — Travailleur handicapé" : ""})
                    </div>
                </div>
            )}

            <div className="mt-4 p-4 bg-white rounded-md border text-sm text-gray-700 space-y-1">

                <p>
                    <span className="font-semibold">Trimestres cotisés :</span>{" "}
                    {resultat?.trimestresAcquis ?? "—"}
                </p>

                <p>
                    <span className="font-semibold">Majoration (enfants / handicap) :</span>{" "}
                    {resultat?.trimestresMajoration ?? 0}
                </p>

                <p>
                    <span className="font-semibold">Total pris en compte :</span>{" "}
                    {(resultat?.trimestresTotal ?? 0)}
                </p>

            </div>

        </div>

    );
}
