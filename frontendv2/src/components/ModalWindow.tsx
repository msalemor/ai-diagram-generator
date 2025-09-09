
import { useEffect, useState } from "react";

interface ModalProps {
    title: string;
    target: string;
    setTarget: (value: string) => void;
    state: boolean
}

const ModalWindow = ({ title, target, setTarget, state }: ModalProps) => {
    const [showModal, setShowModal] = useState(true)
    useEffect(() => { setShowModal(state) }, [state])

    return (
        <div className={`${showModal ? 'fixed' : 'hidden'} inset-0 z-50 flex items-center justify-center`}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black opacity-80" onClick={() => setShowModal(false)}></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-3/4 mx-4 flex flex-col h-3/4">
                <h2 className="text-xl font-bold mb-4">Editor - {title}</h2>
                <textarea className="w-full h-full border border-gray-300 rounded p-2"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                />
                <div className="flex justify-end space-x-2 mt-4">
                    <button
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                        onClick={() => setShowModal(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                        onClick={() => setShowModal(false)}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalWindow

