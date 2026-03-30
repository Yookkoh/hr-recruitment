import { useCallback } from 'react'

const MAX_CAPTURE_PIXELS = 16_000_000
const DEFAULT_FILE_PREFIX = 'staff-tracker-report'

function buildFileName(extension, prefix = DEFAULT_FILE_PREFIX) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `${prefix}-${timestamp}.${extension}`
}

function waitForNextPaint() {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve)
    })
  })
}

function getCaptureDimensions(node) {
  return {
    width: Math.max(node.scrollWidth, node.clientWidth, node.offsetWidth),
    height: Math.max(node.scrollHeight, node.clientHeight, node.offsetHeight),
  }
}

function getCaptureScale(width, height) {
  const preferredScale = Math.max(2, window.devicePixelRatio || 1)
  const safeScale = Math.sqrt(MAX_CAPTURE_PIXELS / Math.max(1, width * height))
  return Math.max(1, Math.min(preferredScale, safeScale))
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Could not generate the export file.'))
        return
      }

      resolve(blob)
    }, type, quality)
  })
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()

  setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

async function captureCanvas(node) {
  if (!node) throw new Error('The report preview is not ready yet.')

  await waitForNextPaint()

  const { default: html2canvas } = await import('html2canvas')
  const { width, height } = getCaptureDimensions(node)

  return html2canvas(node, {
    backgroundColor: '#ffffff',
    height,
    logging: false,
    onclone: clonedDocument => {
      clonedDocument.documentElement.dataset.theme = 'light'
      clonedDocument.documentElement.style.colorScheme = 'light'
      clonedDocument.documentElement.classList.remove('dark')
    },
    scale: getCaptureScale(width, height),
    scrollX: 0,
    scrollY: -window.scrollY,
    useCORS: true,
    width,
    windowHeight: height,
    windowWidth: width,
  })
}

async function createJpegBlob(node) {
  const canvas = await captureCanvas(node)
  return canvasToBlob(canvas, 'image/jpeg', 0.94)
}

async function buildPdf(node, prefix = DEFAULT_FILE_PREFIX) {
  const canvas = await captureCanvas(node)
  const { jsPDF } = await import('jspdf')

  const pdf = new jsPDF({
    compress: true,
    format: 'a4',
    orientation: 'landscape',
    unit: 'pt',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 24
  const contentWidth = pageWidth - margin * 2
  const contentHeight = pageHeight - margin * 2
  const scale = contentWidth / canvas.width
  const sliceHeight = Math.max(1, Math.floor(contentHeight / scale))

  let offsetY = 0
  let isFirstPage = true

  while (offsetY < canvas.height) {
    const currentSliceHeight = Math.min(sliceHeight, canvas.height - offsetY)
    const pageCanvas = document.createElement('canvas')
    const pageContext = pageCanvas.getContext('2d')

    pageCanvas.width = canvas.width
    pageCanvas.height = currentSliceHeight

    if (!pageContext) throw new Error('Could not prepare the PDF export.')

    pageContext.fillStyle = '#ffffff'
    pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
    pageContext.drawImage(
      canvas,
      0,
      offsetY,
      canvas.width,
      currentSliceHeight,
      0,
      0,
      pageCanvas.width,
      pageCanvas.height,
    )

    if (!isFirstPage) pdf.addPage()

    pdf.addImage(
      pageCanvas,
      'JPEG',
      margin,
      margin,
      contentWidth,
      currentSliceHeight * scale,
      undefined,
      'FAST',
    )

    isFirstPage = false
    offsetY += currentSliceHeight
  }

  pdf.save(buildFileName('pdf', prefix))
}

export function useExport(exportRef, options = {}) {
  const { filePrefix = DEFAULT_FILE_PREFIX } = options

  const exportAsJpg = useCallback(async () => {
    const blob = await createJpegBlob(exportRef.current)
    downloadBlob(blob, buildFileName('jpg', filePrefix))
  }, [exportRef, filePrefix])

  const exportAsPdf = useCallback(async () => {
    await buildPdf(exportRef.current, filePrefix)
  }, [exportRef, filePrefix])

  const shareAsJpg = useCallback(async shareOptions => {
    const blob = await createJpegBlob(exportRef.current)
    const filename = buildFileName('jpg', filePrefix)
    const file = new File([blob], filename, { type: 'image/jpeg' })
    let canShareFiles = false

    try {
      canShareFiles = !!navigator.canShare?.({ files: [file] })
    } catch {
      canShareFiles = false
    }

    if (canShareFiles && navigator.share) {
      await navigator.share({
        files: [file],
        text: shareOptions?.text,
        title: shareOptions?.title ?? 'Staff Tracker Report',
      })
      return
    }

    downloadBlob(blob, filename)
  }, [exportRef, filePrefix])

  return { exportAsJpg, exportAsPdf, shareAsJpg }
}
