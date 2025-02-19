import React from "react";
import { useState } from 'react';

import "../../../App.css"

import LaunchLogo from "../../../assets/website/launch.png"
import FavoriteLogo from "../../../assets/website/favorite.png"
import DeleteIcon from "../../../assets/website/delete.png"

const ListAfisItems = ({ items, setGestioneazaItem, setStergeItem, setItemid }) => {
    return (
        <>
            <div className="grid gap-8 sm:gap-10 md:gap-12 ml-2 mr-2 px-8 sm:px-4 md:px-12 custom-height overflow-y-auto py-8 -mt-4">
                <table className="w-full myTable border shadow-xl bg-white bg-opacity-100 rounded-lg overflow-y-auto">
                    <thead className="">
                        <tr className="h-10">
                            <th className="text-lg font-semibold">Nume</th>
                            <th className="text-lg font-semibold">Username</th>
                            <th className="text-lg font-semibold">
                                <div className="space-x-4">
                                    <span>Optiuni</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="items-center justify-between">
                        {items.map((item, index) => (
                            <tr kye={index} onClick={() => { setGestioneazaItem(item) }} className="py-4 border-t-2 border-gray-300  mx-16 items-center justify-between hover:bg-gray-200 cursor-pointer">
                                <td className="px-4 py-2 text-sm text-gray-800 text-center align-middle">{item.nume}</td>
                                <td className="px-4 py-2 text-sm text-gray-800 text-center align-middle">{item.username}</td>
                                <td className="px-4 py-2 text-center align-middle">
                                    <div className="space-x-2 customsizebutton  hover:bg-gray-200">
                                        <button onClick={(e) => { e.stopPropagation(); }} className="right-2 border border-white bg-white rounded-lg px-2 py-1 hover:bg-blue-300 customsizebutton">
                                            <img src={LaunchLogo} alt="Launch Logo" className="w-5 h-5 customsize" />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); }} className="right-2 border border-white bg-white rounded-lg px-2 py-1 hover:bg-yellow-400 customsizebutton">
                                            <img src={FavoriteLogo} alt="Favorite Logo" className="w-5 h-5 customsize" />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setStergeItem(true); setItemid(item) }} className="right-2 border border-white bg-white rounded-lg px-2 py-1 hover:bg-red-400 customsizebutton">
                                            <img src={DeleteIcon} alt="Delete Logo" className="w-5 h-5 customsize" />
                                        </button>
                                    </div>

                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div >
        </>
    );
};

export default ListAfisItems;