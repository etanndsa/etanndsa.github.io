import { Check, AlertTriangle } from "lucide-react"; // Ajout icone alerte
import { calculateRetraiteFromPeriods, getAgeLegal, detectCarriereLongueEligibility } from "../utils/calculRetraite";
import FormulaireRetraite from "./FormulaireRetraites";
import { useState, useEffect } from "react";

// Petit utilitaire pour calculer l'âge précis (années pleines)
function getAge(dateNaissance: string, dateCible: string) {
    const birth = new Date(dateNaissance);
    const target = new Date(dateCible);
    let age = target.getFullYear() - birth.getFullYear();
    const m = target.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && target.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// Petit utilitaire pour l'âge précis (fractionnaire pour comparaison stricte)
function getAgeExact(dateNaissance: string, dateCible: string) {
    const birth = new Date(dateNaissance).getTime();
    const target = new Date(dateCible).getTime();
    return (target - birth) / (1000 * 60 * 60 * 24 * 365.25);
}

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

    const [confirmedDate, setConfirmedDate] = useState<string | null>(() => {
        return localStorage.getItem("confirmedRetirementDate");
    });

    const [resultat, setResultat] = useState<any | null>(null);
    const [pourcentageRetraite, setPourcentageRetraite] = useState(100);
    const [estHandicape, setEstHandicape] = useState(false);
    const [dateNaissanceUser, setDateNaissanceUser] = useState<string>("");

    // 🚨 État pour gérer l'erreur d'âge légal
    const [erreurAgeLegal, setErreurAgeLegal] = useState<string | null>(null);

    async function handleConfirm(date: string) {
        if (!date) {
            alert("Veuillez choisir une date avant de confirmer.");
            return;
        }

        setConfirmedDate(date);
        localStorage.setItem("confirmedRetirementDate", date);
        setErreurAgeLegal(null); // Reset erreur précédente

        try {
            const mesInfos = JSON.parse(localStorage.getItem("mesInfos") || "{}");
            const periodes = JSON.parse(localStorage.getItem("periodesStockees") || "[]");

            if (!mesInfos.dateNaissance) {
                alert("Veuillez entrer la date de naissance dans les informations personnelles.");
                return;
            }

            setEstHandicape(mesInfos.handicape === true);
            setDateNaissanceUser(mesInfos.dateNaissance);

            // 1. On lance le calcul normalement
            const person = {
                dateNaissance: mesInfos.dateNaissance,
                handicape: mesInfos.handicape ?? false,
                handicapeDepuis: mesInfos.handicapeDepuis,
                sexe: mesInfos.sexe,
                militaire: mesInfos.militaire ?? false,
                serviceMilitaireJours: mesInfos.serviceMilitaireJours ?? 0,
                enfants: mesInfos.enfants ?? [],
                ageDepartSouhaite: date
            };

            const res = calculateRetraiteFromPeriods(person, periodes, date);

            // ---------------------------------------------------------
            // 🛑 2. VÉRIFICATION DE L'ÂGE LÉGAL (Blocage)
            // ---------------------------------------------------------
            const anneeNaissance = parseInt(mesInfos.dateNaissance.substring(0, 4));
            const ageLegal = getAgeLegal(anneeNaissance); // Ex: 64
            const ageAuDepartExact = getAgeExact(mesInfos.dateNaissance, date);

            // Vérif 1 : Si RATH est validé par le moteur de calcul, c'est OK
            const isRathOK = res.details?.estEligibleRATH;

            // Vérif 2 : Carrière Longue (On recalcule vite fait l'éligibilité pour vérifier)
            // Note: Idéalement, calculateRetraiteFromPeriods devrait renvoyer l'info carrière longue
            const carriereLongueCheck = detectCarriereLongueEligibility(mesInfos.dateNaissance); 
            // On vérifie grossièrement si l'âge visé correspond à un départ anticipé possible
            const isCarriereLongueOK = carriereLongueCheck.eligibleEarly && ageAuDepartExact >= (carriereLongueCheck.ageDepartAnticipe || 60);

            // LOGIQUE DE BLOCAGE
            if (ageAuDepartExact < ageLegal && !isRathOK && !isCarriereLongueOK) {
                setErreurAgeLegal(`Impossible de partir avant l'âge légal de ${ageLegal} ans pour votre génération (${anneeNaissance}). Vous demandez un départ à ${ageAuDepartExact.toFixed(1)} ans.`);
                setResultat(null); // On n'affiche pas de résultat faux
                return;
            }
            // ---------------------------------------------------------

            setResultat(res);
            setPourcentageRetraite(100);

        } catch (e) {
            console.error("Erreur lors du calcul de retraite :", e);
            alert("Erreur lors du calcul. Voir la console.");
        }
    }

    // ---------------- UI ----------------

    const pensionNette100 = resultat?.pensionMensuelleNette ?? 0;
    const pensionBrute100 = resultat?.pensionMensuelleBrute ?? 0;
    const trimestresAcquis = resultat?.trimestresAcquis ?? 0;
    const trimestresCotises = resultat?.trimestresCotises ?? 0;
    const trimestresRequis = resultat?.trimestresRequis ?? 0;
    const vraisTrimestresSurcote = resultat?.trimestresSurcote ?? 0;
    const estRATH = resultat?.details?.estEligibleRATH ?? false;
    const manque = Math.max(0, trimestresRequis - trimestresAcquis);
    const pensionProgressiveNette = (pensionNette100 * pourcentageRetraite) / 100;

    const ageAuDepart = confirmedDate && dateNaissanceUser ? getAge(dateNaissanceUser, confirmedDate) : 0;
    const isEligibleProgressive = ageAuDepart >= 60 && trimestresAcquis >= 150;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center pt-10 p-6 space-y-8">

            <FormulaireRetraite
                valeurs={valeurs}
                onChange={handleChange}
                onConfirm={handleConfirm}
            />

            {confirmedDate && (
                <div className="w-full max-w-2xl bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-center">
                    Date confirmée : <strong>{confirmedDate}</strong> ({ageAuDepart} ans)
                </div>
            )}

            {/* 🛑 AFFICHAGE DE L'ERREUR D'ÂGE */}
            {erreurAgeLegal && (
                <div className="w-full max-w-2xl bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md flex items-start gap-3 animate-pulse">
                    <AlertTriangle size={24} />
                    <div>
                        <h3 className="font-bold">Départ impossible</h3>
                        <p>{erreurAgeLegal}</p>
                        <p className="text-sm mt-2 text-red-600">
                            Sauf dispositif particulier (Carrière longue, Handicap), vous devez attendre l'âge légal.
                        </p>
                    </div>
                </div>
            )}

            {resultat && !erreurAgeLegal && (
                <div className="w-full max-w-3xl space-y-6">

                    {/* BLOC 1 : ANALYSE */}
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-600">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Analyse de votre situation</h3>

                        <div className="text-gray-700 space-y-3 text-lg">
                            <p>
                                Pour un départ le <strong>{confirmedDate}</strong>, votre pension de base du Régime Général est estimée à :
                            </p>

                            <div className="text-3xl font-bold text-purple-700 my-2">
                                {pensionNette100.toFixed(2)} € <span className="text-sm font-normal text-gray-500">nets / mois</span>
                            </div>

                            <hr className="my-4" />

                            {/* SCÉNARIOS D'AFFICHAGE (RATH, HANDICAP, STANDARD) */}
                            {estRATH ? (
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-purple-900">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">♿</span>
                                        <strong>Retraite Anticipée Handicap (RATH) validée !</strong>
                                    </div>
                                    <p className="text-sm">
                                        Vous pouvez partir dès maintenant au <strong>taux plein (50%)</strong>.
                                        <br />
                                        Vous avez validé les <strong>{trimestresCotises} trimestres cotisés</strong> requis pour votre âge.
                                    </p>
                                </div>
                            ) : estHandicape ? (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-blue-900">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">ℹ️</span>
                                        <strong>Taux plein pour Inaptitude/Handicap</strong>
                                    </div>
                                    <p className="text-sm">
                                        Vous ne remplissez pas les conditions du départ anticipé RATH, 
                                        mais votre statut vous garantit le <strong>taux plein (50%)</strong> dès l'âge légal, sans décote.
                                    </p>
                                    {manque > 0 && (
                                        <p className="text-xs mt-2 text-blue-700">
                                            (Note : Votre pension est proratisée car il vous manque {manque} trimestres d'assurance).
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <p>
                                        <strong>Situation des trimestres :</strong> Vous avez validé <strong>{trimestresAcquis}</strong> trimestres
                                        sur les <strong>{trimestresRequis}</strong> requis.
                                    </p>

                                    {manque > 0 ? (
                                        <div className="bg-orange-50 p-4 mt-3 rounded-lg border border-orange-200 text-orange-800">
                                            <strong>Attention :</strong> Il vous manque <strong>{manque} trimestre{manque > 1 ? "s" : ""}</strong> pour obtenir le taux plein.
                                            <br />
                                            Une <strong>décote</strong> définitive est appliquée.
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 p-4 mt-3 rounded-lg border border-green-200 text-green-800">
                                            <strong>Félicitations !</strong> Vous avez atteint le <strong>taux plein</strong> (50%).
                                            {vraisTrimestresSurcote > 0 && (
                                                <span>
                                                    <br />
                                                    Bonus : Vous bénéficiez d'une <strong>surcote</strong> grâce à <strong>{vraisTrimestresSurcote} trimestre(s)</strong> cotisé(s) après l'âge légal !
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BLOC 2 : SIMULATEUR RETRAITE PROGRESSIVE */}
                    <div className={`p-6 rounded-xl shadow-md border-l-4 ${isEligibleProgressive ? "bg-white border-blue-500" : "bg-gray-50 border-gray-300 opacity-75"}`}>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            Option : Retraite Progressive
                            {!isEligibleProgressive && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Non éligible</span>}
                        </h3>

                        {/* ✅ MESSAGE D'ÉLIGIBILITÉ */}
                        {isEligibleProgressive ? (
                            <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-sm rounded border border-blue-100 flex items-center gap-2">
                                <Check size={16} />
                                <strong>Bonne nouvelle :</strong> Vous avez plus de 60 ans et 150 trimestres. Vous êtes éligible à la retraite progressive !
                            </div>
                        ) : (
                            <div className="mb-4 p-3 bg-gray-100 text-gray-600 text-sm rounded border border-gray-200">
                                <strong>Condition non remplie :</strong> Pour accéder à la retraite progressive, vous devez avoir au moins <strong>60 ans</strong> et <strong>150 trimestres</strong> validés.
                                <br/>
                                <span className="text-xs mt-1 block">
                                    (Votre situation : {ageAuDepart} ans et {trimestresAcquis} trimestres)
                                </span>
                            </div>
                        )}

                        <p className="text-gray-600 mb-4">
                            Si vous souhaitez continuer à travailler à temps partiel, vous pouvez percevoir une fraction de votre retraite.
                        </p>

                        <div className="flex justify-center gap-2 mb-6">
                            {[30, 50, 70, 100].map((pct) => (
                                <button
                                    key={pct}
                                    disabled={!isEligibleProgressive && pct !== 100}
                                    onClick={() => setPourcentageRetraite(pct)}
                                    className={`px-4 py-2 rounded-full font-medium transition 
                                    ${pourcentageRetraite === pct
                                        ? "bg-blue-600 text-white shadow-lg scale-105"
                                        : isEligibleProgressive 
                                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                    }`}
                                >
                                    {pct === 100 ? "Retraite Totale (100%)" : `${pct}% Pension`}
                                </button>
                            ))}
                        </div>

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

                    {/* BLOC 3 : DÉTAILS TECHNIQUES */}
                    <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-600">
                        <h4 className="font-bold mb-2">Détails techniques :</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>SAM (Salaire Annuel Moyen) : {resultat.sam} €</li>
                            <li>Pension Brute (100%) : {pensionBrute100.toFixed(2)} €</li>
                            <li>Trimestres Validés (Total) : {trimestresAcquis}</li>
                            {estHandicape && <li>Trimestres Cotisés (RATH) : {trimestresCotises}</li>}
                            <li>Majoration (Enfants/Service) : {resultat.trimestresMajoration}</li>
                            <li>Surcote appliquée : {vraisTrimestresSurcote}</li>
                        </ul>
                    </div>

                </div>
            )}
        </div>
    );
}