import { useEffect, useRef } from 'react'
import { Extension } from '@tiptap/core'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { EditorContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { uploadAdminImages } from '../data/adminArticles.js'
import { persistableHtml, resolveArticleHtml } from '../lib/articleHtml.js'

const DEFAULT_FONT_SIZE = '17px'
const FONT_SIZES = ['14px', '15px', '16px', '17px', '18px', '20px', '22px', '24px', '28px', '32px']
const DEFAULT_LINE_HEIGHT = '1.5'
const LINE_HEIGHTS = ['1.0', '1.15', '1.3', '1.5', '1.75', '2.0']
const FONT_FAMILIES = [
  { id: 'sans', label: '黑體 GenSen', value: 'var(--font-sans)' },
  { id: 'serif', label: '明體 GenRyu', value: 'var(--font-serif)' },
  { id: 'hand', label: '手寫 芫荽', value: 'var(--font-hand)' },
]
const DEFAULT_FONT = FONT_FAMILIES[0]

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().focus().setMark('textStyle', { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().focus().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    }
  },
})

const FontFamily = Extension.create({
  name: 'fontFamily',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: (element) => element.style.fontFamily || null,
            renderHTML: (attributes) => {
              if (!attributes.fontFamily) return {}
              return { style: `font-family: ${attributes.fontFamily}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontFamily:
        (fontFamily) =>
        ({ chain }) =>
          chain().focus().setMark('textStyle', { fontFamily }).run(),
      unsetFontFamily:
        () =>
        ({ chain }) =>
          chain().focus().setMark('textStyle', { fontFamily: null }).removeEmptyTextStyle().run(),
    }
  },
})

const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() {
    return { types: ['paragraph', 'heading'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {}
              return { style: `line-height: ${attributes.lineHeight}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setLineHeight:
        (lineHeight) =>
        ({ tr, state, dispatch }) => {
          const { from, to } = state.selection
          let updated = false
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (!this.options.types.includes(node.type.name)) return
            const next = lineHeight === DEFAULT_LINE_HEIGHT ? null : lineHeight
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, lineHeight: next })
            updated = true
          })
          if (updated && dispatch) dispatch(tr)
          return updated
        },
    }
  },
})

function parseWidth(element) {
  const attr = element.getAttribute('width')
  if (attr) {
    const n = parseInt(attr, 10)
    return Number.isFinite(n) ? n : null
  }
  const styleW = element.style.width
  if (styleW) {
    const n = parseInt(styleW, 10)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function ResizableImageView({ node, updateAttributes, selected }) {
  const imgRef = useRef(null)
  const dragRef = useRef(null)
  const width = node.attrs.width ? Number(node.attrs.width) : null

  function startResize(event) {
    event.preventDefault()
    event.stopPropagation()
    const startX = event.clientX
    const startWidth = imgRef.current?.getBoundingClientRect().width || 240
    dragRef.current = { startX, startWidth }

    function onMove(moveEvent) {
      if (!dragRef.current || !imgRef.current) return
      const editorWidth = imgRef.current.closest('.ProseMirror')?.clientWidth || 800
      const next = Math.round(dragRef.current.startWidth + (moveEvent.clientX - dragRef.current.startX))
      imgRef.current.style.width = `${Math.min(editorWidth, Math.max(80, next))}px`
    }

    function onUp(upEvent) {
      if (dragRef.current && imgRef.current) {
        const editorWidth = imgRef.current.closest('.ProseMirror')?.clientWidth || 800
        const next = Math.round(dragRef.current.startWidth + (upEvent.clientX - dragRef.current.startX))
        updateAttributes({ width: Math.min(editorWidth, Math.max(80, next)) })
      }
      dragRef.current = null
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <NodeViewWrapper className={`rte-image-wrap${selected ? ' is-selected' : ''}`}>
      <img
        ref={imgRef}
        src={node.attrs.src}
        alt={node.attrs.alt || ''}
        data-s3-key={node.attrs['data-s3-key'] || undefined}
        style={{ width: width ? `${width}px` : undefined, height: 'auto', maxWidth: '100%' }}
      />
      {selected && (
        <button
          type="button"
          className="rte-image-handle"
          aria-label="拖曳調整圖片大小"
          onPointerDown={startResize}
          onMouseDown={(event) => event.preventDefault()}
        />
      )}
    </NodeViewWrapper>
  )
}

const ArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-s3-key': {
        default: null,
        parseHTML: (element) => element.getAttribute('data-s3-key'),
        renderHTML: (attributes) => {
          if (!attributes['data-s3-key']) return {}
          return { 'data-s3-key': attributes['data-s3-key'] }
        },
      },
      width: {
        default: null,
        parseHTML: parseWidth,
        renderHTML: (attributes) => {
          if (!attributes.width) return {}
          return {
            width: String(attributes.width),
            style: `width: ${attributes.width}px; height: auto;`,
          }
        },
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView)
  },
})

function ToolbarButton({ active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      className={`rte-btn ${active ? 'is-active' : ''}`}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function currentFontValue(editor) {
  const raw = String(editor.getAttributes('textStyle').fontFamily || '').toLowerCase()
  if (raw.includes('iansui') || raw.includes('--font-hand')) return FONT_FAMILIES[2].value
  if (raw.includes('genryu') || raw.includes('--font-serif')) return FONT_FAMILIES[1].value
  return DEFAULT_FONT.value
}

function currentFontSize(editor) {
  return editor.getAttributes('textStyle').fontSize || DEFAULT_FONT_SIZE
}

function normalizeLineHeight(value) {
  if (!value) return DEFAULT_LINE_HEIGHT
  const n = parseFloat(value)
  if (!Number.isFinite(n)) return DEFAULT_LINE_HEIGHT
  if (n === 1) return '1.0'
  const match = LINE_HEIGHTS.find((item) => parseFloat(item) === n)
  return match || String(value)
}

function currentLineHeight(editor) {
  return normalizeLineHeight(
    editor.getAttributes('paragraph').lineHeight || editor.getAttributes('heading').lineHeight,
  )
}

export default function ArticleRichText({ value, onChange, disabled, placeholder = '在這裡寫內文。先選字再設粗體、顏色、字型、字級或行距；點選圖片後可拖右下角調整大小。' }) {
  const fileRef = useRef(null)
  const loadedRef = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TextStyle,
      FontSize,
      FontFamily,
      LineHeight,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      ArticleImage.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '<p></p>',
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => {
      onChange(persistableHtml(current.getHTML()))
    },
  })

  useEffect(() => {
    if (!editor || loadedRef.current) return undefined
    let cancelled = false
    resolveArticleHtml(value || '<p></p>').then((html) => {
      if (cancelled || !editor) return
      editor.commands.setContent(html, false)
      loadedRef.current = true
    })
    return () => {
      cancelled = true
    }
  }, [editor, value])

  useEffect(() => {
    editor?.setEditable(!disabled)
  }, [disabled, editor])

  if (!editor) return <p className="admin-note">編輯器載入中…</p>

  async function insertImages(event) {
    const files = event.target.files
    if (!files?.length) return
    try {
      const keys = await uploadAdminImages(files)
      const html = await resolveArticleHtml(
        keys.map((key) => `<img data-s3-key="${key}" src="${key}" alt="">`).join(''),
      )
      editor.chain().focus().insertContent(html).run()
    } catch (err) {
      window.alert(err?.message || '圖片上傳失敗。')
    } finally {
      event.target.value = ''
    }
  }

  function setLink() {
    const previous = editor.getAttributes('link').href || ''
    const url = window.prompt('連結網址', previous)
    if (url === null) return
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  const sizeOptions = FONT_SIZES.includes(currentFontSize(editor))
    ? FONT_SIZES
    : [currentFontSize(editor), ...FONT_SIZES]
  const lineHeightOptions = LINE_HEIGHTS.includes(currentLineHeight(editor))
    ? LINE_HEIGHTS
    : [currentLineHeight(editor), ...LINE_HEIGHTS]
  const imageWidth = editor.getAttributes('image').width || ''

  return (
    <div className="rte">
      <div className="rte-toolbar" role="toolbar" aria-label="文章格式">
        <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>粗體</ToolbarButton>
        <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>斜體</ToolbarButton>
        <ToolbarButton active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>底線</ToolbarButton>
        <ToolbarButton active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>刪除線</ToolbarButton>
        <ToolbarButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>大標</ToolbarButton>
        <ToolbarButton active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>小標</ToolbarButton>
        <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>項目</ToolbarButton>
        <ToolbarButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>編號</ToolbarButton>
        <label className="rte-select">
          字型
          <select
            value={currentFontValue(editor)}
            onChange={(event) => {
              const next = event.target.value
              if (next === DEFAULT_FONT.value) editor.chain().focus().unsetFontFamily().run()
              else editor.chain().focus().setFontFamily(next).run()
            }}
          >
            {FONT_FAMILIES.map((item) => (
              <option key={item.id} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="rte-select">
          字級
          <select
            value={currentFontSize(editor)}
            onChange={(event) => {
              const size = event.target.value
              if (size === DEFAULT_FONT_SIZE) editor.chain().focus().unsetFontSize().run()
              else editor.chain().focus().setFontSize(size).run()
            }}
          >
            {sizeOptions.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
        <label className="rte-select">
          行距
          <select
            value={currentLineHeight(editor)}
            onChange={(event) => editor.chain().focus().setLineHeight(event.target.value).run()}
          >
            {lineHeightOptions.map((height) => (
              <option key={height} value={height}>{height}</option>
            ))}
          </select>
        </label>
        <label className="rte-color">
          文字色
          <input
            type="color"
            value={editor.getAttributes('textStyle').color || '#2c2622'}
            onChange={(event) => editor.chain().focus().setColor(event.target.value).run()}
          />
        </label>
        <label className="rte-color">
          螢光
          <input
            type="color"
            value={editor.getAttributes('highlight').color || '#f0d6b5'}
            onChange={(event) => editor.chain().focus().toggleHighlight({ color: event.target.value }).run()}
          />
        </label>
        <ToolbarButton active={editor.isActive('link')} onClick={setLink}>連結</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>分隔線</ToolbarButton>
        <ToolbarButton disabled={disabled} onClick={() => fileRef.current?.click()}>插入圖片</ToolbarButton>
        {editor.isActive('image') && (
          <label className="rte-select">
            寬度
            <input
              type="number"
              min="80"
              step="10"
              value={imageWidth}
              placeholder="自動"
              onChange={(event) => {
                const n = parseInt(event.target.value, 10)
                editor.chain().focus().updateAttributes('image', {
                  width: Number.isFinite(n) && n > 0 ? n : null,
                }).run()
              }}
            />
            px
          </label>
        )}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>復原</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>重做</ToolbarButton>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={insertImages} />
      <EditorContent editor={editor} className="rte-surface" />
    </div>
  )
}
