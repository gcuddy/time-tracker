import { useStore } from '@livestore/react'
import type React from 'react'

import { uiState$ } from '../livestore/queries.ts'
import { events } from '../livestore/schema.ts'

export const Header: React.FC = () => {
  const { store } = useStore()
  const { newTodoText } = store.useQuery(uiState$)

  const updatedNewTodoText = (text: string) => store.commit(events.uiStateSet({ newTodoText: text }))

  const todoCreated = () =>
    store.commit(
      events.todoCreated({ id: crypto.randomUUID(), text: newTodoText }),
      events.uiStateSet({ newTodoText: '' }),
    )

  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-neutral-800 mb-4">TodoMVC</h1>
      <input
        className="w-full px-4 py-3 text-lg border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-neutral-400"
        placeholder="What needs to be done?"
        value={newTodoText}
        onChange={(e) => updatedNewTodoText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            todoCreated()
          }
        }}
      />
    </header>
  )
}
