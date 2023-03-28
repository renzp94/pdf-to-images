import React from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'

export interface AntdConfigProvider {
  children: React.ReactNode
}

const AntdConfigProvider = (props: AntdConfigProvider) => {
  return <ConfigProvider locale={zhCN}>{props.children}</ConfigProvider>
}

export default AntdConfigProvider
