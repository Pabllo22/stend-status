import type { Circuit } from '../db/database';
import CircuitComponent from './Circuit';

interface StandProps {
  id: string;
  name: string;
  isActive: boolean;
  circuits: Circuit[];
  onStandToggle: (standId: string) => void;
  onCircuitToggle: (circuitId: string) => void;
  onCircuitTaskNumberChange: (circuitId: string, taskNumber: string | null) => void;
  onCircuitDrop: (circuitId: string, userId: string | null) => void;
}

export default function Stand({ 
  id, 
  name, 
  isActive, 
  circuits, 
  onStandToggle, 
  onCircuitToggle,
  onCircuitTaskNumberChange,
  onCircuitDrop 
}: StandProps) {
  return (
    <div className={`stand ${isActive ? 'active' : 'inactive'}`}>
      <div className="stand-header">
        <div className="stand-server-design">
          <div className="server-rack">
            <div className="server-front">
              <div className="server-indicators">
                <div className={`server-led ${isActive ? 'led-on' : 'led-off'}`}></div>
                <div className={`server-led ${isActive ? 'led-on' : 'led-off'}`}></div>
              </div>
              <div className="server-slots">
                {circuits.map((_, index) => (
                  <div key={index} className={`server-slot ${circuits[index]?.isOccupied ? 'occupied' : ''}`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="stand-info">
          <h2 className="stand-title">{name}</h2>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => onStandToggle(id)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
      <div className="circuits-container">
        {circuits.map(circuit => (
          <CircuitComponent
            key={circuit.id}
            circuit={circuit}
            onToggle={onCircuitToggle}
            onTaskNumberChange={onCircuitTaskNumberChange}
            onDrop={onCircuitDrop}
            disabled={!isActive}
          />
        ))}
      </div>
    </div>
  );
}

