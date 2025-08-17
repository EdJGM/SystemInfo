"use client"

import { useState, useEffect, useRef } from "react"
import { useWebSocket } from "@/utils/WebSocketContext"
import { ChevronDown, ChevronUp, ArrowUpDown, Info, Download, RefreshCw } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from "recharts"

interface NetworkConnection {
    type: string
    local_address: string
    local_port: number
    remote_address: string
    remote_port: number
    status: string
    pid: number
    process: string
}

interface NetworkData {
    timestamp: number
    sent: number
    received: number
    connections: number
}

type SortConfig = {
    key: keyof NetworkConnection
    direction: "ascending" | "descending"
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export default function NetworkDetailMonitor() {
    const [connections, setConnections] = useState<NetworkConnection[]>([])
    const [filteredConnections, setFilteredConnections] = useState<NetworkConnection[]>([])
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "local_port", direction: "ascending" })
    const [filters, setFilters] = useState({
        tcp: true,
        udp: true,
        icmp: true,
        other: true,
        localPort: "",
        remotePort: "",
        processName: "",
        status: "",
    })
    const [isAdmin, setIsAdmin] = useState(true)
    const [loading, setLoading] = useState(true)
    const [networkData, setNetworkData] = useState<NetworkData[]>([])
    const [activeTab, setActiveTab] = useState<"overview" | "connections" | "filters" | "history">("overview")
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [protocolDistribution, setProtocolDistribution] = useState<{ name: string; value: number }[]>([])
    const data = useWebSocket()

    // Referencia para almacenar los valores anteriores de bytes enviados/recibidos
    const previousDataRef = useRef<{ sentBytes: number, receivedBytes: number } | null>(null);

    useEffect(() => {
        if (data && autoRefresh) {
            setLoading(false)

            // Extraer datos reales del WebSocket
            const currentSentBytes = data.red_enviados ? Number.parseFloat(data.red_enviados.replace(" KB", "")) : 0
            const currentReceivedBytes = data.red_recibidos ? Number.parseFloat(data.red_recibidos.replace(" KB", "")) : 0
            const connectionCount = data.conexiones_red || 0

            // Calcular tasas por segundo (en lugar de valores acumulativos)
            let sentRate = 0;
            let receivedRate = 0;

            if (previousDataRef.current) {
                // Calcular la diferencia desde la última actualización para obtener la tasa
                sentRate = Math.max(0, currentSentBytes - previousDataRef.current.sentBytes);
                receivedRate = Math.max(0, currentReceivedBytes - previousDataRef.current.receivedBytes);
            }

            // Actualizar la referencia para la próxima comparación
            previousDataRef.current = {
                sentBytes: currentSentBytes,
                receivedBytes: currentReceivedBytes
            };

            // Solo agregar datos si tenemos tasas válidas (segunda muestra en adelante)
            if (previousDataRef.current && (sentRate > 0 || receivedRate > 0 || networkData.length > 0)) {
                // Actualizar datos históricos de red
                const newNetworkData: NetworkData = {
                    timestamp: Date.now(),
                    sent: sentRate,
                    received: receivedRate,
                    connections: connectionCount,
                };

                setNetworkData((prev) => {
                    const updated = [...prev, newNetworkData].slice(-60) // Mantener solo los últimos 60 puntos de datos
                    return updated
                });
            }

            // Verificar si tenemos datos detallados de conexiones reales
            if (data.detalles_conexiones && Array.isArray(data.detalles_conexiones)) {
                // Comprobar si hay errores de permisos
                const hasPermissionError = data.detalles_conexiones.some(
                    (conn) => conn.type === "ERROR" && conn.status.includes("Error de permisos"),
                )

                if (hasPermissionError) {
                    setIsAdmin(false)
                } else {
                    setIsAdmin(true)
                }

                setConnections(data.detalles_conexiones)

                // Calcular distribución de protocolos
                const protocols: Record<string, number> = {}
                data.detalles_conexiones.forEach((conn) => {
                    if (conn.type !== "ERROR") {
                        protocols[conn.type] = (protocols[conn.type] || 0) + 1
                    }
                })

                setProtocolDistribution(Object.entries(protocols).map(([name, value]) => ({ name, value })))
            }
            // Si no hay datos detallados pero hay un conteo, generamos datos aleatorios (fallback)
            else if (connectionCount && !data.detalles_conexiones) {
                const mockConnections = generateMockConnections(connectionCount)
                setConnections(mockConnections)

                // Calcular distribución de protocolos simulada
                const protocols: Record<string, number> = {}
                mockConnections.forEach((conn) => {
                    protocols[conn.type] = (protocols[conn.type] || 0) + 1
                })

                setProtocolDistribution(Object.entries(protocols).map(([name, value]) => ({ name, value })))
            }
        }
    }, [data, autoRefresh])

    useEffect(() => {
        // Apply filters
        const result = connections.filter((conn) => {
            // Protocol filter
            if (
                (conn.type === "TCP" && !filters.tcp) ||
                (conn.type === "UDP" && !filters.udp) ||
                (conn.type === "ICMP" && !filters.icmp) ||
                (!["TCP", "UDP", "ICMP"].includes(conn.type) && !filters.other)
            ) {
                return false
            }

            // Port filters
            if (filters.localPort && !conn.local_port.toString().includes(filters.localPort)) {
                return false
            }
            if (filters.remotePort && !conn.remote_port.toString().includes(filters.remotePort)) {
                return false
            }

            // Process name filter
            if (filters.processName && !conn.process.toLowerCase().includes(filters.processName.toLowerCase())) {
                return false
            }

            // Status filter
            if (filters.status && !conn.status.toLowerCase().includes(filters.status.toLowerCase())) {
                return false
            }

            return true
        })

        // Apply sorting
        result.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === "ascending" ? -1 : 1
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === "ascending" ? 1 : -1
            }
            return 0
        })

        setFilteredConnections(result)
    }, [connections, filters, sortConfig])

    const handleFilterChange = (name: string, value: any) => {
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const requestSort = (key: keyof NetworkConnection) => {
        let direction: "ascending" | "descending" = "ascending"
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending"
        }
        setSortConfig({ key, direction })
    }

    const getSortIcon = (columnName: keyof NetworkConnection) => {
        if (sortConfig.key === columnName) {
            return sortConfig.direction === "ascending" ? (
                <ChevronUp className="h-4 w-4" />
            ) : (
                <ChevronDown className="h-4 w-4" />
            )
        }
        return <ArrowUpDown className="h-4 w-4 opacity-50" />
    }

    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh)
    }

    const downloadNetworkData = () => {
        const dataStr = JSON.stringify(
            {
                networkData,
                connections: filteredConnections,
            },
            null,
            2,
        )
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

        const exportFileDefaultName = `network_data_${new Date().toISOString()}.json`

        const linkElement = document.createElement("a")
        linkElement.setAttribute("href", dataUri)
        linkElement.setAttribute("download", exportFileDefaultName)
        linkElement.click()
    }

    const getHistoryData = () => {
        return networkData.map((data) => ({
            time: new Date(data.timestamp).toLocaleTimeString(),
            sent: data.sent,
            received: data.received,
            connections: data.connections,
        }))
    }

    const handleTabChange = (value: string) => {
        setActiveTab(value as "overview" | "connections" | "filters" | "history")
    }

    if (loading) {
        return (
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Monitor de Red Detallado</h2>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Monitor de Red Detallado</h2>
                <div className="flex gap-2 items-center">
                    {!isAdmin && (
                        <div className="relative group">
                            <div className="flex items-center text-amber-600 cursor-help">
                                <Info className="h-5 w-5 mr-1" />
                                <span>Permisos insuficientes</span>
                            </div>
                            <div className="absolute z-10 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity right-0 top-full mt-2 p-2 bg-gray-800 text-white text-sm rounded shadow-lg max-w-xs">
                                Para ver conexiones de red detalladas, ejecuta la aplicación con permisos de administrador.
                            </div>
                        </div>
                    )}
                    <Button onClick={toggleAutoRefresh} variant={autoRefresh ? "outline" : "default"} size="sm">
                        <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
                        {autoRefresh ? "Pausar" : "Actualizar"}
                    </Button>
                    <Button onClick={downloadNetworkData} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" onValueChange={handleTabChange}>
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Resumen</TabsTrigger>
                    <TabsTrigger value="connections">Conexiones</TabsTrigger>
                    <TabsTrigger value="filters">Filtros</TabsTrigger>
                    <TabsTrigger value="history">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Tráfico de Red Actual</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="font-medium">Datos Enviados:</span>
                                    <span className="text-blue-600 font-bold">
                                        {networkData.length > 0 ? `${networkData[networkData.length - 1].sent.toFixed(2)} KB/s` : "0 KB/s"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Datos Recibidos:</span>
                                    <span className="text-green-600 font-bold">
                                        {networkData.length > 0
                                            ? `${networkData[networkData.length - 1].received.toFixed(2)} KB/s`
                                            : "0 KB/s"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Conexiones Activas:</span>
                                    <span className="text-purple-600 font-bold">
                                        {networkData.length > 0 ? networkData[networkData.length - 1].connections : 0}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Tráfico Total:</span>
                                    <span className="text-gray-800 font-bold">
                                        {networkData.length > 0
                                            ? `${(networkData[networkData.length - 1].sent + networkData[networkData.length - 1].received).toFixed(2)} KB/s`
                                            : "0 KB/s"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Distribución de Protocolos</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={protocolDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {protocolDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Tráfico de Red en Tiempo Real</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={networkData.map(d => ({ ...d, time: new Date(d.timestamp).toLocaleTimeString() }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="sent"
                                    stackId="1"
                                    stroke="#8884d8"
                                    fill="#8884d8"
                                    name="Enviado (KB/s)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="received"
                                    stackId="1"
                                    stroke="#82ca9d"
                                    fill="#82ca9d"
                                    name="Recibido (KB/s)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </TabsContent>

                <TabsContent value="connections" className="mt-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 table-fixed">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/6" onClick={() => requestSort("type")}>
                                        <div className="flex items-center space-x-1">
                                            <span>Tipo</span>
                                            {getSortIcon("type")}
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/6" onClick={() => requestSort("local_address")}>
                                        <div className="flex items-center space-x-1">
                                            <span>Dir. Local</span>
                                            {getSortIcon("local_address")}
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/6" onClick={() => requestSort("local_port")}>
                                        <div className="flex items-center space-x-1">
                                            <span>Puerto Local</span>
                                            {getSortIcon("local_port")}
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/6" onClick={() => requestSort("remote_address")}>
                                        <div className="flex items-center space-x-1">
                                            <span>Dir. Remota</span>
                                            {getSortIcon("remote_address")}
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/6" onClick={() => requestSort("remote_port")}>
                                        <div className="flex items-center space-x-1">
                                            <span>Puerto Remoto</span>
                                            {getSortIcon("remote_port")}
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/6" onClick={() => requestSort("status")}>
                                        <div className="flex items-center space-x-1">
                                            <span>Estado</span>
                                            {getSortIcon("status")}
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/6" onClick={() => requestSort("process")}>
                                        <div className="flex items-center space-x-1">
                                            <span>Proceso</span>
                                            {getSortIcon("process")}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredConnections.map((conn, index) => (
                                    <tr key={index} className={conn.type === "ERROR" ? "bg-red-50" : ""}>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">{conn.type}</td>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">{conn.local_address}</td>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">{conn.local_port}</td>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">{conn.remote_address}</td>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">{conn.remote_port}</td>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">{conn.status}</td>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">{conn.process}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        Mostrando {filteredConnections.length} de {connections.length} conexiones
                    </div>
                </TabsContent>

                <TabsContent value="filters" className="mt-0">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Filtros de Conexión</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="tcp"
                                    checked={filters.tcp}
                                    onCheckedChange={(checked) => handleFilterChange("tcp", !!checked)}
                                />
                                <Label htmlFor="tcp">TCP</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="udp"
                                    checked={filters.udp}
                                    onCheckedChange={(checked) => handleFilterChange("udp", !!checked)}
                                />
                                <Label htmlFor="udp">UDP</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="icmp"
                                    checked={filters.icmp}
                                    onCheckedChange={(checked) => handleFilterChange("icmp", !!checked)}
                                />
                                <Label htmlFor="icmp">ICMP</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="other"
                                    checked={filters.other}
                                    onCheckedChange={(checked) => handleFilterChange("other", !!checked)}
                                />
                                <Label htmlFor="other">Otros</Label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <Label htmlFor="localPort">Puerto Local</Label>
                                <Input
                                    id="localPort"
                                    value={filters.localPort}
                                    onChange={(e) => handleFilterChange("localPort", e.target.value)}
                                    placeholder="Ej. 80, 443"
                                />
                            </div>
                            <div>
                                <Label htmlFor="remotePort">Puerto Remoto</Label>
                                <Input
                                    id="remotePort"
                                    value={filters.remotePort}
                                    onChange={(e) => handleFilterChange("remotePort", e.target.value)}
                                    placeholder="Ej. 80, 443"
                                />
                            </div>
                            <div>
                                <Label htmlFor="processName">Nombre de Proceso</Label>
                                <Input
                                    id="processName"
                                    value={filters.processName}
                                    onChange={(e) => handleFilterChange("processName", e.target.value)}
                                    placeholder="Ej. chrome, firefox"
                                />
                            </div>
                            <div>
                                <Label htmlFor="status">Estado</Label>
                                <Input
                                    id="status"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange("status", e.target.value)}
                                    placeholder="Ej. ESTABLISHED, LISTEN"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={() =>
                                setFilters({
                                    tcp: true,
                                    udp: true,
                                    icmp: true,
                                    other: true,
                                    localPort: "",
                                    remotePort: "",
                                    processName: "",
                                    status: "",
                                })
                            }
                        >
                            Limpiar Filtros
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Historial de Tráfico de Red</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={getHistoryData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="sent"
                                    stroke="#8884d8"
                                    name="Enviado (KB/s)"
                                    dot={false}
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="received"
                                    stroke="#82ca9d"
                                    name="Recibido (KB/s)"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Historial de Conexiones</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={getHistoryData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="connections" stroke="#ff7300" name="Conexiones Activas" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Para obtener datos de red más detallados, se recomienda ejecutar la aplicación con
                    permisos de administrador. Algunos datos mostrados pueden ser parcialmente simulados para fines de
                    demostración si no se dispone de permisos suficientes.
                </p>
            </div>
        </div>
    )
}

// Función para generar datos de conexiones aleatorias para la demostración (fallback)
function generateMockConnections(count: number): NetworkConnection[] {
    const protocols = ["TCP", "UDP", "ICMP", "SCTP"]
    const statuses = ["ESTABLISHED", "LISTEN", "TIME_WAIT", "CLOSE_WAIT", "SYN_SENT"]
    const processes = ["chrome", "firefox", "nginx", "apache", "node", "python", "spotify", "telegram", "discord", "zoom"]

    const connections: NetworkConnection[] = []

    for (let i = 0; i < count; i++) {
        const type = protocols[Math.floor(Math.random() * protocols.length)]
        const local_ip = `192.168.1.${Math.floor(Math.random() * 255)}`
        const remote_ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        const local_port = Math.floor(Math.random() * 65535)
        const remote_port = Math.floor(Math.random() * 65535)
        const status = type === "TCP" ? statuses[Math.floor(Math.random() * statuses.length)] : ""
        const pid = Math.floor(Math.random() * 10000)
        const process = processes[Math.floor(Math.random() * processes.length)]

        connections.push({
            type,
            local_address: local_ip,
            local_port,
            remote_address: remote_ip,
            remote_port,
            status,
            pid,
            process,
        })
    }

    return connections
}