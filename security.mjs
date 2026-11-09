/**
 * Visual threat-to-control explorer.
 * Demonstrates an architectural direction; not a live sensor, policy engine or security product.
 * Threat cases describe hypothetical requirements, never measured incidents.
 */
const threatCases = {
  en: {
    enterprise: {
      title:'Protect enterprise operations',
      subtitle:'Choose a threat example to explore proposed security boundaries.',
      items:[
        ['Privilege misuse','Suspicious privilege change','An elevated identity or role change is proposed inside the enterprise.','Verify authorization','Validate actor identity, least-privilege policy and approval requirements.','Hold and record','Require explicit authorization and preserve a decision trail.'],
        ['Configuration drift','Cloud configuration deviation','A cloud or Kubernetes setting diverges from an approved baseline.','Evaluate change policy','Compare desired state, business risk and remediation authority.','Review remediation','Open an evidence-backed change or request approval for rollback.'],
        ['Incident response','Potential security incident','A correlated signal from existing security tools calls for investigation.','Authorize response','Check incident scope, containment permissions and human escalation.','Coordinate with evidence','Recommend a response plan and record each approved action.']
      ]
    },
    agents: {
      title:'Protect autonomous AI agents',
      subtitle:'Explore risks created by non-human identities that use tools and act on enterprise systems.',
      items:[
        ['Prompt injection','Untrusted instruction attempt','Retrieved content tries to redirect an agent beyond the trusted request.','Separate trust levels','Treat external content as data and independently enforce tool policy.','Reject unsafe instructions','Ignore the injected instruction, escalate if needed and retain evidence.'],
        ['MCP / tool misuse','Unauthorized tool invocation','An agent tries a side-effecting tool action outside its delegated scope.','Check delegated identity','Authorize each tool call by actor, resource, task scope and intent.','Deny and contain','Reject the action, preserve the audit trace and revoke access if warranted.'],
        ['Sensitive data egress','Potential data exfiltration','An agent is asked to send restricted company data to an unapproved destination.','Enforce data policy','Check classification, recipient, purpose and required approval.','Block transmission','Prevent unauthorized egress and preserve reviewable evidence.']
      ]
    }
  },
  es: {
    enterprise: {
      title:'Proteger las operaciones empresariales',
      subtitle:'Selecciona un caso para explorar límites de seguridad propuestos.',
      items:[
        ['Abuso de privilegios','Cambio de privilegios sospechoso','Se propone un cambio en una identidad o rol con privilegios elevados.','Verificar la autorización','Comprobar identidad, mínimo privilegio y requisitos de aprobación.','Retener y registrar','Exigir autorización explícita y conservar evidencia.'],
        ['Desviación de configuración','Desviación en la nube','Un ajuste de nube o Kubernetes se aparta de la configuración aprobada.','Evaluar cambios','Contrastar estado deseado, riesgo y permisos de remediación.','Revisar la remediación','Abrir un cambio documentado o solicitar aprobación para revertir.'],
        ['Respuesta a incidentes','Posible incidente de seguridad','Una señal correlacionada de herramientas existentes requiere investigación.','Autorizar la respuesta','Comprobar alcance, permisos de contención y escalado humano.','Coordinar con evidencia','Recomendar un plan y registrar cada acción aprobada.']
      ]
    },
    agents: {
      title:'Proteger los agentes autónomos',
      subtitle:'Explora riesgos de identidades no humanas con herramientas y acceso a sistemas empresariales.',
      items:[
        ['Inyección de prompts','Instrucción no confiable','El contenido recuperado intenta desviar al agente de una solicitud autorizada.','Separar niveles de confianza','Tratar información externa como datos y aplicar políticas de herramientas por separado.','Rechazar instrucciones inseguras','Ignorar la inyección, escalar cuando proceda y conservar evidencia.'],
        ['Abuso de MCP y herramientas','Invocación no autorizada','Un agente intenta ejecutar una herramienta fuera de su delegación.','Verificar identidad y alcance','Autorizar cada acción por identidad, recurso, tarea y propósito.','Denegar y contener','Rechazar la operación, dejar trazas y revocar permisos si procede.'],
        ['Salida de datos sensibles','Posible exfiltración','Se solicita al agente enviar datos restringidos a un destino no aprobado.','Aplicar política de datos','Verificar clasificación, destinatario, finalidad y aprobaciones.','Bloquear la transmisión','Impedir la salida no autorizada y guardar evidencia.']
      ]
    }
  }
};

let threatPlane = 'enterprise';
let selectedThreat = 0;
function securityExplorerUpdate(){
  const group = threatCases[document.documentElement.lang === 'es' ? 'es' : 'en'];
  const current = group[threatPlane];
  const item = current.items[selectedThreat];
  const fields = [
    ['security-explorer-title',current.title],
    ['security-explorer-subtitle',current.subtitle],
    ['security-signal-title',item[1]], ['security-signal-body',item[2]],
    ['security-gate-title',item[3]], ['security-gate-body',item[4]],
    ['security-outcome-title',item[5]], ['security-outcome-body',item[6]]
  ];
  fields.forEach(([id,value])=>{document.getElementById(id).textContent=value;});
  document.querySelectorAll('.security-domain-card').forEach(button=>{
    const active=button.dataset.securityPlane===threatPlane;
    button.classList.toggle('active',active);
    button.setAttribute('aria-selected',String(active));
    button.tabIndex=active?0:-1;
  });
  document.getElementById('security-explorer').setAttribute('aria-labelledby',
    threatPlane==='enterprise'?'security-enterprise-tab':'security-agents-tab');
  document.querySelectorAll('.security-threat').forEach((button,index)=>{
    button.textContent=current.items[index][0];
    const active=index===selectedThreat;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  document.querySelector('.security-threats').classList.toggle('agent-mode',threatPlane==='agents');
}
const planeTabs=[...document.querySelectorAll('.security-domain-card')];
planeTabs.forEach((button,index)=>{
  button.addEventListener('click',()=>{
    threatPlane=button.dataset.securityPlane;selectedThreat=0;securityExplorerUpdate();
  });
  button.addEventListener('keydown',(event)=>{
    let next;
    if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%planeTabs.length;
    else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index+planeTabs.length-1)%planeTabs.length;
    else if(event.key==='Home')next=0;
    else if(event.key==='End')next=planeTabs.length-1;
    else return;
    event.preventDefault();planeTabs[next].focus();planeTabs[next].click();
  });
});
document.querySelectorAll('.security-threat').forEach(button=>{
  button.addEventListener('click',()=>{
    selectedThreat=Number(button.dataset.securityCase);securityExplorerUpdate();
  });
});
window.addEventListener('daedoryx:language',securityExplorerUpdate);
securityExplorerUpdate();
