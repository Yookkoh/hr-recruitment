import { useCallback } from 'react'

export function useExport(exportRef) {
  const exportAsJpg = useCallback(async () => {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(exportRef.current, { scale: 2, useCORS: true })
    const link   = document.createElement('a')
    link.download = `recruitment-${Date.now()}.jpg`
    link.href     = canvas.toDataURL('image/jpeg', 0.95)
    link.click()
  }, [exportRef])

  const exportAsPdf = useCallback(async () => {
    const { default: html2canvas } = await import('html2canvas')
    const { jsPDF }                = await import('jspdf')
    const canvas  = await html2canvas(exportRef.current, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdfW    = canvas.width / 2
    const pdfH    = canvas.height / 2
    const pdf     = new jsPDF({ orientation: pdfW > pdfH ? 'landscape' : 'portrait', unit: 'px', format: [pdfW, pdfH] })
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH)
    pdf.save(`recruitment-${Date.now()}.pdf`)
  }, [exportRef])

  return { exportAsJpg, exportAsPdf }
}
