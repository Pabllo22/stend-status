import { useState } from 'react';
import type { User } from '../db/database';

interface UserListProps {
  users: User[];
  onUserAdd: (name: string) => void;
  onUserDeleted: (userId: string) => void;
}

export default function UserList({ users, onUserAdd, onUserDeleted }: UserListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  const handleDragStart = (e: React.DragEvent, userId: string) => {
    e.dataTransfer.setData('userId', userId);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewUserName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newUserName.trim();
    if (trimmedName === '') return;
    
    onUserAdd(trimmedName);
    setNewUserName('');
    setIsAdding(false);
  };

  const handleDelete = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Удалить пользователя?')) {
      onUserDeleted(userId);
    }
  };

  return (
    <div className="user-list">
      <h3 className="user-list-title">Пользователи</h3>
      <div className="users">
        {users.map(user => (
          <div
            key={user.id}
            className="user-item"
            draggable
            onDragStart={(e) => handleDragStart(e, user.id)}
            onDragEnd={handleDragEnd}
          >
            <span className="user-item-name">{user.name}</span>
            <button
              className="user-item-delete"
              onClick={(e) => handleDelete(user.id, e)}
              title="Удалить пользователя"
            >
              ×
            </button>
          </div>
        ))}
        {isAdding ? (
          <form className="user-add-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="user-add-input"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Имя пользователя"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  handleCancel();
                }
              }}
            />
            <div className="user-add-buttons">
              <button type="submit" className="user-add-submit">✓</button>
              <button type="button" className="user-add-cancel" onClick={handleCancel}>×</button>
            </div>
          </form>
        ) : (
          <button className="user-add-button" onClick={handleAddClick}>
            + Добавить пользователя
          </button>
        )}
      </div>
    </div>
  );
}

