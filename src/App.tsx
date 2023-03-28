import React from 'react'
import PdfToImages from './components/PdfToImages'
import './app.less'

const App: React.FC = () => {
  return (
    <div className="page">
      <div className="panel upload">
        <PdfToImages />
      </div>
      {/* <div className="panel">列表</div> */}
    </div>
  )
}

export default App
