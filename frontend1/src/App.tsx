'use client';
import { useState } from 'react'
import { MermaidDiagram } from './components/MermaidDiagram';


function App() {
  const [code, setCode] = useState('graph TD;\nA-->B;\nA-->C;\nB-->D;\nC-->D;');

  return (
    <>
      <header className='flex h-[35px] items-center bg-slate-900 text-white px-1'>
        <h1 className='text-xl font-bold'>AI Diagram builder</h1>
      </header>
      <section className='flex h-[30px] items-center bg-slate-800 px-1 text-white space-x-1'>
        <label className=''>Endpoint</label>
        <input type='text' className='bg-white text-black w-60' />
        <label>API Key</label>
        <input type='text' className='bg-white text-black w-60' />
      </section>
      <div className='flex h-[calc(100vh-35px-30px-28px)]'>
        <aside className='w-1/3 h-full flex flex-col p-1'>
          <label className='uppercase font-semibold'>Prompt</label>
          <span>Demos: <a href='#' className='text-blue-700 hover:underline'>Simple</a> | <a href='#' className='text-blue-700 hover:underline'>Complex</a></span>
          <textarea className='h-full resize-none outline-none border'></textarea>
          <div className="flex space-x-1 mt-1">
            <button className='bg-blue-500 text-white px-2 py-1 rounded'>Generate</button>
            <button className='bg-gray-300 text-black px-2 py-1 rounded'>Reset</button>
          </div>
        </aside>
        <div className='flex flex-col w-2/3 h-full p-1'>
          <div className='flex flex-col h-1/3 px-1'>
            <label>Mermaid code</label>
            <textarea className='h-full resize-none outline-none border p-1'
              value={code}
              onChange={(e) => setCode(e.target.value)}
            ></textarea>
          </div>
          <div className='flex flex-col h-2/3'>
            <label>Diagram</label>
            <div className='h-full overflow-auto'>
              <MermaidDiagram onError={(error) => { console.error(error) }}>{code}</MermaidDiagram>
            </div>
          </div>
        </div>
      </div>
      <footer className='flex h-[28px] items-center bg-slate-900 text-white px-1'>
        <span>processing</span>
      </footer>
    </>
  )
}

export default App
