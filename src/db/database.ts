import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';

export interface Circuit {
  id: string;
  standId: string;
  name: string;
  isOccupied: boolean;
  isActive: boolean;
  userId: string | null;
  taskNumber: string | null;
}

export interface Stand {
  id: string;
  name: string;
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
}

let db: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  // Try to load existing database from localStorage
  const savedDb = localStorage.getItem('stend-status-db');
  
  if (savedDb) {
    const buffer = Uint8Array.from(atob(savedDb), c => c.charCodeAt(0));
    db = new SQL.Database(buffer);
    // Migrate if needed - add isActive column if it doesn't exist
    try {
      db.exec('SELECT isActive FROM stands LIMIT 1');
    } catch {
      // Column doesn't exist, add it
      db.run('ALTER TABLE stands ADD COLUMN isActive INTEGER DEFAULT 1');
      // Update all existing stands to be active
      db.run('UPDATE stands SET isActive = 1 WHERE isActive IS NULL');
    }
    
    // Migrate circuits - add isActive column if it doesn't exist
    try {
      db.exec('SELECT isActive FROM circuits LIMIT 1');
    } catch {
      // Column doesn't exist, add it
      db.run('ALTER TABLE circuits ADD COLUMN isActive INTEGER DEFAULT 1');
      // Update all existing circuits to be active
      db.run('UPDATE circuits SET isActive = 1 WHERE isActive IS NULL');
      // Update circuit names to Test 1 and Test 2
      db.run("UPDATE circuits SET name = 'Test 1' WHERE name = 'Контур 1'");
      db.run("UPDATE circuits SET name = 'Test 2' WHERE name = 'Контур 2'");
    }
    
    // Migrate circuits - add taskNumber column if it doesn't exist
    try {
      db.exec('SELECT taskNumber FROM circuits LIMIT 1');
    } catch {
      // Column doesn't exist, add it
      db.run('ALTER TABLE circuits ADD COLUMN taskNumber TEXT');
      saveDatabase();
    }
  } else {
    db = new SQL.Database();
    createTables();
    initializeData();
  }

  return db;
}

function createTables() {
  if (!db) return;

  // Stands table
  db.run(`
    CREATE TABLE IF NOT EXISTS stands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      isActive INTEGER DEFAULT 1
    )
  `);

  // Circuits table
  db.run(`
    CREATE TABLE IF NOT EXISTS circuits (
      id TEXT PRIMARY KEY,
      standId TEXT NOT NULL,
      name TEXT NOT NULL,
      isOccupied INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      userId TEXT,
      taskNumber TEXT,
      FOREIGN KEY (standId) REFERENCES stands(id)
    )
  `);

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);
}

function initializeData() {
  if (!db) return;

  // Insert stands
  const stands = [
    { id: 'meetups', name: 'Meetups' },
    { id: 'career', name: 'Career' },
    { id: 'edu', name: 'Edu' },
    { id: 'sprint-offer', name: 'Sprint Offer' },
  ];

  stands.forEach(stand => {
    db!.run('INSERT INTO stands (id, name, isActive) VALUES (?, ?, ?)', [stand.id, stand.name, 1]);
  });

  // Insert circuits (2 per stand)
  stands.forEach(stand => {
    for (let i = 1; i <= 2; i++) {
      const circuitId = `${stand.id}-circuit-${i}`;
      db!.run(
        'INSERT INTO circuits (id, standId, name, isOccupied, isActive, userId) VALUES (?, ?, ?, ?, ?, ?)',
        [circuitId, stand.id, `Test ${i}`, 0, 1, null]
      );
    }
  });

  // Insert users
  const users = [
    { id: 'anton', name: 'Антон' },
    { id: 'aliya', name: 'Алия' },
    { id: 'natasha', name: 'Наташа' },
  ];

  users.forEach(user => {
    db!.run('INSERT INTO users (id, name) VALUES (?, ?)', [user.id, user.name]);
  });

  saveDatabase();
}

export function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = new Uint8Array(data);
  const base64 = btoa(String.fromCharCode(...buffer));
  localStorage.setItem('stend-status-db', base64);
}

export function getStands(): Stand[] {
  if (!db) return [];
  const result = db.exec('SELECT id, name, isActive FROM stands');
  if (result.length === 0) return [];
  return result[0].values.map(([id, name, isActive]) => ({
    id: id as string,
    name: name as string,
    isActive: (isActive as number) === 1,
  }));
}

export function toggleStand(standId: string) {
  if (!db) return;
  const stands = getStands();
  const stand = stands.find(s => s.id === standId);
  if (!stand) return;

  const newIsActive = !stand.isActive;
  
  db.run(
    'UPDATE stands SET isActive = ? WHERE id = ?',
    [newIsActive ? 1 : 0, standId]
  );
  
  // If deactivating the stand (making it inactive), reset task numbers for all circuits
  if (!newIsActive) {
    db.run(
      'UPDATE circuits SET taskNumber = ? WHERE standId = ?',
      [null, standId]
    );
  }
  
  saveDatabase();
}

export function getCircuits(): Circuit[] {
  if (!db) return [];
  const result = db.exec('SELECT id, standId, name, isOccupied, isActive, userId, taskNumber FROM circuits');
  if (result.length === 0) return [];
  return result[0].values.map(([id, standId, name, isOccupied, isActive, userId, taskNumber]) => ({
    id: id as string,
    standId: standId as string,
    name: name as string,
    isOccupied: (isOccupied as number) === 1,
    isActive: (isActive as number) === 1,
    userId: userId as string | null,
    taskNumber: taskNumber as string | null,
  }));
}

export function getUsers(): User[] {
  if (!db) return [];
  const result = db.exec('SELECT id, name FROM users');
  if (result.length === 0) return [];
  return result[0].values.map(([id, name]) => ({
    id: id as string,
    name: name as string,
  }));
}

export function addUser(name: string): string | null {
  if (!db) return null;
  if (!name || name.trim() === '') return null;
  
  // Generate unique ID
  const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    db.run('INSERT INTO users (id, name) VALUES (?, ?)', [id, name.trim()]);
    saveDatabase();
    return id;
  } catch (error) {
    console.error('Failed to add user:', error);
    return null;
  }
}

export function deleteUser(userId: string) {
  if (!db) return;
  
  // First, remove user from all circuits
  db.run('UPDATE circuits SET isOccupied = ?, userId = ? WHERE userId = ?', [0, null, userId]);
  
  // Then delete the user
  db.run('DELETE FROM users WHERE id = ?', [userId]);
  saveDatabase();
}

export function toggleCircuit(circuitId: string) {
  if (!db) return;
  const circuits = getCircuits();
  const circuit = circuits.find(c => c.id === circuitId);
  if (!circuit) return;

  // Toggle occupied state
  const newIsOccupied = !circuit.isOccupied;
  // If freeing the circuit, also clear the user and task number
  const userId = newIsOccupied ? circuit.userId : null;
  const taskNumber = newIsOccupied ? circuit.taskNumber : null;

  db.run(
    'UPDATE circuits SET isOccupied = ?, userId = ?, taskNumber = ? WHERE id = ?',
    [newIsOccupied ? 1 : 0, userId, taskNumber, circuitId]
  );
  saveDatabase();
}

export function toggleCircuitActive(circuitId: string) {
  if (!db) return;
  const circuits = getCircuits();
  const circuit = circuits.find(c => c.id === circuitId);
  if (!circuit) return;

  db.run(
    'UPDATE circuits SET isActive = ? WHERE id = ?',
    [circuit.isActive ? 0 : 1, circuitId]
  );
  saveDatabase();
}

export function assignUserToCircuit(circuitId: string, userId: string | null) {
  if (!db) return;
  const circuits = getCircuits();
  const circuit = circuits.find(c => c.id === circuitId);
  if (!circuit) return;

  db.run(
    'UPDATE circuits SET isOccupied = ?, userId = ? WHERE id = ?',
    [userId !== null ? 1 : 0, userId, circuitId]
  );
  saveDatabase();
}

export function getCircuitById(circuitId: string): Circuit | null {
  if (!db) return null;
  const circuits = getCircuits();
  return circuits.find(c => c.id === circuitId) || null;
}

export function getUserById(userId: string): User | null {
  if (!db) return null;
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
}

export function updateCircuitTaskNumber(circuitId: string, taskNumber: string | null) {
  if (!db) return;
  const taskNumberValue = taskNumber && taskNumber.trim() !== '' ? taskNumber.trim() : null;
  db.run(
    'UPDATE circuits SET taskNumber = ? WHERE id = ?',
    [taskNumberValue, circuitId]
  );
  saveDatabase();
}
