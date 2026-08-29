import { useEffect, useState } from 'react'
import ColorPalette from './ColorPalette.jsx'
import TypeEditor from './TypeEditor.jsx'
import DesignExport from './DesignExport.jsx'

const STORAGE_KEY = 'juhao-design-tools'

function loadOn() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== '0'
  } catch {
    return true
  }
}

export default function DesignTools() {
  const [on, setOn] = useState(loadOn)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, on ? '1' : '0')
  }, [on])

  return (
    <>
      <button
        type="button"
        className={`design-toggle ${on ? 'on' : ''}`}
        aria-pressed={on}
        onClick={() => setOn((value) => !value)}
      >
        <span className="design-toggle-track">
          <span className="design-toggle-knob" />
        </span>
        {on ? '設計開' : '設計關'}
      </button>
      {on && (
        <>
          <DesignExport />
          <ColorPalette />
          <TypeEditor />
        </>
      )}
    </>
  )
}
