import asyncio
import json
import websockets
from flask import Flask, request, jsonify
import psycopg2
from utils import get_system_resources
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuración de la base de datos PostgreSQL
DB_CONFIG = {
    "dbname": "systemop",
    "user": "postgres",
    "password": "adminadmin123",
    "host": "localhost",
    "port": "5432"
}

def get_db_connection():
    """Conexión a la base de datos PostgreSQL."""
    conn = psycopg2.connect(**DB_CONFIG)
    return conn

def insert_network_connection(data):
    """Inserta datos sobre conexiones de red en la base de datos."""
    try:
        if data['pid'] <= 0:  # Verificar que el pid sea mayor a 0
            return  # No insertar si el PID no es válido

        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO network_connections (connection_type, local_address, local_port, remote_address, remote_port, status, pid, process_name)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            data['type'],
            data['local_address'],
            data['local_port'],
            data['remote_address'],
            data['remote_port'],
            data['status'],
            data['pid'],
            data['process']
        ))
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error al insertar en network_connections: {e}")


def insert_system_resources(data):
    """Inserta los recursos del sistema en la base de datos."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO system_resources (cpu_percent, cpu_frequency, cpu_temperature, memory_percent, memory_total, memory_available, memory_used, memory_free, swap_total, swap_used, swap_free, disk_usage, net_bytes_sent, net_bytes_received)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            data['cpu_percent'],
            data['cpu_freq'],
            data['cpu_temp'],
            data['memory_percent'],
            data['memory_detailed']['total'],
            data['memory_detailed']['available'],
            data['memory_detailed']['used'],
            data['memory_detailed']['free'],
            data['memory_detailed']['swap_total'],
            data['memory_detailed']['swap_used'],
            data['memory_detailed']['swap_free'],
            data['disk_percent'],
            data['net_bytes_sent'],
            data['net_bytes_recv']
        ))
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error al insertar en system_resources: {e}")



def insert_processes(data):
    """Inserta los procesos en la base de datos."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO processes (pid, process_name, cpu_percent, memory_usage, status)
            VALUES (%s, %s, %s, %s, %s)
        """
        for proc in data:
            if proc['pid'] <= 0:  # Verificar que el pid sea mayor a 0
                continue  # No insertar si el PID no es válido

            cursor.execute(query, (
                proc['pid'],
                proc['name'],
                proc['cpu_percent'],
                proc['memory'],
                proc['status']
            ))
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error al insertar en processes: {e}")


@app.route('/api/get_data_by_date', methods=['POST'])
def get_data_by_date():
    """Devuelve la información de la fecha proporcionada en la solicitud POST."""
    try:
        # Obtener la fecha desde el cuerpo de la solicitud
        data = request.get_json()
        fecha = data.get('fecha', None)

        if not fecha:
            return jsonify({"error": "Fecha no proporcionada"}), 400

        # Consultar la base de datos para la fecha específica
        conn = get_db_connection()
        cursor = conn.cursor()

        # Consultar los procesos (solo los campos necesarios)
        query_processes = """
        SELECT pid,process_name,cpu_percent ,memory_usage,status 
        FROM processes WHERE DATE(timestamp) = %s;
        """
        cursor.execute(query_processes, (fecha,))
        processes = cursor.fetchall()

        # Consultar los recursos del sistema (solo los campos necesarios)
        query_system_resources = """
        SELECT cpu_percent,cpu_frequency,memory_percent,swap_used,net_bytes_sent,net_bytes_received 
        FROM system_resources WHERE DATE(timestamp) = %s;
        """
        cursor.execute(query_system_resources, (fecha,))
        system_resources = cursor.fetchall()

        conn.close()

        # Formatear los resultados en un formato adecuado para las interfaces
        formatted_processes = [
            {
                "pid": row[0],
                "processName": row[1],
                "cpuPercent": round(row[2], 2),  # Redondear a dos decimales
                "memoryUsage": round(row[3], 2),  # Redondear a dos decimales
                "status": row[4],
            }
            for row in processes
        ]

        formatted_system_resources = [
             {
                "cpuPercent": round(row[0], 2),  # Redondear a dos decimales
                "memoryAvailable": round(row[1], 2),  # Redondear a dos decimales
                "memoryUsed": round(row[2], 2),  # Redondear a dos decimales
                "diskUsage": round(row[3], 2),  # Redondear a dos decimales
                "netBytesSent": round(row[4] / (1024 ** 2), 2),  # Convertir a MB (redondear a dos decimales)
                "netBytesReceived": round(row[5] / (1024 ** 2), 2),  # Convertir a MB (redondear a dos decimales)
             }
            for row in system_resources
        ]

        # Devolver la respuesta con solo los datos relevantes
        return jsonify({
            "processes": formatted_processes,
            "system_resources": formatted_system_resources
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

async def send_system_info(websocket, path=None):
    """Mantiene la conexión WebSocket activa y envía la información del sistema."""
    print(f"Conexión WebSocket establecida con {websocket.remote_address}")
    try:
        while True:
            resources = get_system_resources()
            
            # Insertar información de red
            for conn in resources['net_connections_detail']:
                insert_network_connection(conn)
            
            # Insertar información de recursos del sistema
            insert_system_resources(resources)
            
            # Insertar procesos
            insert_processes(resources['processes'])
            
            cpu_freq_ghz = resources['cpu_freq'] / 1000 if resources['cpu_freq'] else None
            message = json.dumps({
                "cpu": f"{resources['cpu_percent']}%",
                "cpu_freq": f"{cpu_freq_ghz:.2f} GHz" if cpu_freq_ghz else None,
                "cpu_temp": f"{resources['cpu_temp']}°C" if resources['cpu_temp'] else None,
                "cpu_detallado": resources['cpu_detailed'],
                "memoria": f"{resources['memory_percent']}%",
                "memoria_detallada": resources['memory_detailed'],
                "disco": f"{resources['disk_percent']}%",
                "red_enviados": f"{resources['net_bytes_sent'] / 1024:.2f} KB",
                "red_recibidos": f"{resources['net_bytes_recv'] / 1024:.2f} KB",
                "conexiones_red": resources['net_connections_count'],
                "detalles_conexiones": resources['net_connections_detail'],
                "procesos": resources['processes']
            }, ensure_ascii=False)
            await websocket.send(message)
            await asyncio.sleep(1)
    except websockets.exceptions.ConnectionClosed:
        print(f"Cliente WebSocket {websocket.remote_address} desconectado.")


async def main():
    """Inicia el servidor WebSocket."""
    print("Servidor WebSocket iniciado en ws://localhost:8765")
    start_websocket_server = websockets.serve(send_system_info, '0.0.0.0', 8765)
    await start_websocket_server
    try:
        await asyncio.Future()  # Run forever
    except asyncio.CancelledError:
        print("Servidor detenido manualmente.")
    except KeyboardInterrupt:
        print("Interrupción del servidor recibida. Cerrando...")
        await asyncio.gather(start_websocket_server.ws_server.close())

if __name__ == "__main__":
    # Inicia el servidor Flask en un hilo separado
    from threading import Thread
    flask_thread = Thread(target=lambda: app.run(host='0.0.0.0', port=5000))
    flask_thread.start()

    # Inicia el servidor WebSocket
    asyncio.run(main())