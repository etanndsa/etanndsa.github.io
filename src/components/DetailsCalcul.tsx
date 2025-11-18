import { type ResultatRetraite, PASS_ANNUEL } from "../utils/calculRetraite";

interface Props {
    resultat: ResultatRetraite;
    visible: boolean;
    onToggle: () => void;
}

export default function DetailsCalcul({ resultat, visible, onToggle }: Props) {
    return (
        <div className="mt-4 max-w-2xl mx-auto text-center">
            <button
                onClick={onToggle}
                className="bg-purple-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
                {visible ? "Masquer le calcul" : "Afficher le calcul détaillé"}
            </button>

            {visible && (
                <div className="mt-5 bg-gray-50 border border-gray-200 p-6 rounded-2xl text-sm text-gray-700 space-y-4 shadow-inner text-left transition-all duration-300">
                    <h3 className="font-semibold text-gray-800 text-lg mb-2 text-center">
                        🧾 Informations générales
                    </h3>
                    <div className="space-y-1">
                        <p><strong>Âge légal :</strong> {resultat.ageLegal} ans</p>
                        <p><strong>Trimestres requis :</strong> {resultat.trimestresRequis}</p>
                        <p><strong>Trimestres acquis :</strong> {resultat.trimestresRequis + resultat.ecartTrimestres}</p>
                        <p><strong>Surcote prise en compte :</strong> {resultat.surcoteTrimestres}</p>
                    </div>

                    <hr className="border-gray-300" />

                    <h3 className="font-semibold text-gray-800 text-lg text-center">⚙️ Détails du calcul</h3>
                    <div className="space-y-1">
                        <p><strong>SAM plafonné :</strong> {resultat.samPlafonne.toLocaleString()} €</p>
                        <p><strong>Taux effectif :</strong> {(resultat.tauxEffectif * 100).toFixed(2)} %</p>
                        <p><strong>Ratio trimestres :</strong> {(resultat.ratio * 100).toFixed(2)} %</p>
                        <p><strong>Plafond 50 % PASS annuel :</strong> {(PASS_ANNUEL * 0.5).toLocaleString()} €</p>
                    </div>

                    <hr className="border-gray-300" />

                    <h3 className="font-semibold text-gray-800 text-lg text-center">💶 Pensions</h3>
                    <div className="space-y-1">
                        <p><strong>Pension annuelle brute :</strong> {resultat.pensionAnnuelleBrute.toLocaleString()} €</p>
                        <p><strong>Pension mensuelle brute :</strong> {resultat.pensionMensuelleBrute.toFixed(2)} €</p>
                        <p><strong>Pension mensuelle nette :</strong> {resultat.pensionMensuelleNette.toFixed(2)} €</p>
                    </div>
                </div>
            )}
        </div>
    );
}