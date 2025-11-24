import { Calendar, Calculator, ArrowRight } from "lucide-react";

interface Props {
    valeurs: any;
    onChange: (nom: string, valeur: any) => void;
    onConfirm?: (date: string) => void;
}

export default function FormulaireRetraite({ valeurs, onChange, onConfirm }: Props) {
    
    const isDateSelected = !!valeurs.retirementAge;

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl mx-auto border border-gray-100 relative overflow-hidden">
            
            {/* Décoration d'arrière plan légère */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-50 rounded-full blur-2xl opacity-50"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Quand souhaitez-vous partir ?</h2>
                        <p className="text-sm text-gray-500">Cette date servira de pivot pour calculer vos droits exacts.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block group">
                        <span className="text-sm font-medium text-gray-700 mb-1 block pl-1">Date de départ envisagée</span>
                        <div className="relative">
                            <input
                                type="date"
                                value={valeurs.retirementAge}
                                onChange={(e) => onChange("retirementAge", e.target.value)}
                                className="w-full p-4 pl-4 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all cursor-pointer hover:border-gray-300"
                            />
                            {/* Indicateur visuel sur l'input */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <Calendar size={20} />
                            </div>
                        </div>
                    </label>

                    <div className="pt-2">
                        <button
                            type="button"
                            disabled={!isDateSelected}
                            onClick={() => onConfirm && onConfirm(valeurs.retirementAge)}
                            className={`
                                w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg
                                ${isDateSelected 
                                    ? "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-purple-200 hover:-translate-y-1" 
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                }
                            `}
                        >
                            {isDateSelected ? (
                                <>
                                    <Calculator size={22} />
                                    Lancer la simulation
                                    <ArrowRight size={20} className="opacity-70" />
                                </>
                            ) : (
                                "Sélectionnez une date..."
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}