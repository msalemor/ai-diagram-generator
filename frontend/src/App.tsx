import { useState } from 'react'
//import { MermaidDiagram } from './components/MermaidDiagram';
import { completion, useLocalStorage } from './services';
//import Mermaid from './components/Mermaid';
import { Mermaid2 } from './components/Mermaid2';


const Defaults = {
  system: `You are a Mermaid diagram generator for system design architecture.
Goals:
- Do not simplify. The goal is to visualize a production-grade, secure, and scalable Azure architecture.
- Validate the generated code to make sure that it will render correctly.
Rules:
- Use one color in an elegant way.
- For the color styles, use classes.
- No epilogue or prologue.
- When appropriate, add labels between components.
Output
- Output the mermaid diagram code only without the markdown text block.`
}

const Settings = {
  endpoint: '',
  apiKey: '',
}

const Demos = {
  simple: `Create a graph diagram of a user making an HTTP request to an Azure App Service over Azure Front Door.`,
  mid: `Create a graph diagram of a user making an HTTP request to an Azure App Service over Azure Front Door. The App Service calls an Azure SQL Database over a private endpoint. The user should be a blue circle. The private endpoint should be in its own sub-diagram in a VNET. The Azure SQL Database should not be in the sub-diagram. Arrows should be bi-directional.`,
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

function App() {
  const [settings, setSettings] = useLocalStorage('settings', Settings);
  const [code, setCode] = useState('');
  const [finalCode, setFinalCode] = useState('graph LR');
  const [error, setError] = useState('');
  const [system, setSystem] = useLocalStorage('system', Defaults.system);
  const [prompt, setPrompt] = useLocalStorage('prompt', '');
  const [processing, setProcessing] = useState(false);

  const processCompletion = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      setError('');
      setFinalCode('graph LR');
      const resp = await completion(settings.endpoint,
        settings.apiKey,
        [{ role: 'system', content: system },
        { role: 'user', content: prompt }]);
      setCode(resp);
      setFinalCode(resp);
    } finally {
      setProcessing(false);
    }
  }

  const manualProcess = () => {
    setFinalCode(code);
  }

  // Export the rendered Mermaid SVG as a PNG image
  const DownloadSvgAsPng = async () => {
    const svgElement = document.querySelector('svg-mermaid');
    if (!svgElement) {
      setError('No diagram to export');
      return;
    }

    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Handle CORS if necessary

      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = 'diagram.png';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(pngUrl);
          }
        }, 'image/png');
      };

      img.src = url;
    } catch (err) {
      setError('Failed to export diagram: ' + err);
    }
  };


  return (
    <>
      <header className='flex h-[35px] items-center bg-slate-900 text-white px-1'>
        <h1 className='text-xl font-bold'>AI Diagram builder</h1>
      </header>
      <section className='flex h-[30px] items-center bg-slate-800 px-1 text-white space-x-1'>
        <label className=''>Endpoint</label>
        <input type='password' id='endpoint' className='bg-white text-black w-60'
          value={settings.endpoint}
          onChange={(e) => setSettings({ ...settings, endpoint: e.target.value })}
        />
        <label>API Key</label>
        <input type='password' id='apikey' className='bg-white text-black w-40'
          value={settings.apiKey}
          onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
        />
        <button className='bg-orange-600 text-white px-2'>Reset</button>
      </section>
      <div className='flex h-[calc(100vh-35px-30px-28px)]'>
        <aside className='w-1/3 h-full flex flex-col p-1'>
          <label className='uppercase font-semibold'>System Instructions</label>
          <textarea id='systemRole' className='h-1/3 resize-none outline-none border px-1'
            value={system}
            onChange={(e) => setSystem(e.target.value)}
          ></textarea>
          <label className='uppercase font-semibold mt-3'>Prompt</label>
          <span>Demos: <a href='#' className='text-blue-700 hover:underline'
            onClick={(e) => { e.preventDefault(); setPrompt(Demos.simple); }}
          >Simple</a> |
            &nbsp;<a href='#' className='text-blue-700 hover:underline'
              onClick={(e) => { e.preventDefault(); setPrompt(Demos.mid); }}
            >Intermediate</a> |
            &nbsp;<a href='#' className='text-blue-700 hover:underline'
              onClick={(e) => { e.preventDefault(); setPrompt(Demos.complex); }}
            >Complex</a></span>
          <textarea className='h-full resize-none outline-none border px-1'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          ></textarea>
          <div className="flex space-x-1 mt-1">
            <button className='bg-blue-500 text-white px-2 py-1 rounded'
              onClick={processCompletion}
              disabled={processing}
            >Generate</button>
            <button className='bg-gray-300 text-black px-2 py-1 rounded'
              onClick={() => { setCode(''); setPrompt(''); setFinalCode('graph LR'); setError(''); setSystem(Defaults.system); }}
            >Reset</button>
          </div>
        </aside>
        <div className='flex flex-col w-2/3 h-full'>
          <div className="flex h-1/3 p-1">
            <div className={'flex flex-col ' + (!!error ? 'w-2/3' : 'w-full')}>
              <label className='uppercase font-semibold'>Mermaid code</label>
              <textarea className='h-full resize-none outline-none border px-1'
                value={code}
                onChange={(e) => setCode(e.target.value)}
              ></textarea>
            </div>
            <div className={"flex flex-col w-1/3 h-full " + (!!error ? '' : 'hidden')}>
              <label htmlFor="Error">Error</label>
              <div id="error" className='overflow-auto h-full bg-slate-100'>
                {error}
              </div>
            </div>
          </div>
          <div className='flex flex-col h-2/3 p-2'>
            <div className="flex space-x-2">
              <button className='bg-blue-500 text-white rounded px-2'
                onClick={manualProcess}
              >Update</button>
              <button className='bg-blue-500 text-white rounded px-2'
                onClick={DownloadSvgAsPng}
              >Export</button>
            </div>
            <label className='uppercase font-semibold mb-4'>Diagram</label>
            <div className='h-full overflow-auto'>
              {/* <MermaidDiagram onError={(error) => { console.error(error); setError(error.toString()) }}>{finalCode}</MermaidDiagram> */}
              <Mermaid2 className='d-mermaid' chart={finalCode} props={null} onError={(error) => { console.error(error); setError(error.toString()) }} />
            </div>
          </div>
        </div>
      </div>
      <footer className='flex h-[28px] items-center bg-slate-900 text-white px-1'>
        {processing && <span>processing</span>}
      </footer>
    </>
  )
}

export default App;

