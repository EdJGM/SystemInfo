"use client";
import { useEffect, useState } from "react";
import { auth } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import styles from "../../styles/dashboard.module.css";
import CPUMonitor from "@/components/monitoring/CPUMonitor";
import MemoryMonitor from "@/components/monitoring/MemoryMonitor";
import NetworkMonitor from "@/components/monitoring/NetworkMonitor";
import ProcessMonitor from "@/components/monitoring/ProcessMonitor";
import DiskMonitor from "@/components/monitoring/DiskMonitor";
import { WebSocketProvider } from "@/utils/WebSocketContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MonitoringConfig from "@/components/config/MonitoringConfig";
import Navbar from "@/components/ui/Navbar_in";
import DashboardContainer from "@/components/detailed/DashboardContainer";

// Importar los componentes detallados
import DetailedCPUMonitor from "@/components/detailed/DetailedCPUMonitor";
import DetailedMemoryMonitor from "@/components/detailed/DetailedMemoryMonitor";
import DetailedProcessMonitor from "@/components/detailed/DetailedProcessMonitor";
import NetworkDetailMonitor from "@/components/detailed/NetworkDetailMonitor";
import ReportPage from "@/components/detailed/ReportPage";

const Dashboard = () => {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [thresholds, setThresholds] = useState({
        cpu: 80,
        memory: 80,
        disk: 90,
        network: 80,
    });
    const [updateInterval, setUpdateInterval] = useState(5000);
    const [monitoringEnabled, setMonitoringEnabled] = useState(false);

    // Estado para controlar qué pestaña está activa
    const [activeTab, setActiveTab] = useState<string>("dashboard");

    useEffect(() => {
        // Verificar si el usuario está autenticado
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                router.push("/"); // Redirige si no hay sesión activa
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleConfigSave = (newThresholds, newUpdateInterval, newMonitoringEnabled) => {
        setThresholds(newThresholds);
        setUpdateInterval(newUpdateInterval);
        setMonitoringEnabled(newMonitoringEnabled);
        toast.success("Configuración guardada exitosamente");
    };

    const handleAlert = (resourceName, value) => {
        toast.warn(`¡Alerta! El uso de ${resourceName} ha superado el umbral: ${value}%`);
    };

    // Función para cambiar de pestaña
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <WebSocketProvider>
            <DashboardContainer>
                <div className={styles.dashboardHeaderContainer}>
                    <img src="/icon.png" alt="Icon" className={styles.dashboardHeaderImage} />
                    <h1 className={styles.dashboardHeader}>Bienvenido al Dashboard</h1>
                </div>

                {/* Pasar la función de cambio de pestaña al Navbar */}
                <Navbar user={user} onTabChange={handleTabChange} />
                <br />

                {/* Contenido basado en la pestaña activa */}
                {activeTab === "dashboard" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <MonitoringConfig
                                onSave={handleConfigSave}
                                initialConfig={thresholds}
                                initialInterval={updateInterval}
                                initialEnabled={monitoringEnabled}
                            />
                        </div>
                        <div id="cpu">
                            <CPUMonitor threshold={thresholds.cpu} onAlert={handleAlert} />
                        </div>
                        <div id="memory">
                            <MemoryMonitor threshold={thresholds.memory} onAlert={handleAlert} />
                        </div>
                        <div id="network">
                            <NetworkMonitor threshold={thresholds.network} onAlert={handleAlert} />
                        </div>
                        <div id="disk">
                            <DiskMonitor threshold={thresholds.disk} onAlert={handleAlert} />
                        </div>
                        <div id="process" className="col-span-1 md:col-span-2">
                            <ProcessMonitor threshold={thresholds.cpu} onAlert={handleAlert} />
                        </div>
                    </div>
                )}

                {/* Vistas detalladas */}
                {activeTab === "cpu-detail" && (
                    <div className="container mx-auto px-4 py-8 text-black">
                        <DetailedCPUMonitor />
                    </div>
                )}
                {activeTab === "memory-detail" && (
                    <div className="container mx-auto px-4 py-8 text-black">
                        <DetailedMemoryMonitor />
                    </div>
                )}
                {activeTab === "network-detail" && (
                    <div className="container mx-auto px-4 py-8 text-black">
                        <NetworkDetailMonitor />
                    </div>
                )}
                {activeTab === "process-detail" && (
                    <div className="container mx-auto px-4 py-8 text-black">
                        <DetailedProcessMonitor />
                    </div>
                )}
                 {activeTab === "report" && (
                    <div className="container mx-auto px-4 py-8 text-black">
                        <ReportPage />
                    </div>
                )}
            </DashboardContainer>
            <ToastContainer position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover />
        </WebSocketProvider>
    );
};

export default Dashboard;