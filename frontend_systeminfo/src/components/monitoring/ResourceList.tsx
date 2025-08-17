import { use } from "react"

// Simula una función para obtener recursos
async function getResources() {
    // En un caso real, esto sería una llamada a una API o base de datos
    return [
        { id: 1, title: "Guía de Prevención", type: "PDF" },
        { id: 2, title: "Video Instructivo", type: "Video" },
        { id: 3, title: "Mapa de Riesgos", type: "Imagen" },
    ]
}

export default function ResourceList() {
    const resources = use(getResources())

    return (
        <ul className="space-y-4">
            {resources.map((resource) => (
                <li key={resource.id} className="border p-4 rounded">
                    <h2 className="text-xl font-semibold">{resource.title}</h2>
                    <p>Tipo: {resource.type}</p>
                </li>
            ))}
        </ul>
    )
}

