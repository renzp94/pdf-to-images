import React, { useState } from 'react'
import * as pdfjs from 'pdfjs-dist'
import 'pdfjs-dist/build/pdf.worker.entry'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { InputNumber, message, Space, Spin, Upload } from 'antd'
import type { RcFile, UploadChangeParam, UploadFile } from 'antd/es/upload'
import { InboxOutlined } from '@ant-design/icons'
import JSZip from 'jszip'

const statusTexts = {
  uploading: '文件上传中...',
  transform: '文件转换中...',
}

const PdfToImages = () => {
  const [status, setStatus] = useState('none')
  const statusTip = statusTexts[status]
  const onChange = async (info: UploadChangeParam<UploadFile<any>>) => {
    const { status, originFileObj, name } = info.file
    if (['error', 'done'].includes(status as string) && originFileObj) {
      try {
        setStatus('transform')
        await transformSave(originFileObj, name)
        message.success('文件转换完成')
      } catch (error: any) {
        message.error(error.message)
      } finally {
        setStatus('none')
      }
    } else {
      setStatus(status as string)
    }
  }

  return (
    <Spin spinning={status !== 'none'} tip={statusTip}>
      <Upload.Dragger showUploadList={false} onChange={onChange}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或者拖拽文件到此区域开始转换</p>
        <p className="ant-upload-hint">此工具为纯前端转换，不会将文件上传服务端，请放心使用</p>
      </Upload.Dragger>
      {/* <div className="panel">
        <div>列表</div>
        <Space>
          <span>设置要转换的页码: </span>
          <InputNumber />
          <span>~</span>
          <InputNumber />
        </Space>
      </div> */}
    </Spin>
  )
}
/**
 * 获取pdfDocument实例
 * @param data pdf文件数据
 * @returns 返回Promise<PDFDocumentProxy>
 */
const getPdfDocument = async (data: RcFile): Promise<PDFDocumentProxy> => {
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
 * 转换数据并保存成文件
 * @param file 文件数据
 * @param name 转换后的名称
 */
const transformSave = async (file: RcFile, name: string) => {
  const pdfDocument = await getPdfDocument(file)

  const total = pdfDocument.numPages
  if (total === 0) {
    throw new Error('pdf文件内无数据转换')
  }
  const [filename] = name.split('.')
  let index = 1
  if (total === index) {
    const base64Data = await getImageData(pdfDocument, index)
    const blob = dataURLtoBlob(base64Data)
    downloadFile(blob, `${filename}-${index}.png`)
    return
  }
  const zip = new JSZip()
  while (index <= total) {
    const base64Data = await getImageData(pdfDocument, index)
    const blob = dataURLtoBlob(base64Data)
    zip.file(`${filename}-${index++}.png`, blob)
  }
  const fileData = await zip.generateAsync({ type: 'blob' })
  downloadFile(fileData, `${filename}.zip`)
}
/**
 * 获取图片数据
 * @param pdfDocument pdfDocument实例
 * @param index 要获取的pdf页数
 * @returns 返回base64的数据
 */
const getImageData = async (pdfDocument: PDFDocumentProxy, index: number) => {
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
const dataURLtoBlob = (data: string) => {
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
const downloadFile = (blobData: Blob, name: string) => {
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

export default PdfToImages
