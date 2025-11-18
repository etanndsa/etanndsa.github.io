interface Props {
    valeurs: any;
    onChange: (nom: string, valeur: any) => void;
    onConfirm?: (date: string) => void;
}

export default function FormulaireRetraite({ valeurs, onChange, onConfirm }: Props) {
    return (
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm max-w-2xl mx-auto">

            <h2 className="text-lg font-semibold text-gray-800 mb-4">Date de départ souhaité</h2>

            <label className="flex flex-col text-sm text-gray-700 w-full">
                Sélectionnez votre date de départ
                <input
                    type="date"
                    value={valeurs.retirementAge}
                    onChange={(e) => onChange("retirementAge", e.target.value)}
                    className="mt-1 border border-gray-300 rounded p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
            </label>
            <div className="mt-4 flex justify-end">
                <button
                    type="button"
                    onClick={() => onConfirm && onConfirm(valeurs.retirementAge)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                    Confirmer la date
                </button>
            </div>
        </div>
    );
}