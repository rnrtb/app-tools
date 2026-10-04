import { useMemo } from 'react'
import { validateProjectLight } from '../lib/validation/validate'
import type { StampProject } from '../types/stamp'

export function useCanCreateZip(project: StampProject): boolean {
  return useMemo(() => validateProjectLight(project).canCreateZip, [project])
}
