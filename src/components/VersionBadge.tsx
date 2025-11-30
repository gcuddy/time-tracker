import { liveStoreVersion } from '@livestore/livestore'
import { useEffect } from 'react'

export const VersionBadge = () => {
  useEffect(() => {
    console.log(`LiveStore v${liveStoreVersion}`)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 rounded px-2 py-1 text-[11px] font-mono text-white z-[1000] select-none">
      v{liveStoreVersion}
    </div>
  )
}
