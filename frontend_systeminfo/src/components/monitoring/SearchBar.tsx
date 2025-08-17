"use client"

import { useState } from "react"

export default function SearchBar() {
    const [search, setSearch] = useState("")

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        // Implementar la lógica de búsqueda aquí
        console.log("Buscando:", search)
    }

    return (
        <form onSubmit={handleSearch} className="mb-6">
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar recursos..."
                className="w-full p-2 border border-gray-300 rounded"
            />
            <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
                Buscar
            </button>
        </form>
    )
}

