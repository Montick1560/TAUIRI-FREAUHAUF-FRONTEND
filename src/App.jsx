import React, { useState, useEffect } from 'react';
import './App.css';
import { dialog } from '@tauri-apps/api';
const StationCard = ({ id,status, line, productionTime, deadTime, lastSealTime, numStops }) => {
  const EnviarID = async() =>{
    try {
      await dialog.message(`ID de la estación: ${id}`, { title: 'Información de la Estación', type: 'info' });
    } catch (error) {
      console.error('Error al mostrar el diálogo:', error);
    }
  };
  const getStatusClassName = (status) => {
    switch (status) {
      case 'SIN TRABAJO':
        return 'status-idle';
      case 'EN PRODUCCIÓN':
        return 'status-production';
      case 'ESTACIÓN ALARMADA':
        return 'status-stopped';
      case 'PARO POR FALLA':
        return 'status-fault';
      default:
        return '';
    }
  };

  return (
    <article onClick={EnviarID} className={`cardMachine station-card`} >
      <header style={{ height: '1.6rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className={`cardSelladoraHeaderStatus ${getStatusClassName(status)}`}>
          <p className="setEstatus" style={{ fontSize: '12px', color: '#ffffff', margin: '0 !important' }}>{status}</p>
        </div>
      </header>
      <h4 className="titleMachine">{line}{id}</h4>
      <div className="d-flex justify-content-center">
        <img className="cardMachineIMG" src={`../src/assets/${status == 'EN PRODUCCIÓN' ? 'work.svg': status == 'ESTACIÓN ALARMADA' ?'warning.svg': status == 'PARO POR FALLA' ? 'sleep.svg' : 'nowork.svg'}`} width="74" alt="Machine" />
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

  const fetchDatos = async () => {
    try {
      const response = await fetch('http://192.168.1.67:5202/api/Informacion/Estacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setDatos(data);
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
    fetchDatos(); // Llamada inicial
    const intervalId = setInterval(fetchDatos, 100); // Llama a fetchDatos cada 10 segundos

    return () => clearInterval(intervalId); // Limpia el intervalo cuando el componente se desmonte
  }, []);

  if (isLoading) return <div>Cargando datos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <header>
        <h1 className=''>ANDON DEMO</h1>
      </header>
      <div className="section-machines">
        {datos.map((station, index) => (
          <StationCard
            key={index.ID_ESTACION}
            id={station.ID_ESTACION}
            status={station.ESTATUS}
            line={station.D_ESTACION}
            productionTime={station.ID_ESTACION}
            deadTime={station.ID_ESTACION}
            lastSealTime={station.ESTATUS}
            numStops={station.ESTATUS}
          />
        ))}
      </div>
    </div>

  );
};

export default App;