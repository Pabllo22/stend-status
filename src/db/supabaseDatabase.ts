import { supabase, type Circuit, type Stand, type User } from './supabase';

// Инициализация базы данных (создание таблиц если их нет)
export async function initDatabase() {
  // Таблицы создаются через SQL в Supabase Dashboard
  // Этот файл только для проверки подключения
  try {
    const { error } = await supabase.from('stands').select('id').limit(1);
    if (error && error.code === '42P01') {
      console.error('Таблицы не созданы. Пожалуйста, выполните SQL скрипт в Supabase Dashboard');
    }
  } catch (error) {
    console.error('Ошибка подключения к Supabase:', error);
  }
}

export function saveDatabase() {
  // Не нужно для Supabase, изменения сохраняются автоматически
}

export async function getStands(): Promise<Stand[]> {
  const { data, error } = await supabase.from('stands').select('*').order('id');
  if (error) {
    console.error('Ошибка получения стендов:', error);
    return [];
  }
  return (data || []).map(stand => ({
    id: stand.id,
    name: stand.name,
    isActive: stand.isActive,
  }));
}

export async function getCircuits(): Promise<Circuit[]> {
  const { data, error } = await supabase.from('circuits').select('*').order('standId, name');
  if (error) {
    console.error('Ошибка получения контуров:', error);
    return [];
  }
  return (data || []).map(circuit => ({
    id: circuit.id,
    standId: circuit.standId,
    name: circuit.name,
    isOccupied: circuit.isOccupied,
    isActive: circuit.isActive,
    userId: circuit.userId,
    taskNumber: circuit.taskNumber,
  }));
}

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*').order('name');
  if (error) {
    console.error('Ошибка получения пользователей:', error);
    return [];
  }
  return (data || []).map(user => ({
    id: user.id,
    name: user.name,
  }));
}

export async function toggleStand(standId: string) {
  const { data: stand } = await supabase.from('stands').select('isActive').eq('id', standId).single();
  if (!stand) return;

  const newIsActive = !stand.isActive;
  
  await supabase
    .from('stands')
    .update({ isActive: newIsActive })
    .eq('id', standId);

  // If deactivating the stand, reset task numbers for all circuits
  if (!newIsActive) {
    await supabase
      .from('circuits')
      .update({ taskNumber: null })
      .eq('standId', standId);
  }
}

export async function toggleCircuit(circuitId: string) {
  const { data: circuit, error: fetchError } = await supabase.from('circuits').select('*').eq('id', circuitId).single();
  if (fetchError) {
    console.error('Ошибка получения контура:', fetchError);
    return;
  }
  if (!circuit) return;

  const newIsOccupied = !circuit.isOccupied;
  // Если освобождаем контур, очищаем userId и taskNumber
  const userId = newIsOccupied ? circuit.userId : null;
  const taskNumber = newIsOccupied ? circuit.taskNumber : null;

  const { error: updateError } = await supabase
    .from('circuits')
    .update({ 
      isOccupied: newIsOccupied,
      userId,
      taskNumber
    })
    .eq('id', circuitId);

  if (updateError) {
    console.error('Ошибка обновления контура:', updateError);
    throw updateError;
  }
}

export async function toggleCircuitActive(circuitId: string) {
  const { data: circuit } = await supabase.from('circuits').select('isActive').eq('id', circuitId).single();
  if (!circuit) return;

  await supabase
    .from('circuits')
    .update({ isActive: !circuit.isActive })
    .eq('id', circuitId);
}

export async function assignUserToCircuit(circuitId: string, userId: string | null) {
  await supabase
    .from('circuits')
    .update({ 
      isOccupied: userId !== null,
      userId 
    })
    .eq('id', circuitId);
}

export async function updateCircuitTaskNumber(circuitId: string, taskNumber: string | null) {
  const taskNumberValue = taskNumber && taskNumber.trim() !== '' ? taskNumber.trim() : null;
  await supabase
    .from('circuits')
    .update({ taskNumber: taskNumberValue })
    .eq('id', circuitId);
}

export async function addUser(name: string): Promise<string | null> {
  if (!name || name.trim() === '') return null;
  
  const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const { error } = await supabase.from('users').insert({ id, name: name.trim() });
  if (error) {
    console.error('Ошибка добавления пользователя:', error);
    return null;
  }
  return id;
}

export async function deleteUser(userId: string) {
  // Remove user from all circuits
  await supabase
    .from('circuits')
    .update({ isOccupied: false, userId: null })
    .eq('userId', userId);
  
  // Delete the user
  await supabase.from('users').delete().eq('id', userId);
}

export async function getCircuitById(circuitId: string): Promise<Circuit | null> {
  const { data, error } = await supabase
    .from('circuits')
    .select('*')
    .eq('id', circuitId)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    standId: data.standId,
    name: data.name,
    isOccupied: data.isOccupied,
    isActive: data.isActive,
    userId: data.userId,
    taskNumber: data.taskNumber,
  };
}

export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    name: data.name,
  };
}

