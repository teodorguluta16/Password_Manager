import React, { useState, useEffect } from 'react';
import PopupAskRecoveryPasswod from "../Popup_uri/PopupAskRecoveryPasswod.jsx"
import PopupRecoveryPassword from "../Popup_uri/PopupRecoveryPassword.jsx";

const MyAccountPage = ({ setMeniuContulMeu, accessToken, derivedkey }) => {
    useEffect(() => {
        setMeniuContulMeu(false);
    }, []);

    const [userData, setUserData] = useState({
        firstName: 'Ion',
        lastName: 'Popescu',
        email: 'ion.popescu@example.com',
        password: '********',
        created_at: "11 Jan 2024 12:34",
        modified_at: "11 Jan 2024 12:34",
        status: "active"
    });

    const [isEditing, setIsEditing] = useState(false);
    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value,
        });
    };

    const [popupActiveazaRcovery, setpopupActiveazaRcovery] = useState(false);
    const [openPopupRecovery, setOpenPopupRecovery] = useState(false);

    const handleActivateKeyRecovery = () => {
        setpopupActiveazaRcovery(true);
    };
    const initials = `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`;
    return (
        <div className="mx-auto p-4 overflow-y-auto custom-height3">
            <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-red-600">
                    {initials}
                </div>
                <div>
                    <h2 className="text-2xl font-semibold">{userData.firstName} {userData.lastName}</h2>
                    <p className="text-gray-600">{userData.email}</p>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-xl font-semibold">Datele profilului</h3>
                <div className="mt-4 sm:space-x-4 space-y-4 sm:space-y-0  grid grid-cols-1 sm:grid-cols-2">
                    <div className="border border-white-700 rounded-lg w-68 h-64 shadow-lg shadow-gray-300 bg-white">
                        {/* Nume */}
                        <div className="flex items-center mt-4 ml-2">
                            <label className="w-32 font-medium">Nume:</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="firstName"
                                    value={userData.firstName}
                                    onChange={handleChange}
                                    className="border p-1 ounded"
                                />
                            ) : (
                                <span>{userData.firstName}</span>
                            )}
                        </div>

                        {/* Prenume */}
                        <div className="flex items-center mt-6 ml-2">
                            <label className="w-32 font-medium">Prenume:</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="lastName"
                                    value={userData.lastName}
                                    onChange={handleChange}
                                    className="border p-1 rounded"
                                />
                            ) : (
                                <span>{userData.lastName}</span>
                            )}
                        </div>

                        {/* Email */}
                        <div className="flex items-center mt-6 ml-2">
                            <label className="w-32 font-medium">Email:</label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={userData.email}
                                    onChange={handleChange}
                                    className="border p-1 rounded w-64"
                                />
                            ) : (
                                <span>{userData.email}</span>
                            )}
                        </div>

                        {/* Parola */}
                        <div className="flex items-center mt-6 ml-2">
                            <label className="w-32 font-medium">Parola:</label>
                            {isEditing ? (
                                <input
                                    type="password"
                                    name="password"
                                    value={userData.password}
                                    onChange={handleChange}
                                    className="border p-1 rounded"
                                />
                            ) : (
                                <span>{userData.password}</span>
                            )}
                        </div>
                    </div>
                    <div className="block">
                        <div className=" border border-white-700 rounded-lg w-full lg:w-3/4  h-36 md:h-32 shadow-lg shadow-gray-300 bg-white mr-4">
                            {/* Created At */}
                            <div className="flex items-left md:items-center ml-2 mt-2 ">
                                <label className="w-32 font-medium">Creat la:</label>
                                <span>{userData.created_at}</span>
                            </div>

                            {/* Modified At */}
                            <div className="flex items-center ml-2 mt-2">
                                <label className="w-32 font-medium">Modificat:</label>
                                <span>{userData.modified_at}</span>
                            </div>

                            {/* Status */}
                            <div className="flex items-center ml-2 mt-2">
                                <label className="w-32 font-medium">Status:</label>
                                <span>{userData.status}</span>
                            </div>

                        </div>

                        <div className="border border-white-700 rounded-lg w-full lg:w-3/4 h-28 shadow-lg shadow-gray-300 bg-white mt-4">
                            {/* Created At */}
                            <div className="flex items-center ml-2 mt-2">
                                <label className="w-32 font-medium">Numar itemi:</label>
                                <span>32</span>
                            </div>

                            {/* Modified At */}
                            <div className="flex items-center ml-2 mt-2">
                                <label className="w-32 font-medium">Grupuri:</label>
                                <span>32</span>
                            </div>

                            {/* Status */}
                            <div className="flex items-center ml-2 mt-2">
                                <label className="w-32 font-medium">Itemi partajati:</label>
                                <span>5</span>
                            </div>

                        </div>

                    </div>
                </div>

                <div className="mt-6 flex space-x-4">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                    >
                        {isEditing ? 'Salvează' : 'Editează'}
                    </button>

                    {/* Buton activare recuperare cheie */}
                    <button
                        onClick={handleActivateKeyRecovery}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
                    >
                        Activează recuperare cheie
                    </button>
                </div>
            </div>
            {popupActiveazaRcovery && <PopupAskRecoveryPasswod setpopupActiveazaRcovery={setpopupActiveazaRcovery} accessToken={accessToken} setOpenPopupRecovery={setOpenPopupRecovery} />}
            {openPopupRecovery && <PopupRecoveryPassword accessToken={accessToken} setOpenPopupRecovery={setOpenPopupRecovery} derivedkey={derivedkey} />}
        </div>
    );
};

export default MyAccountPage;
