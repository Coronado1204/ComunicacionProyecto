import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const STATUS_LABELS = {
  PENDIENTE:  'Pendiente',
  EN_PROCESO: 'En proceso',
  RESUELTO:   'Resuelto',
  RECHAZADO:  'Rechazado',
}

const formatDate = (date) =>
  new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

export const exportToPDF = (reports, filters = {}) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // Header
  doc.setFillColor(23, 23, 23)
  doc.rect(0, 0, 297, 25, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Sabana Centro', 14, 11)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Gestión Territorial Inteligente — Provincia Sabana Centro, Cundinamarca', 14, 18)

  // Fecha de generación
  doc.setTextColor(180, 180, 180)
  doc.setFontSize(8)
  const now = new Date().toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
  doc.text('Generado el ' + now, 230, 18)

  // Título del reporte
  doc.setTextColor(23, 23, 23)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Informe de Reportes Territoriales', 14, 35)

  // Filtros aplicados
  const filtrosTexto = []
  if (filters.municipio) filtrosTexto.push('Municipio: ' + filters.municipio)
  if (filters.category)  filtrosTexto.push('Categoría: ' + filters.category)
  if (filters.status)    filtrosTexto.push('Estado: ' + STATUS_LABELS[filters.status])

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(115, 115, 115)

  if (filtrosTexto.length > 0) {
    doc.text('Filtros: ' + filtrosTexto.join(' · '), 14, 42)
  } else {
    doc.text('Todos los reportes', 14, 42)
  }

  doc.text('Total: ' + reports.length + ' reporte' + (reports.length !== 1 ? 's' : ''), 14, 48)

  // Tabla
  autoTable(doc, {
    startY: 54,
    head: [['#', 'Título', 'Descripción', 'Categoría', 'Municipio', 'Estado', 'Fecha']],
    body: reports.map((r, i) => [
      i + 1,
      r.title,
      r.description?.length > 60 ? r.description.substring(0, 60) + '...' : r.description,
      r.category,
      r.municipio,
      STATUS_LABELS[r.status] || r.status,
      formatDate(r.createdAt),
    ]),
    headStyles: {
      fillColor: [23, 23, 23],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [38, 38, 38],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 45 },
      2: { cellWidth: 70 },
      3: { cellWidth: 35 },
      4: { cellWidth: 30 },
      5: { cellWidth: 25 },
      6: { cellWidth: 35 },
    },
    margin: { left: 14, right: 14 },
    styles: { overflow: 'linebreak' },
    didDrawPage: (data) => {
      // Footer en cada página
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFontSize(7)
      doc.setTextColor(163, 163, 163)
      doc.text(
        'Página ' + data.pageNumber + ' de ' + pageCount + ' — Sabana Centro © 2026',
        14,
        doc.internal.pageSize.height - 8
      )
    },
  })

  const filename = 'sabana-centro-reportes-' + new Date().toISOString().split('T')[0] + '.pdf'
  doc.save(filename)
}

export const exportToExcel = (reports, filters = {}) => {
  const filtrosTexto = []
  if (filters.municipio) filtrosTexto.push('Municipio: ' + filters.municipio)
  if (filters.category)  filtrosTexto.push('Categoría: ' + filters.category)
  if (filters.status)    filtrosTexto.push('Estado: ' + STATUS_LABELS[filters.status])

  // Hoja de datos principal
  const wsData = [
    ['SABANA CENTRO — Informe de Reportes Territoriales'],
    ['Generado el: ' + new Date().toLocaleDateString('es-CO')],
    filtrosTexto.length > 0 ? ['Filtros: ' + filtrosTexto.join(' · ')] : ['Sin filtros aplicados'],
    ['Total de reportes: ' + reports.length],
    [],
    ['#', 'Título', 'Descripción', 'Categoría', 'Municipio', 'Estado', 'Dirección', 'Latitud', 'Longitud', 'Fecha de creación'],
    ...reports.map((r, i) => [
      i + 1,
      r.title,
      r.description,
      r.category,
      r.municipio,
      STATUS_LABELS[r.status] || r.status,
      r.direccion || '',
      r.latitude || '',
      r.longitude || '',
      formatDate(r.createdAt),
    ])
  ]

  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Ancho de columnas
  ws['!cols'] = [
    { wch: 5 },  { wch: 35 }, { wch: 60 }, { wch: 20 },
    { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 12 },
    { wch: 12 }, { wch: 20 },
  ]

  // Hoja de resumen por municipio
  const municipios = reports.reduce((acc, r) => {
    if (!acc[r.municipio]) acc[r.municipio] = { total: 0, pendiente: 0, en_proceso: 0, resuelto: 0, rechazado: 0 }
    acc[r.municipio].total++
    acc[r.municipio][r.status.toLowerCase()]++
    return acc
  }, {})

  const wsResumen = XLSX.utils.aoa_to_sheet([
    ['RESUMEN POR MUNICIPIO'],
    [],
    ['Municipio', 'Total', 'Pendiente', 'En Proceso', 'Resuelto', 'Rechazado', '% Resuelto'],
    ...Object.entries(municipios).map(([mun, stats]) => [
      mun,
      stats.total,
      stats.pendiente || 0,
      stats.en_proceso || 0,
      stats.resuelto || 0,
      stats.rechazado || 0,
      stats.total > 0 ? Math.round((stats.resuelto / stats.total) * 100) + '%' : '0%',
    ])
  ])

  wsResumen['!cols'] = [
    { wch: 20 }, { wch: 10 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
  ]

  // Crear workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Reportes')
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen por municipio')

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  const filename = 'sabana-centro-reportes-' + new Date().toISOString().split('T')[0] + '.xlsx'
  saveAs(blob, filename)
}