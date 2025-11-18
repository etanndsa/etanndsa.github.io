export const FRF_TO_EUR = 1 / 6.55957;
export const TAUX_PLEIN = 0.5;
export const DECOTE_PAR_TRIMESTRE = 0.00625;
export const SURCOTE_PAR_TRIMESTRE = 0.0125;
export const RETENUES_SOCIALES = 0.092;

export const PASS_PAR_ANNEE: Record<number, number> = {
  1962: 1464,
  1963: 1592,
  1964: 1738,
  1965: 1866,
  1966: 1976,
  1967: 2086,
  1968: 2195,
  1969: 2488,
  1970: 2744,
  1971: 3018,
  1972: 3348,
  1973: 3732,
  1974: 4244,
  1975: 5031,
  1976: 5781,
  1977: 6604,
  1978: 7318,
  1979: 8177,
  1980: 9165,
  1981: 10482,
  1982: 12504,
  1983: 13977,
  1984: 15184,
  1985: 16272,
  1986: 17105,
  1987: 17809,
  1988: 18349,
  1989: 19099,
  1990: 19977,
  1991: 21001,
  1992: 21971,
  1993: 22840,
  1994: 23343,
  1995: 23773,
  1996: 24578,
  1997: 25099,
  1998: 25776,
  1999: 26471,
  2000: 26892,
  2001: 27349,
  2002: 28224,
  2003: 29184,
  2004: 29712,
  2005: 30192,
  2006: 31068,
  2007: 32184,
  2008: 33276,
  2009: 34308,
  2010: 34620,
  2011: 35352,
  2012: 36372,
  2013: 37032,
  2014: 37548,
  2015: 38040,
  2016: 38616,
  2017: 39228,
  2018: 39732,
  2019: 40524,
  2020: 41136,
  2021: 41136,
  2022: 41136,
  2023: 43992,
  2024: 46368
  // la  source : https://baseircantec.retraites.fr/sites/default/files/2024-01/annexe401plafond_ss_2024.pdf
};

export const SMIC_HORAIRE_PAR_ANNEE: Record<number, number> = {
  1980: 2.1343,
  1981: 2.5855,
  1982: 3.0934,
  1983: 3.4820,
  1984: 4.0539,
  1985: 4.2033,
  1986: 4.3414,
  1987: 4.5431,
  1988: 4.6525,
  1989: 4.7689,
  1990: 4.9791,
  1991: 5.0615,
  1992: 5.1925,
  1993: 5.3089,
  1994: 5.4219,
  1995: 5.5401,
  1996: 5.7503,
  1997: 5.7503,
  1998: 6.0101,
  1999: 6.2078,
  2000: 6.4230,
  2001: 6.6657,
  2002: 6.83,
  2003: 7.03,
  2004: 7.19,
  2005: 7.61,
  2006: 8.03,
  2007: 8.27,
  2008: 8.44,
  2009: 8.71,
  2010: 8.82,
  2011: 9.00,
  2012: 9.22,
  2013: 9.40,
  2014: 9.53,
  2015: 9.61,
  2016: 9.67,
  2017: 9.76,
  2018: 9.88,
  2019: 10.03,
  2020: 10.15,
  2021: 10.25,
  2022: 10.57,
  2023: 11.07,
  2024: 11.52
  // source si la prof demande : https://www.insee.fr/fr/statistiques/1375188
};

// coefficient de revalorisation CNAV par année
export const COEF_REVALO: Record<number, number> = {
  1984: 2.042,
  1985: 1.957,
  1986: 1.913,
  1987: 1.842,
  1988: 1.8,
  1989: 1.736,
  1990: 1.689,
  1991: 1.663,
  1992: 1.609,
  1993: 1.609,
  1994: 1.581,
  1995: 1.563,
  1996: 1.525,
  1997: 1.509,
  1998: 1.492,
  1999: 1.474,
  2000: 1.467,
  2001: 1.437,
  2002: 1.406,
  2003: 1.383,
  2004: 1.362,
  2005: 1.336,
  2006: 1.313,
  2007: 1.291,
  2008: 1.279,
  2009: 1.268,
  2010: 1.256,
  2011: 1.245,
  2012: 1.221,
  2013: 1.195,
  2014: 1.181,
  2015: 1.181,
  2016: 1.18,
  2017: 1.18,
  2018: 1.171,
  2019: 1.154,
  2020: 1.143,
  2021: 1.139,
  2022: 1.127,
  2023: 1.076,
  2024: 1.022
  //source si la prof demande : https://legislation.lassuranceretraite.fr/Pdf/circulaire_cnav_2024_39_23122024.pdf
};

// trimestres requis par année de naissance (table simplifiée)
export const TRIMESTRES_REQUIS_PAR_NAISSANCE: Record<number, number> = {
  1960: 167, 1961: 168, 1962: 169, 1963: 170, 1964: 171,
  1965: 172, 1966: 172, 1967: 172, 1968: 172, 1969: 172, 1970: 172
};

// âge légal par année de naissance (simplifié)
export const AGE_LEGAL_PAR_NAISSANCE: Record<number, number> = {
  1960: 62, 1961: 62, 1962: 62.25, 1963: 62.5, 1964: 62.75,
  1965: 63, 1966: 63.25, 1967: 63.5, 1968: 63.75, 1969: 64, 1970: 64
};

// -------------------- Types --------------------
export interface PeriodInput {
  id?: number | string;
  debut: string; // YYYY-MM-DD
  fin: string;   // YYYY-MM-DD
  salaire?: number | null; // montant total perçu pendant la période (devise indiquée)
  salaireEuro?: number | null; // si déjà converti
  devise?: 'EUR' | 'FRF' | null;
  valide?: boolean;
}

export interface PersonInfo {
  dateNaissance: string; // YYYY-MM-DD
  handicape?: boolean;
  enfants?: Array<{ dateNaissance: string; adopte?: boolean; adoptionAnnee?: number }>;
  ageDepartSouhaite: string; // date de départ souhaitée YYYY-MM-DD
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

// -------------------- Helpers --------------------
function toDate(d: string) { return new Date(d + 'T00:00:00'); }
function daysBetween(a: Date, b: Date) { return Math.floor((b.getTime() - a.getTime()) / (24*3600*1000)) + 1; }

// prorate a period's salary into calendar years (returns map year -> amount in EUR)
function distributePeriodSalaryByYear(p: PeriodInput): Record<number, number> {
  const out: Record<number, number> = {};
  if (p.salaire == null && p.salaireEuro == null) return out;

  // convert to EUR if needed (salary field is total for the period)
  const totalEuro = p.salaireEuro != null ? p.salaireEuro : (p.salaire != null ? (p.devise === 'FRF' ? p.salaire * FRF_TO_EUR : p.salaire) : 0);
  if (!totalEuro || totalEuro <= 0) return out;

  let start = toDate(p.debut);
  let end = toDate(p.fin);
  if (end < start) { const t = start; start = end; end = t; }

  // iterate each calendar year overlapping the period and prorate by days in that year
  let cursor = new Date(start.getFullYear(), 0, 1);
  if (cursor < start) cursor = start;
  const totalDays = daysBetween(start, end);
  // iterate years from start.year to end.year
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

// build annual salaries from periods (sums multiple activities)
export function buildAnnualSalaries(periods: PeriodInput[]): Record<number, number> {
  const annual: Record<number, number> = {};
  for (const p of periods) {
    if (!p.valide) continue;
    const distributed = distributePeriodSalaryByYear(p);
    for (const yStr of Object.keys(distributed)) {
      const y = Number(yStr);
      annual[y] = (annual[y] || 0) + distributed[y];
    }
  }
  return annual;
}

// calculate trimestres for a given annual gross salary and year
export function calcTrimestresForYear(salaireAnnuel: number, year: number): number {
  const smicHoraire = SMIC_HORAIRE_PAR_ANNEE[year];
  if (!smicHoraire || smicHoraire <= 0) {
    // fallback : assume 150*10€ => 1500€ per quarter (NOT IDEAL — prefer filling SMIC table)
    const threshold = 150 * 10;
    return Math.min(4, Math.floor(salaireAnnuel / threshold));
  }
  const threshold = 150 * smicHoraire;
  return Math.min(4, Math.floor(salaireAnnuel / threshold));
}

// compute SAM (25 meilleures années revalorisées) and trimestres per year
export function computeSamAndTrimestresByYear(periods: PeriodInput[]) {
  const annual = buildAnnualSalaries(periods); // euros
  const years = Object.keys(annual).map(s => Number(s)).sort((a,b)=>a-b);
  const perYear: { year:number, salaireRaw:number, salairePlafonne:number, salaireRevalo:number, trimestres:number }[] = [];

  for (const y of years) {
    const salaire = annual[y] || 0;
    const pass = PASS_PAR_ANNEE[y] ?? Infinity;
    const salairePlaf = Math.min(salaire, pass);
    const coef = COEF_REVALO[y] ?? 1;
    const salaireRevalo = salairePlaf * coef;
    const trimestres = calcTrimestresForYear(salaire, y);
    perYear.push({ year: y, salaireRaw: salaire, salairePlafonne: salairePlaf, salaireRevalo, trimestres });
  }

  // SAM : prendre 25 meilleures années revalorisées
  const top25 = perYear.slice().sort((a,b)=>b.salaireRevalo - a.salaireRevalo).slice(0,25);
  const sam = top25.length>0 ? (top25.reduce((s,a)=>s+a.salaireRevalo,0) / 25) : 0;

  // total trimestres acquis = somme trimestres par année
  const trimestresParAnnee: Record<number, number> = {};
  let trimestresTotal = 0;
  for (const p of perYear) { trimestresParAnnee[p.year] = p.trimestres; trimestresTotal += p.trimestres; }

  return { sam: Math.round(sam*100)/100, trimestresParAnnee, trimestresAcquis: trimestresTotal, perYear };
}

// utility : get age in years (fraction) at a given date
function ageInYearsFraction(dateNaissance: string, date: string) {
  const b = toDate(dateNaissance);
  const d = toDate(date);
  let years = d.getFullYear() - b.getFullYear();
  const m = d.getMonth() - b.getMonth();
  const day = d.getDate() - b.getDate();
  let frac = years + (m/12) + (day/365);
  return frac;
}

// get trimestres requis and ageLegal (simple lookup)
function getTrimestresRequis(anneeNaissance: number) {
  return TRIMESTRES_REQUIS_PAR_NAISSANCE[anneeNaissance] ?? 172;
}
function getAgeLegal(anneeNaissance: number) {
  return AGE_LEGAL_PAR_NAISSANCE[anneeNaissance] ?? 64;
}

// main public function
export function calculateRetraiteFromPeriods(person: PersonInfo, periods: PeriodInput[], dateRetraiteSouhaitee: string): RetraiteResult {
  // 1) compute SAM and trimestres acquis
  const { sam, trimestresParAnnee, trimestresAcquis, perYear } = computeSamAndTrimestresByYear(periods);

  // 2) majorations enfants (simplifié)
  const enfants = person.enfants || [];
  // Majorations : on ajoute trimestres d'éducation si applicables (ici : simple 8 trimestres par enfant si non renseigné finement)
  // **REMARQUE :** pour être parfaitement conforme il faut appliquer règles d'adoption/naissance exactes
  let trimestresMajoration = 0;
  for (const e of enfants) {
    // si l'enfant né avant départ retraite et non adopté tardivement -> compte
    if (e.dateNaissance) {
      const anneeNaiss = Number(e.dateNaissance.substring(0,4));
      if (toDate(e.dateNaissance) < toDate(dateRetraiteSouhaitee)) {
        trimestresMajoration += 8; // simplifié : 8 trimestres par enfant (pratique courante)
      }
    }
  }

  // 3) trimestres totaux
  const trimestresTotal = trimestresAcquis + trimestresMajoration;

  // 4) trimestres requis et ages
  const anneeNaissance = Number(person.dateNaissance.substring(0,4));
  const trimestresRequis = getTrimestresRequis(anneeNaissance);
  const ageLegal = getAgeLegal(anneeNaissance);

  // 5) âge effectif de départ en années (fraction)
  const ageDepartFraction = ageInYearsFraction(person.dateNaissance, dateRetraiteSouhaitee);

  // 6) calcul décote / surcote
  const ecart = trimestresTotal - trimestresRequis; // positif = surplus
  // trimestres après ageLegal (approx) : si la date de départ est > ageLegal on compte trimestres d'ecart d'age
  const trimestresApresAgeLegal = Math.max(0, Math.floor((ageDepartFraction - ageLegal) * 4));
  const surcoteTrimestres = Math.min(Math.max(0, ecart), trimestresApresAgeLegal);

  // calcul décote : trimestres manquants
  let taux = TAUX_PLEIN;
  if (ecart < 0) {
    const trimestresManquants = Math.abs(ecart);
    const decote = trimestresManquants * DECOTE_PAR_TRIMESTRE;
    taux = Math.max(TAUX_PLEIN - decote, TAUX_PLEIN - (12 * DECOTE_PAR_TRIMESTRE)); // plancher = après 12T (réforme diffère) -> adapte si nécessaire
  }
  // applique surcote
  if (surcoteTrimestres > 0) taux += surcoteTrimestres * SURCOTE_PAR_TRIMESTRE;

  // 7) ratio proratisation durée
  const ratio = Math.min(trimestresTotal / trimestresRequis, 1);

  // 8) pension
  const samPlafonne = sam; // SAM ici déjà plafonné année par année avant revalorisation
  const pensionBase = samPlafonne * Math.min(taux, TAUX_PLEIN) * ratio;
  // plafonner à 50% du PASS de l'année de départ (utilise PASS de date de départ)
  const anneeDepart = toDate(dateRetraiteSouhaitee).getFullYear();
  const passDepart = PASS_PAR_ANNEE[anneeDepart] ?? PASS_PAR_ANNEE[2024] ?? 47100;
  const pensionPlafonnee = Math.min(pensionBase, passDepart * TAUX_PLEIN);
  const montantSurcote = samPlafonne * Math.max(0, taux - TAUX_PLEIN) * ratio;
  let pensionAnnuelleBrute = pensionPlafonnee + montantSurcote;

  // majoration 10% pour 3 enfants ou plus
  if ((enfants.length || 0) >= 3) pensionAnnuelleBrute *= 1.10;

  // majoration handicap (approche simple)
  if (person.handicape) {
    if (trimestresAcquis >= trimestresRequis) {
      pensionAnnuelleBrute *= (1 + (trimestresAcquis / trimestresRequis) / 3);
    }
  }

  const pensionMensuelleBrute = pensionAnnuelleBrute / 12;
  const pensionMensuelleNette = pensionMensuelleBrute * (1 - RETENUES_SOCIALES);

  return {
    sam: Math.round(sam*100)/100,
    trimestresParAnnee,
    trimestresAcquis,
    trimestresMajoration,
    trimestresTotal,
    trimestresRequis,
    tauxEffectif: Math.round(taux*100000)/1000,
    pensionAnnuelleBrute: Math.round(pensionAnnuelleBrute*100)/100,
    pensionMensuelleBrute: Math.round(pensionMensuelleBrute*100)/100,
    pensionMensuelleNette: Math.round(pensionMensuelleNette*100)/100,
    details: { perYear }
  } as RetraiteResult;
}