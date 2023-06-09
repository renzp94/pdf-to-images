import React, { useRef, useState } from 'react'
import { message, Modal, Spin, Upload } from 'antd'
import type { RcFile } from 'antd/es/upload'
import { InboxOutlined } from '@ant-design/icons'
import './index.scoped.less'
import { getTransformFileInfo } from './utils'
import PdfCard from './PdfCard'
import { AnimatePresence, motion } from 'framer-motion'

export interface TransformFile {
  id: number
  // 文件数据
  data: RcFile
  // 文件封面
  cover: string
  // 总页数
  total?: number
}

const offsetX = 100

const PdfToImages = () => {
  const [files, setFiles] = useState<TransformFile[]>([])
  const [loading, setLoading] = useState(false)
  const uploadFileCount = useRef<number | undefined>()

  const onBeforeUpload = async (file: RcFile, fileList: RcFile[]) => {
    if (file.type !== 'application/pdf') {
      message.warning('仅支持上传PDF格式的文件')
      return
    }
    try {
      setLoading(true)
      // 未记录要上传的数量，则记录一下
      if (uploadFileCount.current === undefined) {
        uploadFileCount.current = fileList.length
      }
      const { cover, total } = await getTransformFileInfo(file)
      const target: TransformFile = {
        id: Date.now(),
        data: file,
        cover,
        total,
      }

      setFiles(val => [...val, target])
    } finally {
      if (uploadFileCount.current !== undefined) {
        // 不管成功失败都减1
        uploadFileCount.current = uploadFileCount.current - 1

        if (uploadFileCount.current === 0) {
          uploadFileCount.current = undefined
          setLoading(false)
        }
      }
    }

    return false
  }

  const onRemove = (id: number) => {
    Modal.confirm({
      title: '警告',
      content: '是否删除选中的数据?',
      onOk() {
        setFiles(val => val.filter(item => item.id !== id))
      },
    })
  }

  return (
    <>
      <div className="upload">
        <Spin spinning={loading}>
          <Upload.Dragger
            multiple
            accept=".pdf"
            showUploadList={false}
            beforeUpload={onBeforeUpload}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或者拖拽文件到此区域上传文件</p>
            <p className="ant-upload-hint">此工具为纯前端转换，不会将文件上传服务端，请放心使用</p>
          </Upload.Dragger>
        </Spin>
      </div>
      <div className="files">
        <AnimatePresence>
          {files.map((file, i) => {
            return (
              <motion.div
                initial={{ x: -offsetX, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: offsetX, opacity: 0 }}
                key={file.id}
                transition={{ ease: 'easeOut', duration: 0.4, delay: i * 0.3 }}
              >
                <PdfCard file={file} onRemove={onRemove} />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </>
  )
}

export default PdfToImages
