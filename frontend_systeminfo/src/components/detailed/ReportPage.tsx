'use client';
import { useState } from "react";
import axios from "axios";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";

interface Process {
  pid: number;
  processName: string;
  cpuPercent: string;
  memoryUsage: string;
  status: string;
}

interface SystemResource {
  cpuPercent: string;
  memoryAvailable: string;
  memoryUsed: string;
  diskUsage: string;
  netBytesSent: string;
  netBytesReceived: string;
}

interface ApiResponse {
  processes: Process[];
  system_resources: SystemResource[];
}

const ReportPage = () => {
  const [fecha, setFecha] = useState<string>("2025-03-09");
  const [reportData, setReportData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Estado para controlar la carga

  const fetchReportData = async () => {
    try {
      setLoading(true); // Activar el estado de carga
      const response = await axios.post("http://192.168.1.43:5000/api/get_data_by_date", {
        fecha,
      });
      setReportData(response.data);
      setLoading(false); // Desactivar el estado de carga una vez que los datos son recibidos
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false); // Desactivar el estado de carga en caso de error
    }
  };

  const styles = StyleSheet.create({
    page: {
      padding: 20,
    },
    section: {
      marginBottom: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
    },
    table: {
      marginBottom: 10,
    },
    tableRow: {
      display: "flex",
      flexDirection: "row",
      marginBottom: 5,
    },
    tableCell: {
      width: "16.6%",
      padding: 5,
      border: "1px solid black",
      textAlign: "center",
      fontWeight: "bold",
    },
    tableCellData: {
      width: "16.6%",
      padding: 5,
      border: "1px solid black",
      textAlign: "center",
    },
  });

  const generatePdfDocument = (data: ApiResponse) => (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Reporte de Sistema - {fecha}</Text>

        <Text style={styles.section}>Procesos</Text>
        <Table data={data.processes} headers={["PID", "Process Name", "CPU %", "Memory Usage", "Status"]} />

        <Text style={styles.section}>Recursos del Sistema</Text>
        <Table data={data.system_resources} headers={["CPU %", "Memory Available", "Memory Used", "Disk Usage", "Net Bytes Sent", "Net Bytes Received"]} />
      </Page>
    </Document>
  );

  const Table = ({ data, headers }: { data: any[]; headers: string[] }) => (
    <View style={styles.table}>
      {/* Render Table Headers */}
      <View style={styles.tableRow}>
        {headers.map((header, index) => (
          <View style={styles.tableCell} key={index}>
            <Text>{header}</Text>
          </View>
        ))}
      </View>

      {/* Render Table Data */}
      {data.map((item, index) => (
        <View style={styles.tableRow} key={index}>
          {Object.values(item).map((value, i) => (
            <View style={styles.tableCellData} key={i}>
              <Text>{value}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Generar Reporte de Sistema</h1>

      <div className="mb-4">
        <label className="block text-lg font-medium" htmlFor="fecha">Fecha</label>
        <input
          type="date"
          id="fecha"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="mt-2 p-2 border border-gray-300 rounded-lg"
        />
      </div>

      <button
        onClick={fetchReportData}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Generar Reporte
      </button>

      {/* Mostrar mensaje de carga */}
      {loading && (
        <div className="mt-4 text-center text-lg text-gray-500">
          Cargando datos, por favor espere...
        </div>
      )}

      {/* Mostrar el PDF Download Link solo si los datos están disponibles */}
      {reportData && !loading && (
        <div className="mt-4">
          <PDFDownloadLink
            document={generatePdfDocument(reportData)}
            fileName={`reporte_${fecha}.pdf`}
          >
            {({ loading }) => (
              <button
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                {loading ? "Cargando reporte..." : "Descargar PDF"}
              </button>
            )}
          </PDFDownloadLink>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
