import { useState } from 'react'
import { mermaidToSvg, useLocalStorage } from './services'
import { MdOutlineZoomOutMap } from 'react-icons/md'
//import ModalWindow from './components/ModalWindow'

const Defaults = {
  system: `You are a Mermaid diagram generator for system design architecture.
Goals:
- Do not simplify. The goal is to visualize a production-grade, secure, and scalable Azure architecture.
- Validate the generated code to make sure that it will render correctly.
Rules:
- Use one color in an elegant way.
- For the color styles, use classes and add them and the end of the rest of the elements.
- No epilogue or prologue.
- When appropriate, add labels between components.
Output:
- Output the Mermaid diagram code only without the markdown text block.`
}

const Demos = {
  simple: `Create a graph diagram of a user making an HTTP request to an Azure App Service over Azure Front Door.`,
  intermediate: `Create a graph diagram of a user making an HTTP request to an Azure App Service over Azure Front Door. The App Service calls an Azure SQL Database over a private endpoint. The user should be a blue circle. The private endpoint should be in its own sub-diagram in a VNET. The Azure SQL Database should not be in the sub-diagram. Arrows should be bi-directional.`,
  complex: `Generate a highly detailed Azure architecture diagram using Mermaid syntax. The diagram should include:

- Azure Kubernetes Service (AKS) with multiple node pools (e.g., Linux and Windows)
- Azure Virtual Network (VNet) with subnets for AKS, Application Gateway, and private endpoints
- Azure Private DNS Zones linked to the VNet
- Azure Application Gateway with WAF enabled, integrated with AKS via ingress
- Azure Container Registry (ACR) with private endpoint
- Azure Key Vault with private endpoint
- Azure SQL Database with private endpoint
- Azure Monitor and Log Analytics workspace
- Azure Load Balancer (internal) for AKS services
- Azure Bastion for secure VM access
- Network Security Groups (NSGs) and route tables
- User-defined routes (UDRs) for traffic control
- Azure AD integration for AKS RBAC
- Azure Storage Account with private endpoint
- Azure Firewall or NVA for outbound control
- ExpressRoute or VPN Gateway for hybrid connectivity

Use Mermaid's \`flowchart TD\` syntax. Represent each component as a node with appropriate labels and group them logically using subgraphs. Show all relevant connections, including private endpoint flows, VNet peering if applicable, and traffic paths from ingress to backend services.

Do not simplify. The goal is to visualize a production-grade, secure, and scalable Azure architecture.`
}

const TITLE = 'GenAI Mermaid Diagram Generator'

const Settings = {
  endpoint: '',
  apikey: '',
  retries: '3'
}

const InputAreas = {
  system: Defaults.system,
  prompt: '',
  code: ''
}

function App() {
  const [processing, setProcessing] = useState(false)
  const [settings, setSettings] = useLocalStorage('settings', Settings)
  const [inputs, setInputs] = useLocalStorage('inputs', InputAreas)
  const [showModal, setShowModal] = useState(false)
  const [target, setTarget] = useState('')
  const [targetTitle, setTargetTitle] = useState('')

  document.title = TITLE

  const process = async () => {
    if (processing) return
    setProcessing(true)
    try {
      let retries = settings.retries || '3'
      retries = parseInt(retries)
      const resp = await mermaidToSvg('', inputs.system, inputs.prompt, settings.endpoint, settings.apikey, retries)
      const chartContainer = document.getElementById('chart') as unknown as HTMLDivElement
      if (chartContainer) {
        chartContainer.innerHTML = ''
        chartContainer.appendChild(resp.svg)
        setInputs({ ...inputs, code: resp.code })
      }
    } catch (error) {
      console.error('Error generating diagram:', error);
    } finally {
      setProcessing(false)
    }
  }

  const update = async () => {
    alert('Updating diagram from code...')
    if (processing) return
    setProcessing(true)
    try {
      const resp = await mermaidToSvg(inputs.code, '', '', settings.endpoint, settings.apikey)
      const chartContainer = document.getElementById('chart') as unknown as HTMLDivElement
      if (chartContainer) {
        chartContainer.innerHTML = ''
        chartContainer.appendChild(resp.svg)
        setInputs({ ...inputs, code: resp.code })
      }
    } catch (error) {
      console.error('Error generating diagram:', error);
    } finally {
      setProcessing(false)
    }
  }


  return (
    <>
      <header className='flex items-center h-[38px] bg-gray-950 text-white px-2'>
        <h1 className='font-bold text-xl'>{TITLE}</h1>
      </header>
      <section className="flex items-center bg-gray-800 text-white h-[25px] space-x-2 text-sm px-2">
        <label htmlFor="" className='uppercase font-semibold'>Endpoint:</label>
        <input type="password" className='bg-white text-black px-1 outline-none w-80'
          value={settings.endpoint} onChange={(e) => setSettings({ ...settings, endpoint: e.target.value })}
        />
        <label htmlFor="" className='uppercase font-semibold'>API Key:</label>
        <input type="password" className='bg-white text-black px-1 outline-none'
          value={settings.apikey} onChange={(e) => setSettings({ ...settings, apikey: e.target.value })}
        />
        <label htmlFor="" className='uppercase font-semibold'>Retries:</label>
        <input type="text" className='bg-white text-black px-1 outline-none w-12'
          value={settings.retries} onChange={(e) => setSettings({ ...settings, retries: e.target.value })} />
        <button onClick={() => { setSettings(Settings) }} className='bg-red-700 hover:border text-white px-2'>Clear</button>
        <button onClick={() => setShowModal(true)} className='bg-blue-700 hover:border text-white px-2 ml-auto'>Help</button>
      </section>
      <section id="mainarea" className="flex flex-col h-[calc(100vh-25px-38px-25px)]">
        <div className="flex h-[40%] bg-gray-50 p-2">
          <div className="w-1/3 flex flex-col">
            <section className="flex items-center space-x-2">
              <label className='uppercase font-semibold'>System</label>
              <MdOutlineZoomOutMap title='Zoom Out' onClick={() => { setShowModal(true); setTargetTitle('System Prompt'); setTarget('system') }} />
            </section>
            <textarea className='px-1 h-full resize-none outline-none border border-gray-300 w-[98%]'
              value={inputs.system} onChange={(e) => setInputs({ ...inputs, system: e.target.value })}
            />
            <section className="flex items-center space-x-2">
              <label className='uppercase font-semibold'>Prompt</label>
              <MdOutlineZoomOutMap title='Zoom Out' onClick={() => { setShowModal(true); setTargetTitle('Prompt'); setTarget('prompt') }} />
            </section>
            <textarea className='px-1 h-full resize-none outline-none border border-gray-300 w-[98%]'
              value={inputs.prompt} onChange={(e) => setInputs({ ...inputs, prompt: e.target.value })}
            />
            <section className="flex text-sm space-x-1">
              <span className='font-semibold uppercase'>Demos:</span>
              <a href="#" className='text-blue-800'
                onClick={() => setInputs({ ...inputs, prompt: Demos.simple })}>Simple</a> <span>|</span> <a href="#" className='text-blue-800'
                  onClick={() => setInputs({ ...inputs, prompt: Demos.intermediate })}>Intermediate</a> <span>|</span> <a href="#" className='text-blue-800'
                    onClick={() => setInputs({ ...inputs, prompt: Demos.complex })}>Complex</a>
            </section>
            <section className="flex space-x-2 mt-2">
              <button className='bg-blue-500 text-white px-2 ml-1 disabled:bg-blue-300 hover:bg-blue-400' disabled={processing} onClick={process}>Generate</button>
              <button className='bg-gray-300 text-black px-2 disabled:bg-blue-300 hover:bg-gray-200'
                onClick={() => setInputs(InputAreas)} disabled={processing}
              >Reset</button>
            </section>
          </div>
          <div className="w-2/3 flex flex-col">
            <section className="flex items-center space-x-2">
              <label className='uppercase font-semibold'>Mermaid Code</label>
              <MdOutlineZoomOutMap title='Zoom Out' onClick={() => { setShowModal(true); setTargetTitle('Mermaid Code'); setTarget('code') }} />
            </section>
            <textarea className='px-1 h-full bg-gray-100 resize-none outline-none border border-gray-300 rounded'
              value={inputs.code} onChange={(e) => setInputs({ ...inputs, code: e.target.value })}
            />
            <section className="flex mt-2">
              <button className='bg-blue-500 text-white px-2 ml-1 disabled:bg-blue-300 hover:bg-blue-400'
                onClick={update} disabled={processing}
              >Update</button>
            </section>
          </div>
        </div>
        <section className="flex flex-col h-[60%] p-2">
          <label htmlFor="chart" className='uppercase font-semibold mb-6'>Generated Diagram</label>
          <div id="chart" className='h-full p-2 overflow-auto' />
        </section>
      </section>
      <footer className='h-[25px] bg-gray-900 text-white flex items-center px-2 text-sm space-x-2'>
        <span className='uppercase font-semibold'>Status:</span> {processing && <><label className='animate-pulse'>Processing...</label></>}
      </footer>
      {/* Modal */}
      <div className={`${showModal ? 'fixed' : 'hidden'} inset-0 z-50 flex items-center justify-center`} onKeyUp={(e) => { if (e.key === 'Escape') e.preventDefault(); setShowModal(false) }}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black opacity-80" onClick={() => setShowModal(false)}></div>

        {/* Modal Content */}
        <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-3/4 mx-4 flex flex-col h-3/4">
          <h2 className="text-xl font-bold mb-4">Editor - {targetTitle}</h2>
          {target == 'system' &&
            <textarea className="w-full h-full border border-gray-300 rounded p-2 resize-none outline-none"
              value={inputs.system} onChange={(e) => setInputs({ ...inputs, system: e.target.value })}
            />
          }
          {target == 'prompt' &&
            <textarea className="w-full h-full border border-gray-300 rounded p-2 resize-none outline-none"
              value={inputs.prompt} onChange={(e) => setInputs({ ...inputs, prompt: e.target.value })}
            />
          }
          {target == 'code' &&
            <textarea className="w-full h-full border border-gray-300 rounded p-2 resize-none outline-none"
              value={inputs.code} onChange={(e) => setInputs({ ...inputs, code: e.target.value })}
            />
          }
          <div className="flex justify-end space-x-2 mt-4">
            {/* <button
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button> */}
            <button
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>

    </>
  )
}

export default App
