import psutil
import socket
import asyncio
import json
import websockets
import time
import os

def get_process_name(pid):
    """Obtiene el nombre del proceso dado un PID."""
    try:
        process = psutil.Process(pid)
        return process.name()
    except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
        return "Desconocido"

def get_connection_type(conn_type):
    """Convierte el tipo de socket a un nombre legible."""
    if conn_type == socket.SOCK_STREAM:
        return "TCP"
    elif conn_type == socket.SOCK_DGRAM:
        return "UDP"
    elif conn_type == socket.SOCK_RAW:
        return "ICMP"
    else:
        return "OTRO"

def get_detailed_network_connections():
    """Obtiene información detallada de conexiones de red."""
    detailed_connections = []
    
    try:
        for conn in psutil.net_connections(kind='all'):
            connection_info = {
                'type': get_connection_type(conn.type),
                'local_address': conn.laddr.ip if conn.laddr else "-",
                'local_port': conn.laddr.port if conn.laddr else 0,
                'remote_address': conn.raddr.ip if conn.raddr else "-",
                'remote_port': conn.raddr.port if conn.raddr else 0,
                'status': conn.status if hasattr(conn, 'status') else "-",
                'pid': conn.pid if conn.pid else 0,
                'process': get_process_name(conn.pid) if conn.pid else "Sistema"
            }
            detailed_connections.append(connection_info)
    except (psutil.AccessDenied, PermissionError) as e:
        # En algunos sistemas se requieren permisos de administrador
        detailed_connections.append({
            'type': 'ERROR',
            'local_address': '-',
            'local_port': 0,
            'remote_address': '-',
            'remote_port': 0,
            'status': f'Error de permisos: {str(e)}',
            'pid': 0,
            'process': 'Se requieren permisos de administrador'
        })
    
    return detailed_connections

def get_system_resources():
    """Obtiene los recursos del sistema."""
    cpu_percent = psutil.cpu_percent(interval=1)
    # Obtener uso de CPU por núcleo
    cpu_percent_per_core = psutil.cpu_percent(interval=0, percpu=True)  # interval=0 porque ya esperamos 1 segundo arriba
    
    # Obtener carga promedio (solo disponible en sistemas Unix)
    try:
        load_avg = os.getloadavg()
    except (AttributeError, OSError):
        load_avg = [0, 0, 0]  # Valores predeterminados para sistemas que no soportan getloadavg
    
    # Obtener frecuencia de CPU
    cpu_freq = psutil.cpu_freq()
    
    # Obtener temperatura de CPU (si está disponible)
    cpu_temp = None
    if hasattr(psutil, "sensors_temperatures"):
        temps = psutil.sensors_temperatures()
        if temps:
            # Intentar obtener temperaturas de diferentes sensores según la plataforma
            if 'coretemp' in temps:
                cpu_temp = temps['coretemp'][0].current
            elif 'k10temp' in temps:  # AMD
                cpu_temp = temps['k10temp'][0].current
            elif 'cpu_thermal' in temps:  # RPi
                cpu_temp = temps['cpu_thermal'][0].current
            # Intentar otros sensores comunes si los anteriores no existen
            elif len(temps) > 0:
                # Tomar el primer sensor disponible
                first_sensor = list(temps.keys())[0]
                if temps[first_sensor] and len(temps[first_sensor]) > 0:
                    cpu_temp = temps[first_sensor][0].current


    memory = psutil.virtual_memory()
    swap = psutil.swap_memory()
    
    # Verificar qué atributos están disponibles según el sistema operativo
    # Depuración: Ver qué atributos están disponibles
    memory_attrs = dir(memory)
    # Solo hacemos print si ejecutamos directamente el script
    if __name__ == "__main__":
        print("Atributos disponibles en memoria:", memory_attrs)
    
    # En algunos sistemas, buffers y cached podrían tener nombres diferentes
    # o calcularse de otra manera
    buffers_value = 0
    cached_value = 0
    
    # Comprobar múltiples nombres posibles para buffers y cache
    if hasattr(memory, 'buffers'):
        buffers_value = memory.buffers / (1024 * 1024)
    elif hasattr(memory, 'shared'):
        # En algunos sistemas 'shared' puede ser similar a buffers
        buffers_value = memory.shared / (1024 * 1024)
    
    if hasattr(memory, 'cached'):
        cached_value = memory.cached / (1024 * 1024)
    elif hasattr(memory, 'cache'):
        cached_value = memory.cache / (1024 * 1024)
    
    # Si no podemos obtener estos valores directamente, podemos estimarlos
    # La fórmula típica es: used = total - free - buffers - cached
    # Por lo tanto: buffers + cached = total - free - used
    if buffers_value == 0 and cached_value == 0:
        estimated_cache_buffers = memory.total - memory.free - (memory.used - (memory.available if hasattr(memory, 'available') else 0))
        if estimated_cache_buffers > 0:
            # Si hay algo para distribuir, asumimos una división típica: 20% buffers, 80% cache
            buffers_value = (estimated_cache_buffers * 0.2) / (1024 * 1024)
            cached_value = (estimated_cache_buffers * 0.8) / (1024 * 1024)

    memory_info = {
        'total': memory.total / (1024 * 1024),  # Convertir a MB
        'available': memory.available / (1024 * 1024) if hasattr(memory, 'available') else (memory.free / (1024 * 1024)),
        'used': memory.used / (1024 * 1024),
        'free': memory.free / (1024 * 1024),
        'percent': memory.percent,
        'buffers': buffers_value,
        'cached': cached_value,
        'swap_total': swap.total / (1024 * 1024),
        'swap_used': swap.used / (1024 * 1024),
        'swap_free': swap.free / (1024 * 1024),
        'swap_percent': swap.percent,
        'timestamp': time.time() * 1000  # Timestamp en milisegundos
    }
    
    # Obtener información de disco
    disk_usage = psutil.disk_usage('/')

    # Obtener estadísticas de red
    net_io = psutil.net_io_counters()
    net_connections_detail = get_detailed_network_connections()

    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info', 'status']):
        try:
            processes.append({
                'pid': proc.info['pid'],
                'name': proc.info['name'],
                'cpu_percent': proc.info['cpu_percent'],
                'memory': proc.info['memory_info'].rss / (1024 * 1024),  # Convert to MB
                'status': proc.info['status']
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass   
    
    # Ordenar los procesos por uso de CPU y tomar los 10 primeros
    processes = sorted(processes, key=lambda x: x['cpu_percent'], reverse=True)[:10]

    # Preparar información detallada de CPU
    cpu_detailed = {
        'usage': cpu_percent,
        'per_core': cpu_percent_per_core,
        'frequency': cpu_freq.current / 1000 if cpu_freq else 0,  # Convertir a GHz
        'temperature': cpu_temp if cpu_temp is not None else 0,
        'load_avg': load_avg,
        'cores_count': len(cpu_percent_per_core),
        'timestamp': time.time() * 1000  # Timestamp en milisegundos
    }

    return {
        'cpu_percent': cpu_percent,
        'cpu_freq': cpu_freq.current if cpu_freq else None,
        'cpu_temp': cpu_temp,
        'cpu_detailed': cpu_detailed,
        'memory_percent': memory.percent,
        'memory_detailed': memory_info,
        'disk_percent': disk_usage.percent,
        'net_bytes_sent': net_io.bytes_sent,
        'net_bytes_recv': net_io.bytes_recv,
        'net_connections_count': len(net_connections_detail),
        'net_connections_detail': net_connections_detail, 
        'processes': processes
    }