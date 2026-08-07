/**
 * FAQ content is stored in CMS.description as JSON:
 * { type: "faq", intro?: string, items: [{ question, answer }] }
 * Older HTML FAQ pages are converted on read when possible.
 */

export function isFaqSlug(slug = '') {
  return String(slug).trim().toLowerCase() === 'faq'
}

export function createEmptyFaqItem() {
  return {
    id: `faq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    question: '',
    answer: '',
  }
}

export function parseFaqPayload(raw) {
  if (!raw) {
    return { type: 'faq', intro: '', items: [createEmptyFaqItem()] }
  }

  if (typeof raw === 'object' && raw.type === 'faq' && Array.isArray(raw.items)) {
    return {
      type: 'faq',
      intro: raw.intro || '',
      items: raw.items.length
        ? raw.items.map((item, index) => ({
            id: item.id || `faq-${index}`,
            question: item.question || item.q || '',
            answer: item.answer || item.a || '',
          }))
        : [createEmptyFaqItem()],
    }
  }

  const text = String(raw).trim()
  if (!text) {
    return { type: 'faq', intro: '', items: [createEmptyFaqItem()] }
  }

  try {
    const parsed = JSON.parse(text)
    if (parsed && parsed.type === 'faq' && Array.isArray(parsed.items)) {
      return parseFaqPayload(parsed)
    }
    if (Array.isArray(parsed)) {
      return parseFaqPayload({ type: 'faq', items: parsed })
    }
  } catch {
    // fall through to HTML parsing
  }

  // Convert legacy HTML: <h3>Q</h3><p>A</p>
  if (typeof window !== 'undefined' && text.includes('<')) {
    try {
      const doc = new DOMParser().parseFromString(text, 'text/html')
      const headings = [...doc.querySelectorAll('h2, h3, h4')]
      if (headings.length) {
        const items = headings.map((heading, index) => {
          const chunks = []
          let node = heading.nextElementSibling
          while (node && !/^H[2-4]$/i.test(node.tagName)) {
            chunks.push(node.outerHTML || node.textContent || '')
            node = node.nextElementSibling
          }
          return {
            id: `faq-legacy-${index}`,
            question: heading.textContent?.trim() || `Question ${index + 1}`,
            answer: chunks.join('').trim() || '',
          }
        })
        return { type: 'faq', intro: '', items }
      }
    } catch {
      // ignore
    }
  }

  return {
    type: 'faq',
    intro: '',
    items: [
      {
        id: 'faq-legacy-0',
        question: 'FAQ',
        answer: text,
      },
    ],
  }
}

export function serializeFaqPayload(payload) {
  const items = (payload?.items || [])
    .map((item) => ({
      question: String(item.question || '').trim(),
      answer: String(item.answer || '').trim(),
    }))
    .filter((item) => item.question || item.answer)

  return JSON.stringify({
    type: 'faq',
    intro: String(payload?.intro || '').trim(),
    items,
  })
}

export function faqItemsFromDescription(description) {
  return parseFaqPayload(description).items.filter(
    (item) => item.question || item.answer,
  )
}
