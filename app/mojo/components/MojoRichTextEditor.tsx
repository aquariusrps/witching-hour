'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Link } from '@tiptap/extension-link'
import DOMPurify from 'dompurify'

function sanitize(html: string): string {
  return typeof window !== 'undefined' ? DOMPurify.sanitize(html) : html
}

const COLOR_PALETTE: { label: string; value: string | null }[] = [
  { label: 'Default', value: null },
  { label: 'Rose Ash', value: '#eae8f4' },
  { label: 'Mist', value: '#9c9ab8' },
  { label: 'Gold', value: '#a02840' },
  { label: 'Ember', value: '#6040c0' },
  { label: 'Moonstone', value: '#288890' },
  { label: 'Moon Light', value: '#40a0a8' },
  { label: 'Gold Light', value: '#bc445c' },
  { label: 'Faded', value: '#5a5878' },
  { label: 'White', value: '#ffffff' },
  { label: 'Cream', value: '#fdf6e3' },
  { label: 'Soft Pink', value: '#e8c4b8' },
]

function toolbarButtonStyle(active: boolean): React.CSSProperties {
  return {
    padding: '3px 7px',
    borderRadius: 2,
    fontSize: '12px',
    fontFamily: 'Cinzel, serif',
    cursor: 'pointer',
    border: 'none',
    background: active ? 'var(--elevated)' : 'transparent',
    color: active ? 'var(--gold)' : 'var(--faded)',
  }
}

function Separator() {
  return <div style={{ width: 1, height: 16, background: 'var(--elevated)', margin: '0 4px' }} />
}

function MojoRichTextEditorInner({
  content,
  onChange,
  placeholder,
  minHeight,
  autoFocus,
}: {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
  autoFocus?: boolean
}) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isEmpty, setIsEmpty] = useState(!content)
  const colorPickerRef = useRef<HTMLDivElement>(null)

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          link: false,
          underline: false,
        }),
        Underline,
        TextStyle,
        Color,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            rel: 'noopener noreferrer',
            target: '_blank',
          },
        }),
      ],
      content: content || '',
      onUpdate: ({ editor }) => {
        const html = editor.getHTML()
        setIsEmpty(editor.isEmpty)
        onChange(html === '<p></p>' ? '' : html)
      },
      onCreate: ({ editor }) => {
        setIsEmpty(editor.isEmpty)
      },
      autofocus: autoFocus ?? false,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          'data-placeholder': placeholder ?? 'Write something...',
          style: [
            'padding: 10px 12px',
            'min-height: ' + (minHeight ?? '120px'),
            'outline: none',
            'font-family: EB Garamond, serif',
            'font-size: 14px',
            'color: var(--roseash)',
            'line-height: 1.6',
          ].join('; '),
        },
      },
    },
    []
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false)
      }
    }
    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColorPicker])

  if (!editor) return null

  function handleSetLink() {
    if (!editor) return
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  function handleColorSelect(value: string | null) {
    if (!editor) return
    if (value === null) {
      editor.chain().focus().unsetColor().run()
    } else {
      editor.chain().focus().setColor(value).run()
    }
    setShowColorPicker(false)
  }

  return (
    <div style={{ border: '1px solid var(--elevated)', borderRadius: 2 }}>
      <div
        className="mojo-rich-text-toolbar"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          padding: '6px 8px',
          borderBottom: '1px solid var(--elevated)',
          background: 'var(--raised)',
          position: 'relative',
        }}
      >
        <button type="button" style={toolbarButtonStyle(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}>
          B
        </button>
        <button type="button" style={toolbarButtonStyle(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}>
          I
        </button>
        <button type="button" style={toolbarButtonStyle(editor.isActive('underline'))} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          U
        </button>
        <button type="button" style={toolbarButtonStyle(editor.isActive('strike'))} onClick={() => editor.chain().focus().toggleStrike().run()}>
          S
        </button>

        <Separator />

        <button type="button" style={toolbarButtonStyle(editor.isActive('heading', { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </button>
        <button type="button" style={toolbarButtonStyle(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>
        <button type="button" style={toolbarButtonStyle(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </button>

        <Separator />

        <div ref={colorPickerRef} style={{ position: 'relative' }}>
          <button type="button" style={toolbarButtonStyle(showColorPicker)} onClick={() => setShowColorPicker((v) => !v)}>
            A▾
          </button>
          {showColorPicker && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 4,
                zIndex: 50,
                background: 'var(--elevated)',
                border: '1px solid var(--elevated)',
                borderRadius: 4,
                padding: 8,
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: 4,
              }}
            >
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  title={c.label}
                  onClick={() => handleColorSelect(c.value)}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: '1px solid var(--elevated)',
                    padding: 0,
                    background: c.value ?? 'white',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {c.value === null && (
                    <span style={{ position: 'absolute', inset: 0, color: 'red', fontSize: 12, lineHeight: '16px' }}>
                      ×
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <button type="button" style={toolbarButtonStyle(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </button>
        <button type="button" style={toolbarButtonStyle(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </button>
        <button type="button" style={toolbarButtonStyle(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          Quote
        </button>

        <Separator />

        <button type="button" style={toolbarButtonStyle(editor.isActive('codeBlock'))} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          Code
        </button>
        <button type="button" style={toolbarButtonStyle(editor.isActive('code'))} onClick={() => editor.chain().focus().toggleCode().run()}>
          `
        </button>

        <Separator />

        <button type="button" style={toolbarButtonStyle(editor.isActive('link'))} onClick={handleSetLink}>
          Link
        </button>

        <Separator />

        <button type="button" style={toolbarButtonStyle(false)} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          —
        </button>
      </div>

      <EditorContent
        editor={editor}
        className={'mojo-rich-text' + (isEmpty ? ' mojo-rich-text-empty' : '')}
      />
    </div>
  )
}

export default function MojoRichTextEditor({
  content,
  onChange,
  placeholder,
  minHeight,
  readonly,
  autoFocus,
}: {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
  readonly?: boolean
  autoFocus?: boolean
}) {
  if (readonly) {
    return (
      <div
        className="mojo-rich-text"
        dangerouslySetInnerHTML={{ __html: sanitize(content ?? '') }}
        style={{ fontFamily: 'EB Garamond, serif', fontSize: '14px', color: 'var(--roseash)', lineHeight: '1.6' }}
      />
    )
  }

  return (
    <MojoRichTextEditorInner
      content={content}
      onChange={onChange}
      placeholder={placeholder}
      minHeight={minHeight}
      autoFocus={autoFocus}
    />
  )
}
