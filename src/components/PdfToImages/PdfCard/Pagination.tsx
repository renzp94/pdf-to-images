import { InputNumber, Space } from 'antd'
import React, { useEffect, useState } from 'react'

export interface PaginationProps {
  value?: number[]
  onChange?: (values: number[]) => void
}

const Pagination = ({ value, onChange }: PaginationProps) => {
  const [start = 1, end] = value ?? []

  const [scope, setScope] = useState<
    | {
        startMax: number
        endMin: number
      }
    | undefined
  >()

  useEffect(() => {
    setScope({
      startMax: end,
      endMin: start,
    })
  }, [start, end])

  const onStartChange = (value: number | null) => {
    const start = value ?? 1
    setScope(val => {
      if (val) {
        return { ...val, endMin: start }
      }

      return val
    })

    onChange?.([start, end])
  }

  const onEndChange = (value: number | null) => {
    const end = value ?? 1
    setScope(val => {
      if (val) {
        return { ...val, startMax: end }
      }

      return val
    })
    onChange?.([start, end])
  }

  return (
    <Space>
      <InputNumber
        min={1}
        max={scope?.startMax}
        precision={0}
        value={start}
        onChange={onStartChange}
      />
      <span>~</span>
      <InputNumber min={scope?.endMin} max={end} precision={0} value={end} onChange={onEndChange} />
    </Space>
  )
}

export default Pagination
