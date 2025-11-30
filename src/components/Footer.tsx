import { queryDb } from '@livestore/livestore'
import { useStore } from '@livestore/react'
import type React from 'react'

import { uiState$ } from '../livestore/queries.ts'
import { events, tables } from '../livestore/schema.ts'

const incompleteCount$ = queryDb(tables.todos.count().where({ completed: false, deletedAt: null }), {
  label: 'incompleteCount',
})

export const Footer: React.FC = () => {
  const { store } = useStore()
  const { filter } = store.useQuery(uiState$)
  const incompleteCount = store.useQuery(incompleteCount$)
  const setFilter = (filter: (typeof tables.uiState.Value)['filter']) => store.commit(events.uiStateSet({ filter }))

  return (
    <footer className="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-between text-sm">
      <span className="text-neutral-600">{incompleteCount} items left</span>
      <ul className="flex gap-2">
        <li>
          <button
            type="button"
            className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`px-3 py-1 rounded ${filter === 'active' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`px-3 py-1 rounded ${filter === 'completed' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </li>
      </ul>
      <button
        type="button"
        className="text-red-600 hover:text-red-700 hover:underline"
        onClick={() => store.commit(events.todoClearedCompleted({ deletedAt: new Date() }))}
      >
        Clear completed
      </button>
    </footer>
  )
}
