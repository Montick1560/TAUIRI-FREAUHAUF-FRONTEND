import React, { useState, useEffect, useCallback } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const Servicio = () => {
    const [estatus, setEstatus] = useState(0);
    const [hubConnection, setHubConnection] = useState(null);
    const [connectionError, setConnectionError] = useState(null);

    const setupConnection = useCallback(async () => {
        const connection = new HubConnectionBuilder()
            .withUrl('http://192.168.1.67:5202/EsatcionHUB')
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        try {
            debugger
            await connection.start();
            console.log('Conectado al hub de SignalR');
            setConnectionError(null);
            setHubConnection(connection);

            connection.on('RecibirCambioEstatus', (idEstacion, nuevoEstatus) => {
                console.log(`Estación ${idEstacion} cambió a estatus: ${nuevoEstatus}`);
                // Actualiza tu UI según sea necesario
            });

            connection.onreconnecting(() => {
                console.log('Reconectando al hub de SignalR...');
            });

            connection.onreconnected(() => {
                console.log('Reconectado al hub de SignalR');
                setConnectionError(null);
            });

            connection.onclose((error) => {
                console.error('Conexión cerrada', error);
                setConnectionError('Conexión perdida. Intentando reconectar...');
            });

        } catch (err) {
            console.error('Error al conectar al hub de SignalR', err);
            setConnectionError(`Error de conexión: ${err.message}`);
        }
    }, []);

    useEffect(() => {
        setupConnection();

        return () => {
            if (hubConnection) {
                hubConnection.stop()
                    .then(() => console.log('Desconectado del hub de SignalR'))
                    .catch(err => console.error('Error al desconectar del hub de SignalR', err));
            }
        };
    }, [setupConnection]);

    return (
        <div>
            <h1>HOLA</h1>
            {connectionError ? (
                <p style={{ color: 'red' }}>{connectionError}</p>
            ) : (
                <p>Estatus de la estación 1: {estatus}</p>
            )}
        </div>
    );
};

export default Servicio;