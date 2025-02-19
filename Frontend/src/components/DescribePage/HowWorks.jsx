import React from 'react';
import { FaCode, FaShieldAlt, FaLock, FaDatabase } from 'react-icons/fa';


const HowWorks = () => {
    return (
        <>
            <div className="min-h-[700px] sm:min-h-[670px] bg-gradient-to-b from-white to-green-100 max-w-screen-full mx-auto">
                <div className="py-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-center mb-7 mt-1">
                        Cum funcționează ?
                    </h2>

                    {/* 4 Column Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 md:px-12 ">
                        {/* Column 1 */}
                        <div className="text-center p-6 bg-stone-100 rounded-lg shadow-lg">
                            <FaCode className="text-green-600 text-5xl mb-4 mx-auto" />
                            <h3 className="text-xl font-bold mb-2">Dezvoltare</h3>
                            <p className="text-gray-600">Construim aplicații moderne și eficiente folosind cele mai noi tehnologii și respectând cu atenție standardele internaționale</p>
                        </div>

                        {/* Column 2 */}
                        <div className="text-center p-6 bg-stone-100 rounded-lg shadow-lg">
                            <FaShieldAlt className="text-green-600 text-5xl mb-4 mx-auto" />
                            <h3 className="text-xl font-bold mb-2">Protecție continuă</h3>
                            <p className="text-gray-600">Parolele și datele sensibile sunt complet criptate cu AES-256 local, pe dispozitivul utilizatorului, și abia apoi trimise mai departe. Astfel ne asigurăm că numai dumneavoastră aveți acces la datele personale. </p>
                        </div>

                        {/* Column 3 */}
                        <div className="text-center p-6 bg-stone-100 rounded-lg shadow-lg">
                            <FaLock className="text-green-600 text-5xl mb-4 mx-auto" />
                            <h3 className="text-xl font-bold mb-2">Autentificare</h3>
                            <p className="text-gray-600">O singură parolă și anume cea de autentificare folosită pentru a cripta datele într-un mod simplu și eficient. Folosind metodele noastre de identificare, te vom ajuta să-ți construiești propria parolă puternică care-ți ofere protecția necesară.</p>
                        </div>

                        {/* Column 4 */}
                        <div className="text-center p-6 bg-stone-100 rounded-lg shadow-lg">
                            <FaDatabase className="text-green-600 text-5xl mb-4 mx-auto" />
                            <h3 className="text-xl font-bold mb-2">Siguranță la stocare</h3>
                            <p className="text-gray-600">Stocarea datelor tale se va face numai în mod criptat într-un mediu de stocare sigur, disponibil oriunde și oricând.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HowWorks;