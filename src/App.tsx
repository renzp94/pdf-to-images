import React from 'react'
import PdfToImages from './components/PdfToImages'
import './app.less'
import { GithubOutlined } from '@ant-design/icons'
import { FloatButton } from 'antd'
import logo from '@/assets/images/logo.png'

const App: React.FC = () => {
  return (
    <div className="page">
      <div className="header">
        <img className="logo" src={logo} alt="logo" />
        <a href="https://github.com/renzp94/pdf-to-images" target="_blank" rel="noreferrer">
          <GithubOutlined className="header-icon" />
        </a>
      </div>
      <PdfToImages />
      <FloatButton.BackTop type="primary" />
    </div>
  )
}

export default App
