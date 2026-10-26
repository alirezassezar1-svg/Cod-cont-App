/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SampleProject } from '../types';

export const SAMPLE_PROJECTS: SampleProject[] = [
  {
    id: 'react-cart-auth',
    name: 'React TS: Shopping Cart & Auth',
    tagline: '5 Files · Context API + Custom Hooks + Types',
    sourceStack: 'react',
    targetStack: 'vue',
    description: 'A multi-file React application with Context state, custom persistence hooks, typed interfaces, and shared UI components.',
    files: [
      {
        id: 'f1',
        path: 'src/types/cart.ts',
        language: 'typescript',
        content: `export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inventory: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  user: { name: string; email: string } | null;
}
`,
      },
      {
        id: 'f2',
        path: 'src/hooks/useLocalStorage.ts',
        language: 'typescript',
        content: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (err) {
      console.error('LocalStorage write error', err);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
`,
      },
      {
        id: 'f3',
        path: 'src/context/CartContext.tsx',
        language: 'typescript',
        content: `import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product, CartItem, CartState } from '../types/cart';

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalPrice: number;
  totalCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>('cart_items', []);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => setItems([]);

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalPrice, totalCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
`,
      },
      {
        id: 'f4',
        path: 'src/components/ProductCard.tsx',
        language: 'typescript',
        content: `import React from 'react';
import { Product } from '../types/cart';
import { useCart } from '../context/CartContext';

interface Props {
  product: Product;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white flex flex-col justify-between">
      <div>
        <span className="text-xs text-slate-500 uppercase tracking-wider">{product.category}</span>
        <h3 className="font-semibold text-slate-900 mt-1">{product.name}</h3>
        <p className="text-emerald-600 font-bold mt-2">\${product.price.toFixed(2)}</p>
      </div>
      <button
        onClick={() => addToCart(product)}
        className="mt-4 px-3 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 text-sm font-medium transition-colors"
      >
        Add to Bag
      </button>
    </div>
  );
};
`,
      },
      {
        id: 'f5',
        path: 'src/App.tsx',
        language: 'typescript',
        content: `import React from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { ProductCard } from './components/ProductCard';
import { Product } from './types/cart';

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Ergonomic Mechanical Keyboard', price: 149.99, category: 'Hardware', inventory: 12 },
  { id: '2', name: 'USB-C Studio Microphone', price: 99.50, category: 'Audio', inventory: 8 },
  { id: '3', name: 'Precision Optical Mouse', price: 59.00, category: 'Peripherals', inventory: 15 },
];

function Header() {
  const { totalCount, totalPrice } = useCart();
  return (
    <header className="border-b border-slate-200 p-4 flex justify-between items-center bg-white">
      <h1 className="text-xl font-bold text-slate-900">Developer Outfitters</h1>
      <div className="text-sm font-medium text-slate-700">
        Items: <span className="font-bold">{totalCount}</span> · Total: <span className="font-bold">\${totalPrice.toFixed(2)}</span>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-5xl mx-auto p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Featured Equipment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_PRODUCTS.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </main>
      </div>
    </CartProvider>
  );
}
`,
      },
    ],
  },
  {
    id: 'vue-pinia-tasks',
    name: 'Vue 3: Pinia Task Manager',
    tagline: '4 Files · Pinia Store + Composables + SFC',
    sourceStack: 'vue',
    targetStack: 'react',
    description: 'Vue 3 Composition API project with Pinia state management, search filters composable, and single-file components.',
    files: [
      {
        id: 'v1',
        path: 'src/stores/tasks.ts',
        language: 'typescript',
        content: `import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([
    { id: '1', title: 'Implement AST Parser', completed: true, priority: 'high' },
    { id: '2', title: 'Write Vite middleware', completed: false, priority: 'medium' },
    { id: '3', title: 'Design monorepo layout', completed: false, priority: 'high' },
  ]);

  const completedCount = computed(() => tasks.value.filter((t) => t.completed).length);
  const pendingCount = computed(() => tasks.value.filter((t) => !t.completed).length);

  function addTask(title: string, priority: Task['priority'] = 'medium') {
    tasks.value.push({
      id: Date.now().toString(),
      title,
      completed: false,
      priority,
    });
  }

  function toggleTask(id: string) {
    const target = tasks.value.find((t) => t.id === id);
    if (target) {
      target.completed = !target.completed;
    }
  }

  function deleteTask(id: string) {
    tasks.value = tasks.value.filter((t) => t.id !== id);
  }

  return { tasks, completedCount, pendingCount, addTask, toggleTask, deleteTask };
});
`,
      },
      {
        id: 'v2',
        path: 'src/composables/useFilter.ts',
        language: 'typescript',
        content: `import { ref, computed, Ref } from 'vue';
import { Task } from '../stores/tasks';

export function useTaskFilter(tasks: Ref<Task[]>) {
  const query = ref('');
  const statusFilter = ref<'all' | 'active' | 'completed'>('all');

  const filteredTasks = computed(() => {
    return tasks.value.filter((task) => {
      const matchesQuery = task.title.toLowerCase().includes(query.value.toLowerCase());
      if (statusFilter.value === 'active') return matchesQuery && !task.completed;
      if (statusFilter.value === 'completed') return matchesQuery && task.completed;
      return matchesQuery;
    });
  });

  return { query, statusFilter, filteredTasks };
}
`,
      },
      {
        id: 'v3',
        path: 'src/components/TaskCard.vue',
        language: 'html',
        content: `<script setup lang="ts">
import { Task } from '../stores/tasks';

defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  (e: 'toggle', id: string): void;
  (e: 'remove', id: string): void;
}>();
<\/script>

<template>
  <div class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md">
    <div class="flex items-center gap-3">
      <input
        type="checkbox"
        :checked="task.completed"
        @change="emit('toggle', task.id)"
        class="h-4 w-4 rounded border-slate-300"
      />
      <span :class="{'line-through text-slate-400': task.completed, 'text-slate-800': !task.completed}">
        {{ task.title }}
      </span>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
        {{ task.priority }}
      </span>
      <button @click="emit('remove', task.id)" class="text-rose-500 hover:text-rose-700 text-sm">
        Delete
      </button>
    </div>
  </div>
</template>
`,
      },
      {
        id: 'v4',
        path: 'src/App.vue',
        language: 'html',
        content: `<script setup lang="ts">
import { ref } from 'vue';
import { useTaskStore } from './stores/tasks';
import { useTaskFilter } from './composables/useFilter';
import TaskCard from './components/TaskCard.vue';

const store = useTaskStore();
const { query, statusFilter, filteredTasks } = useTaskFilter(ref(store.tasks));
const newTitle = ref('');

function handleSubmit() {
  if (!newTitle.value.trim()) return;
  store.addTask(newTitle.value.trim());
  newTitle.value = '';
}
<\/script>

<template>
  <main class="max-w-2xl mx-auto p-6 font-sans">
    <header class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-slate-900">Sprint Tasks</h1>
      <div class="text-sm text-slate-500">
        {{ store.completedCount }} done / {{ store.tasks.length }} total
      </div>
    </header>

    <form @submit.prevent="handleSubmit" class="flex gap-2 mb-4">
      <input
        v-model="newTitle"
        placeholder="Add task title..."
        class="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
      />
      <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium">
        Add
      </button>
    </form>

    <div class="flex gap-2 mb-4">
      <input
        v-model="query"
        placeholder="Search tasks..."
        class="border border-slate-200 rounded px-3 py-1.5 text-xs flex-1"
      />
      <select v-model="statusFilter" class="border border-slate-200 rounded px-2 py-1.5 text-xs">
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>
    </div>

    <div class="space-y-2">
      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        @toggle="store.toggleTask"
        @remove="store.deleteTask"
      />
    </div>
  </main>
</template>
`,
      },
    ],
  },
  {
    id: 'laravel-blade-dashboard',
    name: 'Laravel Blade: Server Dashboard',
    tagline: '4 Files · Blade Layouts + Components + Web Routes',
    sourceStack: 'laravel-blade',
    targetStack: 'laravel-inertia-react',
    description: 'Traditional Laravel Blade application with layouts, component directives, and controllers to be transformed into React + Inertia.js.',
    files: [
      {
        id: 'l1',
        path: 'resources/views/layouts/app.blade.php',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>@yield('title', 'Cloud Console')</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-900">
    <nav class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span class="font-bold text-lg">Acme Cloud</span>
        <div class="text-sm text-gray-600">Logged in as {{ Auth::user()->name ?? 'Administrator' }}</div>
    </nav>
    <main class="max-w-6xl mx-auto py-6 px-4">
        @yield('content')
    </main>
</body>
</html>
`,
      },
      {
        id: 'l2',
        path: 'resources/views/components/stat-card.blade.php',
        language: 'html',
        content: `@props(['title', 'value', 'change', 'isPositive' => true])

<div class="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
    <span class="text-xs uppercase font-medium text-gray-500 tracking-wider">{{ $title }}</span>
    <div class="text-2xl font-bold text-gray-900 mt-2">{{ $value }}</div>
    <div class="mt-2 text-xs flex items-center {{ $isPositive ? 'text-green-600' : 'text-red-600' }}">
        <span>{{ $change }} vs last month</span>
    </div>
</div>
`,
      },
      {
        id: 'l3',
        path: 'resources/views/dashboard.blade.php',
        language: 'html',
        content: `@extends('layouts.app')

@section('title', 'Server Analytics')

@section('content')
<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">Infrastructure Overview</h1>
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
            Deploy Instance
        </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <x-stat-card title="Active Nodes" value="{{ $stats['nodes'] }}" change="+12%" :isPositive="true" />
        <x-stat-card title="CPU Utilization" value="{{ $stats['cpu'] }}%" change="-3.4%" :isPositive="true" />
        <x-stat-card title="Monthly Billing" value="\${{ number_format($stats['billing'], 2) }}" change="+8.1%" :isPositive="false" />
    </div>

    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 font-semibold text-gray-800">Cluster Nodes</div>
        <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-500 text-xs">
                <tr>
                    <th class="px-5 py-3">Host</th>
                    <th class="px-5 py-3">Region</th>
                    <th class="px-5 py-3">Status</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                @foreach ($nodes as $node)
                <tr>
                    <td class="px-5 py-3 font-medium">{{ $node['hostname'] }}</td>
                    <td class="px-5 py-3 text-gray-500">{{ $node['region'] }}</td>
                    <td class="px-5 py-3"><span class="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">Healthy</span></td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>
@endsection
`,
      },
      {
        id: 'l4',
        path: 'routes/web.php',
        language: 'php',
        content: `<?php

use Illuminate\\Support\\Facades\\Route;

Route::get('/dashboard', function () {
    return view('dashboard', [
        'stats' => [
            'nodes' => 24,
            'cpu' => 41.8,
            'billing' => 12450.00,
        ],
        'nodes' => [
            ['hostname' => 'us-east-worker-01', 'region' => 'us-east-1', 'status' => 'healthy'],
            ['hostname' => 'eu-west-worker-04', 'region' => 'eu-west-1', 'status' => 'healthy'],
        ]
    ]);
});
`,
      },
    ],
  },
  {
    id: 'react-class-legacy',
    name: 'Class Components: Legacy Migration',
    tagline: '3 Files · React.Component + Lifecycle Methods',
    sourceStack: 'class-components',
    targetStack: 'react',
    description: 'Transform legacy class components using componentDidMount, getDerivedStateFromProps, and this.setState into modern React 19 functional hooks.',
    files: [
      {
        id: 'c1',
        path: 'src/UserProfile.jsx',
        language: 'javascript',
        content: `import React, { Component } from 'react';

export class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      displayName: props.initialName,
      saveCount: 0,
    };
    this.handleToggleEdit = this.handleToggleEdit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.initialName !== this.props.initialName) {
      this.setState({ displayName: this.props.initialName });
    }
  }

  handleToggleEdit() {
    this.setState((prev) => ({ isEditing: !prev.isEditing }));
  }

  handleChange(e) {
    this.setState({ displayName: e.target.value });
  }

  handleSave() {
    this.props.onSave(this.state.displayName);
    this.setState((prev) => ({ isEditing: false, saveCount: prev.saveCount + 1 }));
  }

  render() {
    const { isEditing, displayName, saveCount } = this.state;
    return (
      <div className="border border-slate-200 p-4 rounded bg-white">
        {isEditing ? (
          <div className="flex gap-2">
            <input value={displayName} onChange={this.handleChange} className="border p-1 rounded text-sm" />
            <button onClick={this.handleSave} className="bg-emerald-600 text-white px-3 py-1 rounded text-xs">Save</button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-800">{displayName}</span>
            <button onClick={this.handleToggleEdit} className="text-blue-600 text-xs">Edit</button>
          </div>
        )}
        <div className="text-xs text-slate-400 mt-2">Saved {saveCount} times</div>
      </div>
    );
  }
}
`,
      },
      {
        id: 'c2',
        path: 'src/Clock.jsx',
        language: 'javascript',
        content: `import React, { Component } from 'react';

export class Clock extends Component {
  constructor(props) {
    super(props);
    this.state = { time: new Date() };
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({ time: new Date() });
  }

  render() {
    return (
      <div className="font-mono text-lg font-bold text-slate-800">
        {this.state.time.toLocaleTimeString()}
      </div>
    );
  }
}
`,
      },
      {
        id: 'c3',
        path: 'src/DataFetcher.jsx',
        language: 'javascript',
        content: `import React, { Component } from 'react';

export class DataFetcher extends Component {
  state = {
    data: null,
    loading: true,
    error: null,
  };

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.endpoint !== this.props.endpoint) {
      this.fetchData();
    }
  }

  async fetchData() {
    this.setState({ loading: true, error: null });
    try {
      const res = await fetch(this.props.endpoint);
      const data = await res.json();
      this.setState({ data, loading: false });
    } catch (err) {
      this.setState({ error: err.message, loading: false });
    }
  }

  render() {
    const { data, loading, error } = this.state;
    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;
    return <pre className="text-xs bg-slate-100 p-2 rounded">{JSON.stringify(data, null, 2)}</pre>;
  }
}
`,
      },
    ],
  },
  {
    id: 'css-to-tailwind',
    name: 'CSS Modules to Tailwind CSS v4',
    tagline: '3 Files · Raw CSS Stylesheets + Markup',
    sourceStack: 'css',
    targetStack: 'tailwind',
    description: 'Convert raw BEM/custom CSS stylesheets with flexbox, grid, hover states, and responsive queries directly into clean utility classes in JSX.',
    files: [
      {
        id: 's1',
        path: 'src/styles/card.css',
        language: 'css',
        content: `.pricing-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 32px 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.pricing-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.pricing-card__price {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0284c7;
  margin: 16px 0;
}
`,
      },
      {
        id: 's2',
        path: 'src/styles/buttons.css',
        language: 'css',
        content: `.btn-primary {
  background-color: #0284c7;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.btn-primary:hover {
  background-color: #0369a1;
}

.btn-outline {
  background-color: transparent;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
}
`,
      },
      {
        id: 's3',
        path: 'src/components/PricingCard.jsx',
        language: 'javascript',
        content: `import React from 'react';
import '../styles/card.css';
import '../styles/buttons.css';

export function PricingCard({ plan, price, features }) {
  return (
    <div className="pricing-card">
      <h3 className="pricing-card__title">{plan}</h3>
      <div className="pricing-card__price">\${price}<span style={{ fontSize: '0.875rem', color: '#64748b' }}>/mo</span></div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0', flex: 1 }}>
        {features.map((f, i) => (
          <li key={i} style={{ padding: '6px 0', color: '#334155', fontSize: '0.875rem' }}>✓ {f}</li>
        ))}
      </ul>
      <button className="btn-primary">Choose {plan}</button>
    </div>
  );
}
`,
      },
    ],
  },
  {
    id: 'react-to-svelte5',
    name: 'React TS to Svelte 5 (Runes)',
    tagline: '3 Files · React Hooks to $state, $derived, $effect',
    sourceStack: 'react',
    targetStack: 'svelte',
    description: 'Transform React useState, useMemo, and useEffect directly into modern Svelte 5 runes with typed interfaces.',
    files: [
      {
        id: 'sve1',
        path: 'src/types/todo.ts',
        language: 'typescript',
        content: `export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'high';
}
`,
      },
      {
        id: 'sve2',
        path: 'src/components/TodoFilter.tsx',
        language: 'typescript',
        content: `import React, { useState, useMemo } from 'react';
import { Todo } from '../types/todo';

interface Props {
  todos: Todo[];
  onToggle: (id: string) => void;
}

export const TodoFilter: React.FC<Props> = ({ todos, onToggle }) => {
  const [filter, setFilter] = useState<'all' | 'high'>('all');

  const filtered = useMemo(() => {
    return filter === 'high' ? todos.filter((t) => t.priority === 'high') : todos;
  }, [todos, filter]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-xs">
        <button onClick={() => setFilter('all')} className="px-2 py-1 bg-slate-800 text-white rounded">All</button>
        <button onClick={() => setFilter('high')} className="px-2 py-1 bg-rose-800 text-white rounded">High Priority</button>
      </div>
      <ul className="space-y-1">
        {filtered.map((t) => (
          <li key={t.id} onClick={() => onToggle(t.id)} className="cursor-pointer text-sm">
            {t.completed ? '✓' : '○'} {t.text}
          </li>
        ))}
      </ul>
    </div>
  );
};
`,
      },
      {
        id: 'sve3',
        path: 'src/App.tsx',
        language: 'typescript',
        content: `import React, { useState, useEffect } from 'react';
import { TodoFilter } from './components/TodoFilter';
import { Todo } from './types/todo';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: 'Audit monorepo workspaces', completed: true, priority: 'high' },
    { id: '2', text: 'Migrate to Svelte 5 runes', completed: false, priority: 'high' },
    { id: '3', text: 'Setup Livewire 3 components', completed: false, priority: 'low' },
  ]);

  useEffect(() => {
    console.log('Todos updated, count:', todos.length);
  }, [todos]);

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  return (
    <main className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4">Sprint Goals</h1>
      <TodoFilter todos={todos} onToggle={toggleTodo} />
    </main>
  );
}
`,
      },
    ],
  },
  {
    id: 'blade-to-livewire',
    name: 'Laravel Blade to Livewire 3',
    tagline: '3 Files · Blade Views to Livewire PHP + Reactive View',
    sourceStack: 'laravel-blade',
    targetStack: 'livewire',
    description: 'Transform traditional Blade forms and server views into reactive Livewire 3 full-stack components with wire:model and wire:click.',
    files: [
      {
        id: 'lw1',
        path: 'resources/views/subscribers/create.blade.php',
        language: 'html',
        content: `<div class="p-6 bg-white border border-gray-200 rounded-lg">
    <h2 class="text-lg font-bold mb-4">Add Subscriber</h2>
    <form action="/subscribers" method="POST" class="space-y-4">
        <div>
            <label class="block text-xs font-medium text-gray-700">Email Address</label>
            <input type="email" name="email" class="w-full border border-gray-300 rounded p-2 text-sm" required />
        </div>
        <div>
            <label class="block text-xs font-medium text-gray-700">Plan</label>
            <select name="plan" class="w-full border border-gray-300 rounded p-2 text-sm">
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
            </select>
        </div>
        <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-semibold">
            Save Subscriber
        </button>
    </form>
</div>
`,
      },
      {
        id: 'lw2',
        path: 'resources/views/subscribers/index.blade.php',
        language: 'html',
        content: `<div class="space-y-4">
    <div class="flex justify-between items-center">
        <h1 class="text-xl font-bold">Subscribers Directory</h1>
        <input type="text" name="search" placeholder="Filter subscribers..." class="border rounded px-3 py-1 text-sm" />
    </div>
    <table class="w-full text-left text-sm border">
        <thead class="bg-gray-100">
            <tr>
                <th class="p-2">Email</th>
                <th class="p-2">Plan</th>
                <th class="p-2">Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($subscribers as $sub)
            <tr class="border-t">
                <td class="p-2">{{ $sub['email'] }}</td>
                <td class="p-2">{{ $sub['plan'] }}</td>
                <td class="p-2">
                    <button class="text-red-600 text-xs" onclick="deleteSubscriber('{{ $sub['id'] }}')">Remove</button>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
`,
      },
    ],
  },
];

