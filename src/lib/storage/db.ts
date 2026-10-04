import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { PersistedProject } from '../../types/stamp'

interface StampMakerDB extends DBSchema {
  project: {
    key: string
    value: PersistedProject
  }
}

const DB_NAME = 'line-stamp-maker'
const DB_VERSION = 1
const PROJECT_KEY = 'current'

let dbPromise: Promise<IDBPDatabase<StampMakerDB>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<StampMakerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('project')) {
          db.createObjectStore('project')
        }
      },
    })
  }
  return dbPromise
}

export async function saveProject(project: PersistedProject): Promise<void> {
  const db = await getDb()
  await db.put('project', project, PROJECT_KEY)
}

export async function loadProject(): Promise<PersistedProject | null> {
  const db = await getDb()
  return (await db.get('project', PROJECT_KEY)) ?? null
}

export async function clearProject(): Promise<void> {
  const db = await getDb()
  await db.delete('project', PROJECT_KEY)
}

export async function hasSavedProject(): Promise<boolean> {
  const project = await loadProject()
  return Boolean(project && project.stamps.length > 0)
}
