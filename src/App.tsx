import { useEffect, useState } from 'react';
import './App.css';
import { initDatabase, getStands, getCircuits, getUsers, toggleCircuit, toggleStand, assignUserToCircuit, addUser, deleteUser, updateCircuitTaskNumber } from './db/supabaseDatabase';
import type { Stand, Circuit, User } from './db/supabase';
import StandComponent from './components/Stand';
import UserList from './components/UserList';

function App() {
  const [stands, setStands] = useState<Stand[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      await initDatabase();
      const standsData = await getStands();
      const circuitsData = await getCircuits();
      const usersData = await getUsers();
      setStands(standsData);
      setCircuits(circuitsData);
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCircuitToggle = async (circuitId: string) => {
    try {
      await toggleCircuit(circuitId);
      const circuitsData = await getCircuits();
      setCircuits(circuitsData);
    } catch (error) {
      console.error('Ошибка переключения контура:', error);
    }
  };

  const handleCircuitDrop = async (circuitId: string, userId: string | null) => {
    await assignUserToCircuit(circuitId, userId);
    const circuitsData = await getCircuits();
    setCircuits(circuitsData);
  };

  const handleStandToggle = async (standId: string) => {
    await toggleStand(standId);
    const standsData = await getStands();
    const circuitsData = await getCircuits();
    setStands(standsData);
    setCircuits(circuitsData);
  };

  const handleCircuitTaskNumberChange = async (circuitId: string, taskNumber: string | null) => {
    await updateCircuitTaskNumber(circuitId, taskNumber);
    const circuitsData = await getCircuits();
    setCircuits(circuitsData);
  };

  const handleUserAdd = async (name: string) => {
    await addUser(name);
    const usersData = await getUsers();
    setUsers(usersData);
  };

  const handleUserDelete = async (userId: string) => {
    await deleteUser(userId);
    const usersData = await getUsers();
    const circuitsData = await getCircuits();
    setUsers(usersData);
    setCircuits(circuitsData);
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
