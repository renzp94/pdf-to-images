import {
  CloseCircleOutlined,
  CloudDownloadOutlined,
  HourglassOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'
import { Button, Form, Image, Progress, Select, Space, Tooltip, Typography } from 'antd'
import JSZip from 'jszip'
import React, { useEffect, useState } from 'react'
import { TransformFile } from '..'
import { downloadFile, transform } from '../utils'
import './index.scoped.less'
import Pagination from './Pagination'

export interface PdfCardProps {
  file: TransformFile
  onRemove?: (id: number) => void
}

enum STATUS {
  NONE = 'none',
  TRANSFORM = 'transform',
  DONE = 'done',
}

const imgTypes = [
  {
    value: '.png',
    label: '.png',
  },
  {
    value: '.jpg',
    label: '.jpg',
  },
  {
    value: '.jpeg',
    label: '.jpeg',
  },
]

const PdfCard = ({ file, onRemove }: PdfCardProps) => {
  const [form] = Form.useForm()
  const [status, setStatus] = useState(STATUS.NONE)
  const [progress, setProgress] = useState(0)
  const [transformData, setTransformData] = useState<
    { zip?: JSZip; data?: Blob; filename: string; total: number; type: string } | undefined
  >()

  useEffect(() => {
    form.setFieldsValue({
      pagination: [1, file?.total],
    })
  }, [file, form])

  // 转换
  const onTransform = async () => {
    const {
      pagination: [pageStart, pageTotal],
      type,
    } = form.getFieldsValue()

    setStatus(STATUS.TRANSFORM)
    const data = await transform(file.data, {
      pageStart,
      pageTotal,
      type,
      onChange: setProgress,
    })
    setTransformData({ ...data, total: pageTotal, type })
    setStatus(STATUS.DONE)
  }
  const [downloadLoading, setDownloadLoading] = useState(false)
  // 下载
  const onDownload = async () => {
    if (transformData) {
      try {
        setDownloadLoading(true)
        const isMultiple = (transformData.total ?? 0) > 1
        const suffix = isMultiple ? '.zip' : transformData.type ?? '.png'
        let data: Blob = transformData?.data as Blob
        if (isMultiple) {
          data = (await transformData?.zip?.generateAsync({ type: 'blob' })) as Blob
        }

        downloadFile(data, `${transformData.filename}${suffix}`)
      } finally {
        setDownloadLoading(false)
      }
    }
  }

  const onValuesChange = () => {
    setProgress(0)
    setStatus(STATUS.NONE)
  }

  const components = {
    [STATUS.NONE]: (
      <Tooltip title="开始转换" placement="right">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<PlayCircleOutlined />}
          onClick={onTransform}
        />
      </Tooltip>
    ),
    [STATUS.TRANSFORM]: (
      <Progress
        type="circle"
        status="active"
        percent={progress}
        size={100}
        format={() => (
          <div className="progress-text">
            <HourglassOutlined />
          </div>
        )}
      />
    ),
    [STATUS.DONE]: (
      <Tooltip title="下载" placement="right">
        <Button
          type="primary"
          shape="circle"
          size="large"
          loading={downloadLoading}
          icon={<CloudDownloadOutlined />}
          onClick={onDownload}
        />
      </Tooltip>
    ),
  }

  return (
    <div className="pdf-card">
      <div className="pdf-card-container">
        <Image rootClassName="pdf-cover" src={file?.cover} />
        <div className="pdf-info">
          <Space direction="vertical" size={8}>
            <Typography.Text className="pdf-name" ellipsis={{ tooltip: file?.data.name }}>
              {file?.data.name}
            </Typography.Text>
            <div className="pdf-settings">
              <Form form={form} onValuesChange={onValuesChange}>
                <Form.Item label="转换页码" name="pagination">
                  <Pagination min={1} max={file.total} />
                </Form.Item>
                <Form.Item
                  className="pdf-form-item"
                  label="图片类型"
                  name="type"
                  initialValue=".png"
                >
                  <Select className="type-select" options={imgTypes} />
                </Form.Item>
              </Form>
            </div>
          </Space>
        </div>
        <div className="pdf-actions">
          <CloseCircleOutlined className="pdf-close-icon" onClick={() => onRemove?.(file.id)} />
          {components[status]}
        </div>
      </div>
    </div>
  )
}

export default PdfCard
