import { useState } from 'react'
import { mermaidToSvg, useLocalStorage } from './services'

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
        <input type="password" className='bg-white text-black px-1 outline-none w-80' name="" id=""
          value={settings.endpoint} onChange={(e) => setSettings({ ...settings, endpoint: e.target.value })}
        />
        <label htmlFor="" className='uppercase font-semibold'>API Key:</label>
        <input type="password" className='bg-white text-black px-1 outline-none' name="" id=""
          value={settings.apikey} onChange={(e) => setSettings({ ...settings, apikey: e.target.value })}
        />
        <label htmlFor="" className='uppercase font-semibold'>Retries:</label>
        <input type="text" className='bg-white text-black px-1 outline-none w-12'
          value={settings.retries} name="" id="" onChange={(e) => setSettings({ ...settings, retries: e.target.value })} />
        <button onClick={() => { setSettings(Settings) }} className='bg-red-700 hover:border text-white px-2'>Clear</button>
      </section>
      <section className="flex flex-col h-[calc(100vh-25px-38px-25px)]">
        <div className="flex h-[40%] bg-gray-50 p-2">
          <div className="w-1/3 flex flex-col">
            <label className='uppercase font-semibold'>System</label>
            <textarea className='px-1 h-full resize-none outline-none border border-gray-300 w-[98%]'
              value={inputs.system} onChange={(e) => setInputs({ ...inputs, system: e.target.value })}
            />
            <label className='mt-2 uppercase font-semibold'>Prompt</label>
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
            <label className='uppercase font-semibold'>Mermaid Code</label>
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

    </>
  )
}

export default App
