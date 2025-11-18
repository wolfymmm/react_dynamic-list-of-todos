import React, { useEffect, useState } from 'react';
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';

import { TodoList } from './components/TodoList';
import { TodoFilter } from './components/TodoFilter';
import { TodoModal } from './components/TodoModal';
import { Loader } from './components/Loader';

import { getTodos, getUser } from './api';
import { Todo } from './types/Todo';
import { User } from './types/User';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [status, setStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [search, setSearch] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);

  useEffect(() => {
    const loadTodos = async () => {
      setIsLoading(true);
      const response = await getTodos();
      setTodos(response);
      setFilteredTodos(response);
      setIsLoading(false);
    };
    loadTodos();
  }, []);

  useEffect(() => {
    let result = [...todos];
    if (status === 'completed') result = result.filter(todo => todo.completed);
    if (status === 'active') result = result.filter(todo => !todo.completed);
    if (search.trim()) {
      result = result.filter(todo => todo.title.toLowerCase().includes(search.toLowerCase()));
    }
    setFilteredTodos(result);
  }, [status, search, todos]);

  const openTodo = async (todo: Todo) => {
    setSelectedTodo(todo);
    setIsUserLoading(true);
    const user = await getUser(todo.userId);
    setSelectedUser(user);
    setIsUserLoading(false);
  };

  const closeModal = () => {
    setSelectedTodo(null);
    setSelectedUser(null);
  };

  return (
    <>
      <div className="section">
        <div className="container">
          <div className="box">
            <h1 className="title">Todos:</h1>

            <div className="block">
              <TodoFilter
                status={status}
                search={search}
                onStatusChange={setStatus}
                onSearchChange={setSearch}
                onClearSearch={() => setSearch('')}
              />
            </div>

            <div className="block">
              {isLoading && <Loader />}
              <TodoList
                todos={filteredTodos}
                selectedTodo={selectedTodo}
                onSelect={openTodo}
              />
            </div>
          </div>
        </div>
      </div>

      <TodoModal
        todo={selectedTodo}
        user={selectedUser}
        isOpen={!!selectedTodo}
        loading={isUserLoading}
        onClose={closeModal}
      />
    </>
  );
};
