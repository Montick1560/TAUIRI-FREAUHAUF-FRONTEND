import React, { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

const EstacionComponent = () => {
  const [idEstacion, setIdEstacion] = useState('1'); // Mantiene el ID actual de la estación
  const [estatus, setEstatus] = useState(null); // Mantiene el estatus actual
  const [connection, setConnection] = useState(null); // Mantiene la conexión actual

  useEffect(() => {
    if (!idEstacion) return; // No hacer nada si idEstacion está vacío

    const establecerConexion = async () => {
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl('http://192.168.1.69:5202/estatusHub')
        .configureLogging(signalR.LogLevel.Information)
        .build();

      setConnection(newConnection);

      try {
        await newConnection.start();
        console.log("Conectado al hub");
        await newConnection.invoke("EscucharPorEstacion", idEstacion);
        console.log(`Escuchando cambios para la estación ${idEstacion}`);
      } catch (err) {
        console.error("Error al conectar al hub o al escuchar la estación", err);
      }

      // Recibir actualizaciones de estatus
      newConnection.on("RecibirEstatus", (data) => {
        if (typeof data === 'object' && data !== null) {
          setEstatus(data.estatus || "Estatus no disponible");
          console.log("Estatus recibido:", data);
        } else {
          setEstatus(data);
          console.log("Estatus recibido:", data);
        }
      });
    };

    establecerConexion();

    return () => {
      if (connection) {
        connection.stop().then(() => console.log("Conexión cerrada"));
      }
    };
  }, [idEstacion]); // Dependencia de idEstacion

  return (
    <div>
      <input
        type="text"
        value={idEstacion}
        onChange={e => setIdEstacion(e.target.value)}
        placeholder="Ingrese ID de la estación"
      />
      <button onClick={() => connection?.invoke("EscucharPorEstacion", idEstacion)}>
        Escuchar Estación
      </button>
      <h2>Escuchando cambios para la estación: {idEstacion}</h2>
      <p>Estatus actual: {estatus !== null ? estatus : "Esperando estatus..."}</p>
    </div>
  );
};

export default EstacionComponent;
