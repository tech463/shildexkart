import { useEffect, useRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
  ['link'],
  ['clean'],
]

/**
 * CMS rich text editor with left / center / right / justify alignment.
 */
export default function CmsRichEditor({
  value = '',
  onChange,
  readOnly = false,
  placeholder = 'Write page content…',
}) {
  const hostRef = useRef(null)
  const quillRef = useRef(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!hostRef.current || quillRef.current) return undefined

    const editorHost = document.createElement('div')
    hostRef.current.innerHTML = ''
    hostRef.current.appendChild(editorHost)

    const quill = new Quill(editorHost, {
      theme: 'snow',
      placeholder,
      readOnly,
      modules: {
        toolbar: toolbarOptions,
      },
    })

    quillRef.current = quill

    if (value) {
      quill.root.innerHTML = value
    }

    const handleChange = () => {
      const html = quill.root.innerHTML
      const plain = quill.getText().trim()
      onChangeRef.current?.(plain ? html : '')
    }

    quill.on('text-change', handleChange)

    return () => {
      quill.off('text-change', handleChange)
      quillRef.current = null
      if (hostRef.current) hostRef.current.innerHTML = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, [])

  useEffect(() => {
    const quill = quillRef.current
    if (!quill) return
    quill.enable(!readOnly)
  }, [readOnly])

  useEffect(() => {
    const quill = quillRef.current
    if (!quill) return
    const current = quill.root.innerHTML
    const next = value || ''
    if (next !== current) {
      const selection = quill.getSelection()
      quill.root.innerHTML = next
      if (selection) quill.setSelection(selection)
    }
  }, [value])

  return (
    <div className={`cms-rich-editor${readOnly ? ' is-readonly' : ''}`}>
      <div ref={hostRef} />
    </div>
  )
}
