import * as pdfjs from 'pdfjs-dist'
import 'pdfjs-dist/build/pdf.worker.entry'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import type { RcFile } from 'antd/es/upload'
import JSZip from 'jszip'
import { throttle } from 'lodash-es'

/**
 * 获取pdfDocument实例
 * @param data pdf文件数据
 * @returns 返回Promise<PDFDocumentProxy>
 */
export const getPdfDocument = async (data: RcFile): Promise<PDFDocumentProxy> => {
  const reader = new FileReader()
  reader.readAsArrayBuffer(data)
  return new Promise(resolve => {
    reader.onload = async e => {
      const result = e.target?.result as ArrayBuffer | undefined
      if (result) {
        const data = new Uint8Array(result)
        const loadingTask = pdfjs.getDocument(data)
        const pdfDocument = await loadingTask.promise
        resolve(pdfDocument)
      }
    }
  })
}
/**
 * 获取文件简单信息
 * @param file 文件数据
 * @returns 返回简单信息对象
 */
export const getTransformFileInfo = async (file: RcFile) => {
  const pdfDocument = await getPdfDocument(file)

  const total = pdfDocument.numPages
  if (total === 0) {
    throw new Error('pdf文件内无数据转换')
  }
  const cover = await getImageData(pdfDocument, 1)
  return { total, cover }
}
export interface TransformOptions {
  pageStart?: number
  pageTotal?: number
  type: string
  onChange?: (index: number) => void
}
/**
 * 转换数据
 * @param file 文件数据
 * @param name 转换的数据
 */
export const transform = async (
  file: RcFile,
  { pageStart = 1, pageTotal, type = '.png', onChange }: TransformOptions
) => {
  const pdfDocument = await getPdfDocument(file)

  const total = pageTotal ?? pdfDocument.numPages
  if (total === 0) {
    throw new Error('pdf文件内无数据转换')
  }
  const [filename] = file.name.split('.')
  let index = pageStart
  if (total === index) {
    const base64Data = await getImageData(pdfDocument, index)
    const data = dataURLtoBlob(base64Data)
    return { data, filename }
  }
  const zip = new JSZip()
  const change = throttle((progress: number) => onChange?.(progress >= 100 ? 100 : progress), 1000)
  while (index <= total) {
    const base64Data = await getImageData(pdfDocument, index)
    const blob = dataURLtoBlob(base64Data)
    zip.file(`${filename}-${index++}${type}`, blob)
    const progress = parseFloat(((index / total) * 100).toFixed(2))
    change(progress)
  }
  const data = await zip.generateAsync({ type: 'blob' })

  return { data, filename }
}
/**
 * 获取图片数据
 * @param pdfDocument pdfDocument实例
 * @param index 要获取的pdf页数
 * @returns 返回base64的数据
 */
export const getImageData = async (pdfDocument: PDFDocumentProxy, index: number) => {
  const pdfPage = await pdfDocument.getPage(index)
  const viewport = pdfPage.getViewport({ scale: 1.0 })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const renderTask = pdfPage.render({
    canvasContext: ctx,
    viewport,
  })
  await renderTask.promise
  return canvas.toDataURL('image/png')
}
/**
 * 将base64数据转为blob数据
 * @param data base64字符串
 * @returns 返回blob数据
 */
export const dataURLtoBlob = (data: string) => {
  const [dataType, dataBuffer] = data.split(',')
  const mime = dataType?.match?.(/:(.*?);/)?.[1]
  const blob = atob(dataBuffer)
  let n = blob.length
  const buffer = new Uint8Array(n)

  while (n--) {
    buffer[n] = blob.charCodeAt(n)
  }
  return new Blob([buffer], {
    type: mime,
  })
}
/**
 * 将base64数据保存成文件
 * @param base64Data base64数据
 * @param name 文件名
 */
export const downloadFile = (blobData: Blob, name: string) => {
  // 创建新的URL并指向File对象或者Blob对象的地址
  const blobURL = window.URL.createObjectURL(blobData)
  // 创建a标签，用于跳转至下载链接
  const tempLink = document.createElement('a')
  tempLink.style.display = 'none'
  tempLink.href = blobURL
  tempLink.setAttribute('download', decodeURIComponent(name))
  // 兼容：某些浏览器不支持HTML5的download属性
  if (typeof tempLink.download === 'undefined') {
    tempLink.setAttribute('target', '_blank')
  }
  // 挂载a标签
  document.body.appendChild(tempLink)
  tempLink.click()
  document.body.removeChild(tempLink)
  // 释放blob URL地址
  window.URL.revokeObjectURL(blobURL)
}
