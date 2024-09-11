import React, { useState, useEffect } from 'react';
import './App.css';
import { dialog } from '@tauri-apps/api';
import * as signalR from '@microsoft/signalr';  // Importamos SignalR

const StationCard = ({ id, status, line, productionTime, deadTime, lastSealTime, numStops, onClick }) => {
  const getStatusClassName = (status) => {
    debugger
    switch (status) {
      case 1:
        return 'status-production';
      case 2:
        return 'status-stopped';
      case 4:
        return 'status-fault';
      case 3:
        return 'status-idle';
      default:
        return 'status-stopped';
    }
  };

  return (
    <article onClick={() => onClick(id)} className={`cardMachine station-card`}>
      <header style={{ height: '1.6rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className={`cardSelladoraHeaderStatus ${getStatusClassName(status)}`}>
          <p className="setEstatus" style={{ fontSize: '12px', color: '#ffffff', margin: '0 !important' }}>
            {status === 1? 'EN PRODUCCION' :
             status === 2 ? 'ESTACIÓN ALARMADA' :
             status === 3 ? 'SIN TRABAJO' :
             status === 4 ? 'PARO POR FALLA' : ''}
          </p>
        </div>
      </header>
      <h4 className="titleMachine">{line}{id}</h4>
      <div className="d-flex justify-content-center">
        <img className="cardMachineIMG"
          src={`../src/assets/${status === "1" ? 'work.svg' :
            status === 2 ? 'warning.svg' :
            status === 4 ? 'sleep.svg' :
            status === 3 ? 'nowork.svg' :
            'nowork.svg'}`}
          width="74"
          alt="Machine" />
      </div>
      <p className="tiempoProduccion">
        <span style={{ color: 'gray', fontWeight: 500 }}>TIEMPO PRODUCCIÓN:</span> {productionTime}
      </p>
      <p className="tiempoMuerto">
        <span style={{ color: 'gray', fontWeight: 500 }}>TIEMPO MUERTO:</span> {deadTime}
      </p>
      <p className="ULTIMO_RW">ULT. SELLADO: {lastSealTime}</p>
      <footer className="cardMachineFooter">
        <div>
          <p className="TIEMPO_CICLO"></p>
        </div>
        <div>
          <p className="F_INICIO_PARO"><span>N. DE PAROS: </span>{numStops}</p>
        </div>
      </footer>
    </article>
  );
};

const App = () => {
  const [datos, setDatos] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false); // Bandera para cargar datos iniciales

  // Configurar la conexión a SignalR
  useEffect(() => {
    const setupSignalR = async () => {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl("http://192.168.100.187:5203/estatusHub") //ServidorSignalR
        .withAutomaticReconnect()
        .build();
      try {
        await connection.start();
        console.log("Conectado al servidor SignalR");
      } catch (err) {
        console.error("Error al conectar con SignalR: ", err);
      }

      // Recibir los datos de SignalR solo para el campo ESTATUS
      connection.on("RecibirEstatus", (nuevoEstatus) => {
        if (initialDataLoaded) { // Solo actualizamos cuando los datos iniciales están cargados
          console.log("Nuevo estatus recibido: ", nuevoEstatus);

          // Mapear las propiedades recibidas de SignalR 
          const updatedStations = nuevoEstatus.map(station => ({
            ID_ESTACION: station.iD_ESTACION,
            D_ESTACION: station.d_ESTACION,
            ESTATUS: station.estatus 
          }));

          // Actualizar solo el ESTATUS en las estaciones 
          setDatos(prevDatos =>
            prevDatos.map(station =>
              updatedStations.find(updated => updated.ID_ESTACION === station.ID_ESTACION)
                ? { ...station, ESTATUS: updatedStations.find(updated => updated.ID_ESTACION === station.ID_ESTACION).ESTATUS }
                : station
            )
          );
        }
      });

      return () => {
        connection.stop();
      };
    };

    setupSignalR();
  }, [initialDataLoaded]); // Se ejecutará cuando se carguen los datos iniciales

  // Función para obtener datos iniciales desde la API
  const fetchDatos = async () => {
    try {
      const response = await fetch('http://192.168.100.187:5202/api/Informacion/Estacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setDatos(data);  // Cargamos los datos iniciales
        setInitialDataLoaded(true); // Indicamos que los datos iniciales ya están cargados
      } else {
        setError("Datos recibidos no son un array");
      }
    } catch (error) {
      setError('Error al cargar los datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos(); // Llamada inicial para obtener los datos, esto se hace solo la primera vez
  }, []);

  if (isLoading) return <div>Cargando datos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <header>
        <h1 className=''>ANDON DEMO</h1>
      </header>
      <div className="section-machines">
        {datos.map((station) => (
          <StationCard
            key={station.ID_ESTACION}
            id={station.ID_ESTACION}
            status={station.ESTATUS}
            line={station.D_ESTACION}
            productionTime={station.ID_ESTACION}
            deadTime={station.ID_ESTACION}
            lastSealTime={station.ESTATUS}
            numStops={station.ESTATUS}
            onClick={() => console.log("ID de estación: ", station.ID_ESTACION)}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
