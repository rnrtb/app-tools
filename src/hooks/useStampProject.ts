import { useCallback, useEffect, useRef, useState } from 'react'
import { getStampSpec } from '../config/stampSpecs'
import {
  createEmptyProject,
  createStampFromFile,
  createUploadSpecialFromFile,
  fromPersistedProject,
  revokeProjectUrls,
  revokeSpecialImage,
  revokeStampItem,
  specialFromStamp,
  toPersistedProject,
} from '../lib/project/factory'
import { clearProject, loadProject, saveProject } from '../lib/storage/db'
import { toUserFriendlyError } from '../lib/utils/errors'
import type {
  PreviewBackground,
  SpecialImageState,
  StampImageItem,
  StampProject,
  TransformState,
} from '../types/stamp'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface UndoState {
  item: StampImageItem
  index: number
}

export function useStampProject() {
  const [project, setProject] = useState<StampProject>(() => createEmptyProject())
  const [ready, setReady] = useState(false)
  const [restoreAvailable, setRestoreAvailable] = useState(false)
  const [pendingRestore, setPendingRestore] = useState<StampProject | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [undo, setUndo] = useState<UndoState | null>(null)
  const saveTimer = useRef<number | null>(null)
  const skipNextSave = useRef(true)
  const projectRef = useRef(project)
  const pendingRestoreRef = useRef<StampProject | null>(null)

  useEffect(() => {
    projectRef.current = project
  }, [project])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const saved = await loadProject()
        if (cancelled) return
        if (saved && saved.stamps.length > 0) {
          const restored = fromPersistedProject(saved)
          pendingRestoreRef.current = restored
          setPendingRestore(restored)
          setRestoreAvailable(true)
        }
      } catch {
        // 復元失敗時は新規として続行
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return () => {
      revokeProjectUrls(projectRef.current)
      if (pendingRestoreRef.current) {
        revokeProjectUrls(pendingRestoreRef.current)
      }
    }
  }, [])

  const persist = useCallback(async (next: StampProject) => {
    setSaveStatus('saving')
    setSaveError(null)
    try {
      await saveProject(toPersistedProject(next))
      setSaveStatus('saved')
    } catch (error) {
      setSaveStatus('error')
      setSaveError(toUserFriendlyError(error))
    }
  }, [])

  useEffect(() => {
    if (!ready || restoreAvailable) return
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      void persist(project)
    }, 500)
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    }
  }, [project, ready, restoreAvailable, persist])

  const updateProject = useCallback((updater: (prev: StampProject) => StampProject) => {
    setProject((prev) => {
      const next = updater(prev)
      return { ...next, updatedAt: Date.now() }
    })
  }, [])

  const continueRestore = useCallback(() => {
    if (!pendingRestore) return
    setProject(pendingRestore)
    pendingRestoreRef.current = null
    setPendingRestore(null)
    setRestoreAvailable(false)
    skipNextSave.current = true
    setSaveStatus('saved')
  }, [pendingRestore])

  const startFresh = useCallback(async () => {
    if (!window.confirm('保存されている作業データを削除して新しく作りますか？')) {
      return
    }
    if (pendingRestore) {
      revokeProjectUrls(pendingRestore)
      pendingRestoreRef.current = null
      setPendingRestore(null)
    }
    revokeProjectUrls(projectRef.current)
    try {
      await clearProject()
    } catch {
      // ignore
    }
    setProject(createEmptyProject())
    setRestoreAvailable(false)
    skipNextSave.current = true
    setSaveStatus('idle')
  }, [pendingRestore])

  const ensureMainTabDefaults = useCallback((stamps: StampImageItem[], main: SpecialImageState, tab: SpecialImageState) => {
    const spec = getStampSpec()
    let nextMain = main
    let nextTab = tab
    const first = stamps[0]

    if (first) {
      if (!main.stampId && main.source === 'stamp' && !main.workingBlob) {
        nextMain = specialFromStamp(first, spec.mainSize, 8)
      } else if (main.source === 'stamp' && main.stampId && !stamps.some((s) => s.id === main.stampId)) {
        nextMain = specialFromStamp(first, spec.mainSize, 8)
      }

      if (!tab.stampId && tab.source === 'stamp' && !tab.workingBlob) {
        nextTab = specialFromStamp(first, spec.tabSize, 4)
      } else if (tab.source === 'stamp' && tab.stampId && !stamps.some((s) => s.id === tab.stampId)) {
        nextTab = specialFromStamp(first, spec.tabSize, 4)
      }
    } else {
      if (main.source === 'stamp') nextMain = { ...main, stampId: null, width: 0, height: 0 }
      if (tab.source === 'stamp') nextTab = { ...tab, stampId: null, width: 0, height: 0 }
    }

    return { main: nextMain, tab: nextTab }
  }, [])

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      setActionError(null)
      const list = Array.from(files)
      if (!list.length) return

      const created: StampImageItem[] = []
      const errors: string[] = []

      for (const file of list) {
        try {
          created.push(await createStampFromFile(file))
        } catch (error) {
          errors.push(`${file.name}: ${toUserFriendlyError(error)}`)
        }
      }

      if (created.length) {
        updateProject((prev) => {
          const stamps = [...prev.stamps, ...created]
          const { main, tab } = ensureMainTabDefaults(stamps, prev.main, prev.tab)
          return { ...prev, stamps, main, tab }
        })
      }

      if (errors.length) {
        setActionError(errors.slice(0, 3).join('\n'))
      }
    },
    [ensureMainTabDefaults, updateProject],
  )

  const replaceStamp = useCallback(
    async (id: string, file: File) => {
      setActionError(null)
      try {
        const nextItem = await createStampFromFile(file)
        const spec = getStampSpec()
        updateProject((prev) => {
          const old = prev.stamps.find((s) => s.id === id)
          if (old) revokeStampItem(old)
          const replaced = { ...nextItem, id }
          const stamps = prev.stamps.map((s) => (s.id === id ? replaced : s))

          let main = prev.main
          let tab = prev.tab
          if (main.source === 'stamp' && main.stampId === id) {
            main = specialFromStamp(replaced, spec.mainSize, 8)
          }
          if (tab.source === 'stamp' && tab.stampId === id) {
            tab = specialFromStamp(replaced, spec.tabSize, 4)
          }

          return { ...prev, stamps, main, tab }
        })
      } catch (error) {
        setActionError(toUserFriendlyError(error))
      }
    },
    [updateProject],
  )

  const removeStamp = useCallback(
    (id: string) => {
      updateProject((prev) => {
        const index = prev.stamps.findIndex((s) => s.id === id)
        if (index < 0) return prev
        const item = prev.stamps[index]!
        setUndo({ item, index })
        window.setTimeout(() => {
          setUndo((current) => {
            if (current?.item.id === item.id) {
              revokeStampItem(item)
              return null
            }
            return current
          })
        }, 5000)

        const stamps = prev.stamps.filter((s) => s.id !== id)
        const { main, tab } = ensureMainTabDefaults(stamps, prev.main, prev.tab)
        return { ...prev, stamps, main, tab }
      })
    },
    [ensureMainTabDefaults, updateProject],
  )

  const undoRemove = useCallback(() => {
    if (!undo) return
    updateProject((prev) => {
      const stamps = [...prev.stamps]
      stamps.splice(undo.index, 0, undo.item)
      const { main, tab } = ensureMainTabDefaults(stamps, prev.main, prev.tab)
      return { ...prev, stamps, main, tab }
    })
    setUndo(null)
  }, [undo, ensureMainTabDefaults, updateProject])

  const reorderStamps = useCallback(
    (activeId: string, overId: string) => {
      if (activeId === overId) return
      updateProject((prev) => {
        const oldIndex = prev.stamps.findIndex((s) => s.id === activeId)
        const newIndex = prev.stamps.findIndex((s) => s.id === overId)
        if (oldIndex < 0 || newIndex < 0) return prev
        const stamps = [...prev.stamps]
        const [moved] = stamps.splice(oldIndex, 1)
        stamps.splice(newIndex, 0, moved!)
        return { ...prev, stamps }
      })
    },
    [updateProject],
  )

  const updateStampTransform = useCallback(
    (id: string, transform: TransformState) => {
      updateProject((prev) => ({
        ...prev,
        stamps: prev.stamps.map((s) => (s.id === id ? { ...s, transform } : s)),
      }))
    },
    [updateProject],
  )

  const setPreviewBackground = useCallback(
    (previewBackground: PreviewBackground) => {
      updateProject((prev) => ({ ...prev, previewBackground }))
    },
    [updateProject],
  )

  const setZipName = useCallback(
    (zipName: string) => {
      updateProject((prev) => ({ ...prev, zipName }))
    },
    [updateProject],
  )

  const selectMainFromStamp = useCallback(
    (stampId: string) => {
      const spec = getStampSpec()
      updateProject((prev) => {
        const stamp = prev.stamps.find((s) => s.id === stampId)
        if (!stamp) return prev
        if (prev.main.source === 'upload') revokeSpecialImage(prev.main)
        return {
          ...prev,
          main: specialFromStamp(stamp, spec.mainSize, 8),
        }
      })
    },
    [updateProject],
  )

  const selectTabFromStamp = useCallback(
    (stampId: string) => {
      const spec = getStampSpec()
      updateProject((prev) => {
        const stamp = prev.stamps.find((s) => s.id === stampId)
        if (!stamp) return prev
        if (prev.tab.source === 'upload') revokeSpecialImage(prev.tab)
        return {
          ...prev,
          tab: specialFromStamp(stamp, spec.tabSize, 4),
        }
      })
    },
    [updateProject],
  )

  const uploadMain = useCallback(
    async (file: File) => {
      setActionError(null)
      try {
        const spec = getStampSpec()
        const uploaded = await createUploadSpecialFromFile(file, spec.mainSize, 8)
        updateProject((prev) => {
          if (prev.main.source === 'upload') revokeSpecialImage(prev.main)
          return {
            ...prev,
            main: {
              source: 'upload',
              stampId: null,
              ...uploaded,
            },
          }
        })
      } catch (error) {
        setActionError(toUserFriendlyError(error))
      }
    },
    [updateProject],
  )

  const uploadTab = useCallback(
    async (file: File) => {
      setActionError(null)
      try {
        const spec = getStampSpec()
        const uploaded = await createUploadSpecialFromFile(file, spec.tabSize, 4)
        updateProject((prev) => {
          if (prev.tab.source === 'upload') revokeSpecialImage(prev.tab)
          return {
            ...prev,
            tab: {
              source: 'upload',
              stampId: null,
              ...uploaded,
            },
          }
        })
      } catch (error) {
        setActionError(toUserFriendlyError(error))
      }
    },
    [updateProject],
  )

  const updateMainTransform = useCallback(
    (transform: TransformState) => {
      updateProject((prev) => ({
        ...prev,
        main: { ...prev.main, transform },
      }))
    },
    [updateProject],
  )

  const updateTabTransform = useCallback(
    (transform: TransformState) => {
      updateProject((prev) => ({
        ...prev,
        tab: { ...prev.tab, transform },
      }))
    },
    [updateProject],
  )

  return {
    project,
    ready,
    restoreAvailable,
    continueRestore,
    startFresh,
    saveStatus,
    saveError,
    actionError,
    setActionError,
    undo,
    undoRemove,
    addFiles,
    replaceStamp,
    removeStamp,
    reorderStamps,
    updateStampTransform,
    setPreviewBackground,
    setZipName,
    selectMainFromStamp,
    selectTabFromStamp,
    uploadMain,
    uploadTab,
    updateMainTransform,
    updateTabTransform,
  }
}
