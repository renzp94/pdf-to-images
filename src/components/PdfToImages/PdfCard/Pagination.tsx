import { InputNumber, Space } from 'antd'
import React, { useEffect, useState } from 'react'

export interface PaginationProps {
  value?: number[]
  max?: number
  min?: number
  onChange?: (values: number[]) => void
}

interface Scope {
  startMax: number
  endMin: number
}

const Pagination = ({ value, max, min, onChange }: PaginationProps) => {
  const [start = 1, end] = value ?? []

  const [scope, setScope] = useState<Scope | undefined>()
  useEffect(() => {
    setScope({
      startMax: end,
      endMin: start,
    })
  }, [start, end])

  const onStartChange = (value: number | null) => {
    const startValue = value ?? 1
    setScope(val => ({ ...val, endMin: startValue } as Scope))
    onChange?.([startValue, end])
  }

  const onEndChange = (value: number | null) => {
    const endValue = value ?? 1
    setScope(val => ({ ...val, startMax: endValue } as Scope))
    onChange?.([start, endValue])
  }

  return (
    <Space>
      <InputNumber
        min={min}
        max={scope?.startMax}
        precision={0}
        value={start}
        onChange={onStartChange}
      />
      <span>~</span>
      <InputNumber min={scope?.endMin} max={max} precision={0} value={end} onChange={onEndChange} />
    </Space>
  )
}

export default Pagination
