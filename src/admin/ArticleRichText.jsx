import { useEffect, useRef } from 'react'
import { Extension } from '@tiptap/core'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { uploadAdminImages } from '../data/adminArticles.js'
import { persistableHtml, resolveArticleHtml } from '../lib/articleHtml.js'

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
    }
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

export default function ArticleRichText({ value, onChange, disabled }) {
  const fileRef = useRef(null)
  const loadedRef = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      ArticleImage.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: '在這裡寫內文。先選字再設粗體、顏色或字級；游標放在要插入圖片的段落再按「插入圖片」。' }),
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
          字級
          <select
            value={editor.getAttributes('textStyle').fontSize || ''}
            onChange={(event) => {
              const size = event.target.value
              if (!size) editor.chain().focus().unsetFontSize().run()
              else editor.chain().focus().setFontSize(size).run()
            }}
          >
            <option value="">內文</option>
            <option value="0.9em">較小</option>
            <option value="1.15em">稍大</option>
            <option value="1.35em">大</option>
            <option value="1.6em">特大</option>
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
        <ToolbarButton disabled={disabled} onClick={() => fileRef.current?.click()}>插入圖片</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>復原</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>重做</ToolbarButton>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={insertImages} />
      <EditorContent editor={editor} className="rte-surface" />
    </div>
  )
}
