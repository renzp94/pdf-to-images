import React from 'react'
import PdfToImages from './components/PdfToImages'
import './app.less'

const App: React.FC = () => {
  return (
    <div className="page">
      <PdfToImages />
    </div>
  )
}

export default App
