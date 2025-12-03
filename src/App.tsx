import { useEffect, useState } from 'react';
import './App.css';
import { initDatabase, getStands, getCircuits, getUsers, toggleCircuit, toggleStand, assignUserToCircuit, addUser, deleteUser, updateCircuitTaskNumber } from './db/database';
import type { Stand, Circuit, User } from './db/database';
import StandComponent from './components/Stand';
import UserList from './components/UserList';

function App() {
  const [stands, setStands] = useState<Stand[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        await initDatabase();
        setStands(getStands());
        setCircuits(getCircuits());
        setUsers(getUsers());
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCircuitToggle = (circuitId: string) => {
    toggleCircuit(circuitId);
    setCircuits(getCircuits());
  };

  const handleCircuitDrop = (circuitId: string, userId: string | null) => {
    assignUserToCircuit(circuitId, userId);
    setCircuits(getCircuits());
  };

  const handleStandToggle = (standId: string) => {
    toggleStand(standId);
    setStands(getStands());
    setCircuits(getCircuits()); // Refresh circuits to update task numbers
  };

  const handleCircuitTaskNumberChange = (circuitId: string, taskNumber: string | null) => {
    updateCircuitTaskNumber(circuitId, taskNumber);
    setCircuits(getCircuits());
  };

  const handleUserAdd = (name: string) => {
    addUser(name);
    setUsers(getUsers());
  };

  const handleUserDelete = (userId: string) => {
    deleteUser(userId);
    setUsers(getUsers());
    setCircuits(getCircuits()); // Refresh circuits in case user was assigned
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Инициализация базы данных...</div>
      </div>
    );
  }

  const standsWithCircuits = stands.map(stand => ({
    ...stand,
    circuits: circuits.filter(c => c.standId === stand.id),
  }));

  return (
    <div className="app">
      <div className="app-content">
        <div className="app-header">
          <h1>Статус Стендов</h1>
        </div>
        
        <div className="main-content">
          <div className="stands-grid">
            {standsWithCircuits.map(stand => (
              <StandComponent
                key={stand.id}
                id={stand.id}
                name={stand.name}
                isActive={stand.isActive}
                circuits={stand.circuits}
                onStandToggle={handleStandToggle}
                onCircuitToggle={handleCircuitToggle}
                onCircuitTaskNumberChange={handleCircuitTaskNumberChange}
                onCircuitDrop={handleCircuitDrop}
              />
            ))}
          </div>
          
          <UserList users={users} onUserAdd={handleUserAdd} onUserDeleted={handleUserDelete} />
        </div>
      </div>
    </div>
  );
}

export default App;
