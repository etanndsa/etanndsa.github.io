// =============================================================================
// 1. CONSTANTES & CONFIGURATION (Rien ne change ici)
// =============================================================================
export const FRF_TO_EUR = 1 / 6.55957;
export const TAUX_PLEIN = 0.5;
export const DECOTE_PAR_TRIMESTRE = 0.00625;
export const SURCOTE_PAR_TRIMESTRE = 0.0125;
export const RETENUES_SOCIALES = 0.092;

export const PASS_PAR_ANNEE: Record<number, number> = {
    1962: 1464, 1963: 1592, 1964: 1738, 1965: 1866, 1966: 1976, 1967: 2086,
    1968: 2195, 1969: 2488, 1970: 2744, 1971: 3018, 1972: 3348, 1973: 3732,
    1974: 4244, 1975: 5031, 1976: 5781, 1977: 6604, 1978: 7318, 1979: 8177,
    1980: 9165, 1981: 10482, 1982: 12504, 1983: 13977, 1984: 15184, 1985: 16272,
    1986: 17105, 1987: 17809, 1988: 18349, 1989: 19099, 1990: 19977, 1991: 21001,
    1992: 21971, 1993: 22840, 1994: 23343, 1995: 23773, 1996: 24578, 1997: 25099,
    1998: 25776, 1999: 26471, 2000: 26892, 2001: 27349, 2002: 28224, 2003: 29184,
    2004: 29712, 2005: 30192, 2006: 31068, 2007: 32184, 2008: 33276, 2009: 34308,
    2010: 34620, 2011: 35352, 2012: 36372, 2013: 37032, 2014: 37548, 2015: 38040,
    2016: 38616, 2017: 39228, 2018: 39732, 2019: 40524, 2020: 41136, 2021: 41136,
    2022: 41136, 2023: 43992, 2024: 46368
};

export const SMIC_HORAIRE_PAR_ANNEE: Record<number, number> = {
    1980: 2.1343, 1981: 2.5855, 1982: 3.0934, 1983: 3.4820, 1984: 4.0539,
    1985: 4.2033, 1986: 4.3414, 1987: 4.5431, 1988: 4.6525, 1989: 4.7689,
    1990: 4.9791, 1991: 5.0615, 1992: 5.1925, 1993: 5.3089, 1994: 5.4219,
    1995: 5.5401, 1996: 5.7503, 1997: 5.7503, 1998: 6.0101, 1999: 6.2078,
    2000: 6.4230, 2001: 6.6657, 2002: 6.83, 2003: 7.03, 2004: 7.19,
    2005: 7.61, 2006: 8.03, 2007: 8.27, 2008: 8.44, 2009: 8.71,
    2010: 8.82, 2011: 9.00, 2012: 9.22, 2013: 9.40, 2014: 9.53,
    2015: 9.61, 2016: 9.67, 2017: 9.76, 2018: 9.88, 2019: 10.03,
    2020: 10.15, 2021: 10.25, 2022: 10.57, 2023: 11.07, 2024: 11.52
};

export const COEF_REVALO: Record<number, number> = {
    1984: 2.042, 1985: 1.957, 1986: 1.913, 1987: 1.842, 1988: 1.8,
    1989: 1.736, 1990: 1.689, 1991: 1.663, 1992: 1.609, 1993: 1.609,
    1994: 1.581, 1995: 1.563, 1996: 1.525, 1997: 1.509, 1998: 1.492,
    1999: 1.474, 2000: 1.467, 2001: 1.437, 2002: 1.406, 2003: 1.383,
    2004: 1.362, 2005: 1.336, 2006: 1.313, 2007: 1.291, 2008: 1.279,
    2009: 1.268, 2010: 1.256, 2011: 1.245, 2012: 1.221, 2013: 1.195,
    2014: 1.181, 2015: 1.181, 2016: 1.18, 2017: 1.18, 2018: 1.171,
    2019: 1.154, 2020: 1.143, 2021: 1.139, 2022: 1.127, 2023: 1.076,
    2024: 1.022
};

export const TRIMESTRES_REQUIS_PAR_NAISSANCE: Record<number, number> = {
    1960: 167, 1961: 168, 1962: 169, 1963: 170, 1964: 171,
    1965: 172, 1966: 172, 1967: 172, 1968: 172, 1969: 172, 1970: 172
};

export const AGE_LEGAL_PAR_NAISSANCE: Record<number, number> = {
    1960: 62, 1961: 62, 1962: 62.25, 1963: 62.5, 1964: 62.75,
    1965: 63, 1966: 63.25, 1967: 63.5, 1968: 63.75, 1969: 64, 1970: 64
};

// =============================================================================
// 2. INTERFACES MISES À JOUR (Pour matcher ton UI)
// =============================================================================
export interface PeriodInput {
    id?: number | string;
    debut: string;
    fin: string;
    salaire?: number | null;
    salaireEuro?: number | null;
    devise?: 'EUR' | 'FRF' | null;
    valide?: boolean;

    // ✅ NOUVEAU : Gestion des types de périodes
    type?: string; // 'TRAVAIL', 'MALADIE', 'CHOMAGE', etc.
    trimestresAssimiles?: number; // Nombre de trimestres forcés pour les périodes assimilées
}

export interface PersonInfo {
    dateNaissance: string;
    handicape?: boolean;
    // ✅ NOUVEAU : Gestion du militaire
    militaire?: boolean;
    enfants?: Array<{ dateNaissance: string; adopte?: boolean; adoptionAnnee?: number }>;
    ageDepartSouhaite: string;
}

export interface RetraiteResult {
    sam: number;
    trimestresParAnnee: Record<number, number>;
    trimestresAcquis: number;
    trimestresMajoration: number;
    trimestresTotal: number;
    trimestresRequis: number;
    tauxEffectif: number;
    pensionAnnuelleBrute: number;
    pensionMensuelleBrute: number;
    pensionMensuelleNette: number;
    details: any;
}

// =============================================================================
// 3. FONCTIONS UTILITAIRES
// =============================================================================
function toDate(d: string) { return new Date(d + 'T00:00:00'); }
function daysBetween(a: Date, b: Date) { return Math.floor((b.getTime() - a.getTime()) / (24 * 3600 * 1000)) + 1; }
function ageInYearsFraction(dateNaissance: string, date: string) {
    const b = toDate(dateNaissance);
    const d = toDate(date);
    let years = d.getFullYear() - b.getFullYear();
    const m = d.getMonth() - b.getMonth();
    const day = d.getDate() - b.getDate();
    return years + (m / 12) + (day / 365);
}

function getTrimestresRequis(anneeNaissance: number) {
    return TRIMESTRES_REQUIS_PAR_NAISSANCE[anneeNaissance] ?? 172;
}
function getAgeLegal(anneeNaissance: number) {
    return AGE_LEGAL_PAR_NAISSANCE[anneeNaissance] ?? 64;
}

// Calcul des trimestres validés par le SALAIRE (150 x SMIC)
export function calcTrimestresForYear(salaireAnnuel: number, year: number): number {
    const smicHoraire = SMIC_HORAIRE_PAR_ANNEE[year];
    if (!smicHoraire || smicHoraire <= 0) return 0;

    // Règle : 150 heures de SMIC = 1 trimestre
    const seuil = 150 * smicHoraire;
    return Math.min(4, Math.floor(salaireAnnuel / seuil));
}

// Distribution du salaire sur les années (prorata temporis)
function distributePeriodSalaryByYear(p: PeriodInput): Record<number, number> {
    const out: Record<number, number> = {};
    if (p.salaire == null && p.salaireEuro == null) return out;

    // On utilise salaireEuro s'il existe, sinon on convertit
    const totalEuro = p.salaireEuro != null ? p.salaireEuro : (p.salaire != null ? (p.devise === 'FRF' ? p.salaire * FRF_TO_EUR : p.salaire) : 0);
    if (!totalEuro || totalEuro <= 0) return out;

    let start = toDate(p.debut);
    let end = toDate(p.fin);
    if (end < start) { const t = start; start = end; end = t; }

    const totalDays = daysBetween(start, end);

    for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
        const yearStart = new Date(y, 0, 1);
        const yearEnd = new Date(y, 11, 31);
        const segStart = start > yearStart ? start : yearStart;
        const segEnd = end < yearEnd ? end : yearEnd;

        if (segEnd < segStart) continue;

        const segDays = daysBetween(segStart, segEnd);
        const amountForYear = (totalEuro * (segDays / totalDays));
        out[y] = (out[y] || 0) + amountForYear;
    }
    return out;
}

// Chargement des salaires carrière longue (Utilitaire demandé précédemment)
export function loadSalairesAvant20EnEuro(): Record<number, number> {
    const raw = localStorage.getItem("salairesAvant20") || "{}";
    let parsed: Record<string, { amount: number; devise: "EUR" | "FRF" }> = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }

    const out: Record<number, number> = {};
    for (const k of Object.keys(parsed)) {
        const y = Number(k);
        const item = parsed[k];
        if (!item) continue;
        const amount = Number(item.amount || 0);
        const devise = item.devise || "EUR";
        const euro = devise === "FRF" ? amount * FRF_TO_EUR : amount;
        out[y] = Math.round(euro * 100) / 100;
    }
    return out;
}

export function detectCarriereLongueEligibility(dateNaissance: string) {
    const birthYear = Number(dateNaissance.substring(0, 4));
    const salairesAvant20 = loadSalairesAvant20EnEuro();
    let tAvant16 = 0, tAvant18 = 0, tAvant20 = 0;

    for (const yearStr of Object.keys(salairesAvant20)) {
        const year = Number(yearStr);
        const salaire = salairesAvant20[year];
        const smic = SMIC_HORAIRE_PAR_ANNEE[year];
        if (!smic) continue;
        const tr = Math.min(4, Math.floor(salaire / (150 * smic)));

        if (year <= birthYear + 16) tAvant16 += tr;
        if (year <= birthYear + 18) tAvant18 += tr;
        if (year <= birthYear + 20) tAvant20 += tr;
    }
    return { eligibleEarly: (tAvant16 >= 5 || tAvant18 >= 5 || tAvant20 >= 5), tAvant16, tAvant18, tAvant20 };
}

// =============================================================================
// 4. CŒUR DU CALCUL : TRAVAIL + ASSIMILÉS + PLAFOND 4
// =============================================================================
export function computeSamAndTrimestresByYear(periods: PeriodInput[]) {
    const annualSalaries: Record<number, number> = {};
    const annualAssimiles: Record<number, number> = {}; // Stocke les trimestres forcés (Maladie/Chômage)

    // 1. On parcourt toutes les périodes
    for (const p of periods) {
        if (!p.valide) continue;

        const startYear = parseInt(p.debut.substring(0, 4));
        const type = p.type || 'TRAVAIL'; // Défaut TRAVAIL si non spécifié

        if (type === 'TRAVAIL') {
            // Cas TRAVAIL : On distribue le salaire sur les années
            const salMap = distributePeriodSalaryByYear(p);
            for (const yearKey of Object.keys(salMap)) {
                const year = Number(yearKey);
                annualSalaries[year] = (annualSalaries[year] || 0) + salMap[year];
            }
        } else {
            // Cas ASSIMILÉ (Maladie, Chômage) : On ajoute les trimestres directement
            // Note : On attribue tout à l'année de début pour simplifier, 
            // ou on pourrait faire une distribution temporelle si p.fin >> p.debut
            if (p.trimestresAssimiles && p.trimestresAssimiles > 0) {
                annualAssimiles[startYear] = (annualAssimiles[startYear] || 0) + p.trimestresAssimiles;
            }
        }
    }

    // 2. On liste toutes les années concernées
    const yearsSet = new Set([...Object.keys(annualSalaries), ...Object.keys(annualAssimiles)].map(Number));
    const years = Array.from(yearsSet).sort((a, b) => a - b);

    const perYear: { year: number, salaireRaw: number, salairePlafonne: number, salaireRevalo: number, trimestres: number }[] = [];

    for (const y of years) {
        // A. Calcul via l'argent (Salaire)
        const salaire = annualSalaries[y] || 0;
        const pass = PASS_PAR_ANNEE[y] ?? Infinity;
        const salairePlaf = Math.min(salaire, pass);
        const coef = COEF_REVALO[y] ?? 1;
        const salaireRevalo = salairePlaf * coef;

        const trimestresArgent = calcTrimestresForYear(salaire, y);

        // B. Ajout via le temps (Assimilés)
        const trimestresForce = annualAssimiles[y] || 0;

        // C. ✅ RÈGLE D'OR : Plafonner le total (Travail + Maladie) à 4 par an
        const trimestres = Math.min(4, trimestresArgent + trimestresForce);

        perYear.push({ year: y, salaireRaw: salaire, salairePlafonne: salairePlaf, salaireRevalo, trimestres });
    }

    // 3. Calcul du SAM (25 meilleures années)
    // On ne garde que les années ayant un salaire > 0 pour le calcul du SAM (la maladie à 0€ n'entre pas dans la moyenne)
    const validYearsForSam = perYear.filter(p => p.salaireRaw > 0);
    const top25 = validYearsForSam.sort((a, b) => b.salaireRevalo - a.salaireRevalo).slice(0, 25);
    const sam = top25.length > 0 ? (top25.reduce((s, a) => s + a.salaireRevalo, 0) / 25) : 0;

    // 4. Total des trimestres acquis
    const trimestresParAnnee: Record<number, number> = {};
    let trimestresTotal = 0;
    for (const p of perYear) {
        trimestresParAnnee[p.year] = p.trimestres;
        trimestresTotal += p.trimestres;
    }

    return { sam: Math.round(sam * 100) / 100, trimestresParAnnee, trimestresAcquis: trimestresTotal, perYear };
}


// =============================================================================
// 5. FONCTION PRINCIPALE EXPORTÉE
// =============================================================================
export function calculateRetraiteFromPeriods(person: PersonInfo, periods: PeriodInput[], dateRetraiteSouhaitee: string): RetraiteResult {

    // 1) Calcul SAM et Trimestres "De base" (Travail + Assimilés annuels)
    const { sam, trimestresParAnnee, trimestresAcquis, perYear } = computeSamAndTrimestresByYear(periods);

    // 2) Majoration Enfants
    const enfants = person.enfants || [];
    let trimestresMajoration = 0;
    for (const e of enfants) {
        if (e.dateNaissance) {
            if (toDate(e.dateNaissance) < toDate(dateRetraiteSouhaitee)) {
                // Simplification : 8 trimestres par enfant né/adopté avant la retraite
                trimestresMajoration += 8;
            }
        }
    }

    // 3) ✅ Majoration Service Militaire (Forfaitaire)
    // Si la case "J'ai fait mon service" est cochée, on ajoute 4 trimestres
    let trimestresService = 0;
    if (person.militaire) {
        trimestresService = 4;
    }

    // 4) Total Général
    const trimestresTotal = trimestresAcquis + trimestresMajoration + trimestresService;

    // 5) Paramètres légaux
    const anneeNaissance = Number(person.dateNaissance.substring(0, 4));
    const trimestresRequis = getTrimestresRequis(anneeNaissance);
    const ageLegal = getAgeLegal(anneeNaissance);

    // 6) Décote / Surcote
    const ageDepartFraction = ageInYearsFraction(person.dateNaissance, dateRetraiteSouhaitee);
    const ecart = trimestresTotal - trimestresRequis;

    // Plafond surcote : on ne surcote que les trimestres travaillés APRÈS l'âge légal
    const trimestresApresAgeLegal = Math.max(0, Math.floor((ageDepartFraction - ageLegal) * 4));
    const surcoteTrimestres = Math.min(Math.max(0, ecart), trimestresApresAgeLegal);

    let taux = TAUX_PLEIN;

    // Calcul Décote
    if (ecart < 0) {
        const trimestresManquants = Math.abs(ecart);
        const decote = trimestresManquants * DECOTE_PAR_TRIMESTRE;
        // Plancher décote (max 12 trimestres de pénalité)
        taux = Math.max(TAUX_PLEIN - decote, TAUX_PLEIN - (12 * DECOTE_PAR_TRIMESTRE));
    }

    // Calcul Surcote
    if (surcoteTrimestres > 0) {
        taux += surcoteTrimestres * SURCOTE_PAR_TRIMESTRE;
    }

    // Gestion Carrière Longue (Annulation décote)
    const carriereLongue = detectCarriereLongueEligibility(person.dateNaissance);
    if (carriereLongue.eligibleEarly && ecart < 0) {
        taux = TAUX_PLEIN; // Pas de décote si carrière longue
    }

    // 7) Proratisation (Ratio Durée)
    // On ne peut pas dépasser 1 (si on a trop de trimestres, le ratio reste 1, c'est la surcote qui joue)
    const ratio = Math.min(trimestresTotal / trimestresRequis, 1);

    // 8) Calcul final Pension
    const anneeDepart = toDate(dateRetraiteSouhaitee).getFullYear();
    const passDepart = PASS_PAR_ANNEE[anneeDepart] ?? PASS_PAR_ANNEE[2024] ?? 47100;

    // Formule de base : SAM * Taux * Ratio
    const pensionBase = sam * Math.min(taux, TAUX_PLEIN) * ratio;

    // Plafonnement de la pension de base à 50% du PASS
    const pensionPlafonnee = Math.min(pensionBase, passDepart * TAUX_PLEIN);

    // Ajout du montant de la surcote (calculée sur le SAM, vient EN PLUS du plafond)
    const montantSurcote = sam * Math.max(0, taux - TAUX_PLEIN) * ratio;

    let pensionAnnuelleBrute = pensionPlafonnee + montantSurcote;

    // Majoration 10% pour 3 enfants
    if ((enfants.length || 0) >= 3) {
        pensionAnnuelleBrute *= 1.10;
    }

    // Majoration Handicap (simplifié)
    if (person.handicape && trimestresAcquis >= trimestresRequis) {
        pensionAnnuelleBrute *= (1 + (trimestresAcquis / trimestresRequis) / 3);
    }

    const pensionMensuelleBrute = pensionAnnuelleBrute / 12;
    const pensionMensuelleNette = pensionMensuelleBrute * (1 - RETENUES_SOCIALES);

    return {
        sam: Math.round(sam * 100) / 100,
        trimestresParAnnee,
        trimestresAcquis,
        trimestresMajoration: trimestresMajoration + trimestresService, // On englobe le service ici pour l'affichage
        trimestresTotal,
        trimestresRequis,
        tauxEffectif: Math.round(taux * 100000) / 1000,
        pensionAnnuelleBrute: Math.round(pensionAnnuelleBrute * 100) / 100,
        pensionMensuelleBrute: Math.round(pensionMensuelleBrute * 100) / 100,
        pensionMensuelleNette: Math.round(pensionMensuelleNette * 100) / 100,
        details: { perYear }
    } as RetraiteResult;
}