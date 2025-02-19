import React, { useState } from 'react';

const QAFrecvente = () => {
  const [isopen1, setisopen1] = useState(false);
  const Accordion1 = () => { setisopen1(!isopen1); };

  const [isopen2, setisopen2] = useState(false);
  const Accordion2 = () => { setisopen2(!isopen2); };

  const [isopen3, setisopen3] = useState(false);
  const Accordion3 = () => { setisopen3(!isopen3); };

  const [isopen4, setisopen4] = useState(false);
  const Accordion4 = () => { setisopen4(!isopen4); };

  const [isopen5, setisopen5] = useState(false);
  const Accordion5 = () => { setisopen5(!isopen5); };

  const [isopen6, setisopen6] = useState(false);
  const Accordion6 = () => { setisopen6(!isopen6); };

  return (
    <>
      <div className="min-h-[700px] sm:min-h-[670px] bg-neutral-100">
        <div className="py-10">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-7 mt-1">Întrebări frecvente</h2>
        </div>

        <div className="accordion-wrapper w-5/6 md:w-5/6 mt-6 md:mt-4 mx-auto mt-0">
          <div className="accordion-wrapper-col">
            {/* 1 */}
            <div
              className={`accordion-card ${isopen1 ? 'accordion-card--open' : ''} hover:shadow-lg hover:bg-neutral-200 hover:py-6 hover:border hover:border-gray-300 hover:rounded-lg transition-all duration-300 py-2`}
              data-accordion="1"
              tabIndex="0"
            >
              <h3
                role="button" className="accordion-card-heading flex justify-between items-center gap-x-4" aria-controls="accordion-content-01"
                aria-expanded={isopen1 ? 'true' : 'false'} onClick={Accordion1}
              >
                <span className="text-xl sm:text-2xl md:text-2xl lg:text-2xl font-semibold">Care este prețul unui abonament?</span>
                <svg className={`accordion-arrow w-4 h-4 transition-transform duration-300 ${isopen1 ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </h3>
              <div className={`mt-4 transition-all duration-500 ease-in-out overflow-hidden ${isopen1 ? 'max-h-[200px]' : 'max-h-0'}`} id="accordion-content-01">
                <p className="text-1xl md:text-1xl">
                  Nu te costă nimic, aplicația este gratuită, fiind destinată oricărui tip de utilizator. Tot ce ai nevoie este o adresă de email validă și o parolă.
                </p>
              </div>
            </div>
            {/* 2 */}
            <div
              className={`accordion-card ${isopen2 ? 'accordion-card--open' : ''} hover:shadow-lg hover:bg-neutral-200 hover:py-6 hover:border hover:border-gray-300 hover:rounded-lg transition-all duration-300 py-2`}
              data-accordion="2"
              tabIndex="0"
            >
              <h3
                role="button" className="accordion-card-heading flex justify-between items-center gap-x-4" aria-controls="accordion-content-01"
                aria-expanded={isopen2 ? 'true' : 'false'} onClick={Accordion2}
              >
                <span className="text-xl sm:text-2xl md:text-2xl lg:text-2xl font-semibold ">Parolele mele sunt salvate în mod sigur?</span>
                <svg className={`accordion-arrow w-4 h-4 transition-transform duration-300 ${isopen1 ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </h3>
              <div className={`mt-4 transition-all duration-500 ease-in-out overflow-hidden ${isopen2 ? 'max-h-[200px]' : 'max-h-0'}`} id="accordion-content-02">
                <p className="text-1xl md:text-1xl">
                  Aplicația noatră funcționează aplicând principiul Zero-Trust Security. Acest lucru presupune că toate datele tale vor fi criptate local, pe dispozitivul tău, apoi abia vor fi trimise către serverele noastre.
                </p>
              </div>
            </div>
            {/* 3 */}
            <div
              className={`accordion-card ${isopen3 ? 'accordion-card--open' : ''} hover:shadow-lg hover:bg-neutral-200 hover:py-6 hover:border hover:border-gray-300 hover:rounded-lg transition-all duration-300 py-2`}
              data-accordion="3"
              tabIndex="0"
            >
              <h3
                role="button" className="accordion-card-heading flex justify-between items-center gap-x-4" aria-controls="accordion-content-01"
                aria-expanded={isopen3 ? 'true' : 'false'} onClick={Accordion3}
              >
                <span className="text-xl sm:text-2xl md:text-2xl lg:text-2xl font-semibold">Ce metodă de criptare se folosiți ?</span>
                <svg className={`accordion-arrow w-4 h-4 transition-transform duration-300 ${isopen1 ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </h3>
              <div className={`mt-4 transition-all duration-500 ease-in-out overflow-hidden ${isopen3 ? 'max-h-[200px]' : 'max-h-0'}`} id="accordion-content-03">
                <p className="text-1xl md:text-1xl">
                  Datele tale sunt criptate cu ajutorul algoritmului AES-256, un standard la nivel internațional.
                </p>
              </div>
            </div>
            {/* 4 */}
            <div
              className={`accordion-card ${isopen4 ? 'accordion-card--open' : ''} hover:shadow-lg hover:bg-neutral-200 hover:py-6 hover:border hover:border-gray-300 hover:rounded-lg transition-all duration-300 py-2`}
              data-accordion="4"
              tabIndex="0"
            >
              <h3
                role="button" className="accordion-card-heading flex justify-between items-center gap-x-4" aria-controls="accordion-content-01"
                aria-expanded={isopen4 ? 'true' : 'false'} onClick={Accordion4}
              >
                <span className="text-xl sm:text-2xl md:text-2xl lg:text-2xl font-semibold">Cine mai are acces la datele mele ?</span>
                <svg className={`accordion-arrow w-4 h-4 transition-transform duration-300 ${isopen1 ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </h3>
              <div className={`mt-4 transition-all duration-500 ease-in-out overflow-hidden ${isopen4 ? 'max-h-[200px]' : 'max-h-0'}`} id="accordion-content-04">
                <p className="text-1xl md:text-1xl">
                  Numai tu vei avea acces la toate conturile tale. Datele tale sunt criptate cu ajutorul unei chei secrete dervite din parola ta de logare. Așadar numai tu vei fii posesorul cheii, întrucât parolele principale ale utilizatorilor noștri nu sunt salvate niciodată în clar(sunt hash-uite).
                </p>
              </div>
            </div>
            {/* 5 */}
            <div
              className={`accordion-card ${isopen4 ? 'accordion-card--open' : ''} hover:shadow-lg hover:bg-neutral-200 hover:py-6 hover:border hover:border-gray-300 hover:rounded-lg transition-all duration-300 py-2`}
              data-accordion="5"
              tabIndex="0"
            >
              <h3
                role="button" className="accordion-card-heading flex justify-between items-center gap-x-4" aria-controls="accordion-content-01"
                aria-expanded={isopen5 ? 'true' : 'false'} onClick={Accordion5}
              >
                <span className="text-xl sm:text-2xl md:text-2xl lg:text-2xl font-semibold">Am uitat parola de logare, ce fac ?</span>
                <svg className={`accordion-arrow w-4 h-4 transition-transform duration-300 ${isopen1 ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </h3>
              <div className={`mt-4 transition-all duration-500 ease-in-out overflow-hidden ${isopen5 ? 'max-h-[200px]' : 'max-h-0'}`} id="accordion-content-05">
                <p className="text-1xl md:text-1xl">
                  Dacă ai pierdut parola principală, nu te ingrijora, îți poți recupera contul urmând pașii din secțiunea de restare a parolei.
                </p>
              </div>
            </div>
            {/* 6 */}
            <div
              className={`accordion-card ${isopen6 ? 'accordion-card--open' : ''} hover:shadow-lg hover:bg-neutral-200 hover:py-6 hover:border hover:border-gray-300 hover:rounded-lg transition-all duration-300 py-2`}
              data-accordion="6"
              tabIndex="0"
            >
              <h3
                role="button" className="accordion-card-heading flex justify-between items-center gap-x-4" aria-controls="accordion-content-01"
                aria-expanded={isopen6 ? 'true' : 'false'} onClick={Accordion6}
              >
                <span className="text-xl sm:text-2xl md:text-2xl lg:text-2xl font-semibold">Ai fost compromis ?</span>
                <svg className={`accordion-arrow w-4 h-4 transition-transform duration-300 ${isopen1 ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </h3>
              <div className={`mt-4 transition-all duration-500 ease-in-out overflow-hidden ${isopen6 ? 'max-h-[200px]' : 'max-h-0'}`} id="accordion-content-06">
                <p className="text-1xl md:text-1xl">
                  În cazul comprimiterii unui cont, doar contul respectiv fi compromis, restul vor rămâne în continuare protejate.Îți vom sugera sa resetezi parola cu una mult mai puternică și diferită complet de ce actuală.
                </p>
              </div>

            </div>
            <div className="py-6"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QAFrecvente;
