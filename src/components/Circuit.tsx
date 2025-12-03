import { useState, useEffect } from 'react';
import type { Circuit } from '../db/database';
import { getUserById } from '../db/database';

interface CircuitProps {
  circuit: Circuit;
  onToggle: (circuitId: string) => void;
  onTaskNumberChange: (circuitId: string, taskNumber: string | null) => void;
  onDrop: (circuitId: string, userId: string | null) => void;
  disabled?: boolean;
}

export default function CircuitComponent({ circuit, onToggle, onTaskNumberChange, onDrop, disabled = false }: CircuitProps) {
  const user = circuit.userId ? getUserById(circuit.userId) : null;
  const isOccupied = circuit.isOccupied;
  const isActive = circuit.isActive;
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskNumber, setTaskNumber] = useState(circuit.taskNumber || '');

  // Update local state when circuit.taskNumber changes
  useEffect(() => {
    if (!isEditingTask) {
      setTaskNumber(circuit.taskNumber || '');
    }
  }, [circuit.taskNumber, isEditingTask]);

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled || !isActive) return;
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent) => {
    if (disabled || !isActive) return;
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const userId = e.dataTransfer.getData('userId');
    if (userId) {
      onDrop(circuit.id, userId);
    }
  };

  const handleOccupiedToggleClick = (e: React.MouseEvent) => {
    if (disabled || !isActive) return;
    e.stopPropagation();
    onToggle(circuit.id);
  };

  const handleOccupiedToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !isActive) return;
    e.stopPropagation();
    onToggle(circuit.id);
  };

  const handleTaskNumberClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTask(true);
    setTaskNumber(circuit.taskNumber || '');
  };

  const handleTaskNumberBlur = () => {
    setIsEditingTask(false);
    onTaskNumberChange(circuit.id, taskNumber.trim() || null);
  };

  const handleTaskNumberKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditingTask(false);
      onTaskNumberChange(circuit.id, taskNumber.trim() || null);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditingTask(false);
      setTaskNumber(circuit.taskNumber || '');
    }
  };

  return (
    <div
      className={`circuit ${isOccupied ? 'occupied' : 'free'} ${!isActive ? 'inactive' : ''} ${disabled ? 'disabled' : ''}`}
      onDragOver={disabled || !isActive ? undefined : handleDragOver}
      onDragLeave={disabled || !isActive ? undefined : handleDragLeave}
      onDrop={disabled || !isActive ? undefined : handleDrop}
    >
      <div className="circuit-status-indicator"></div>
      <div className="circuit-name">{circuit.name}</div>
      <div className="circuit-task-number" onClick={handleTaskNumberClick}>
        {isEditingTask ? (
          <input
            type="text"
            className="circuit-task-input"
            value={taskNumber}
            onChange={(e) => setTaskNumber(e.target.value)}
            onBlur={handleTaskNumberBlur}
            onKeyDown={handleTaskNumberKeyDown}
            placeholder="№ задачи"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="circuit-task-display">
            {circuit.taskNumber || '№ задачи'}
          </span>
        )}
      </div>
      {user && (
        <div className="circuit-user">
          {user.name}
        </div>
      )}
      <label className="circuit-toggle-switch" onClick={handleOccupiedToggleClick}>
        <input
          type="checkbox"
          checked={isOccupied}
          onChange={handleOccupiedToggleChange}
          disabled={disabled || !isActive}
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
}

