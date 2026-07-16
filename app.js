// app.js
const { useState, useEffect, useMemo } = React;

// Property Values and Commissions for Statistics
const PROPERTY_METRICS = {
  'Econômico / Popular - MCMV (até R$350 mil)': { value: 250000, commission: 12500, label: 'Econômico / Popular', color: 'border-blue-500/50 text-blue-400 bg-blue-500/10' },
  'Médio Padrão (R$400 mil a R$800 mil)': { value: 600000, commission: 30000, label: 'Médio Padrão', color: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' },
  'Alto Padrão / Altíssimo Padrão (R$900 mil a R$5MM)': { value: 2000000, commission: 100000, label: 'Alto / Altíssimo Padrão', color: 'border-amber-500/50 text-amber-400 bg-amber-500/10' },
  'Luxo (a partir de R$10MM)': { value: 12000000, commission: 600000, label: 'Luxo', color: 'border-purple-500/50 text-purple-400 bg-purple-500/10' }
};

const KANBAN_STAGES = [
  { id: 'Novo', label: 'Novos Leads', color: 'border-t-blue-500 bg-blue-500/5' },
  { id: 'Em Atendimento', label: 'Em Atendimento', color: 'border-t-amber-500 bg-amber-500/5' },
  { id: 'Visita Agendada', label: 'Visita Agendada', color: 'border-t-purple-500 bg-purple-500/5' },
  { id: 'Proposta', label: 'Proposta Enviada', color: 'border-t-pink-500 bg-pink-500/5' },
  { id: 'Ganho', label: 'Negócio Fechado', color: 'border-t-emerald-500 bg-emerald-500/5' },
  { id: 'Perdido', label: 'Arquivado/Perdido', color: 'border-t-rose-500 bg-rose-500/5' }
];

// Default mockup leads to populate Kanban on first load
const DEFAULT_LEADS = [
  {
    id: 'lead-1',
    name: 'Ana Paula Vasconcelos',
    email: 'anapaula.v@gmail.com',
    phone: '(11) 98765-4321',
    propertyInterest: 'Luxo/Superluxo - Acima de R$2 milhões',
    contactMethod: 'WhatsApp',
    urgency: 'Imediato',
    message: 'Gostaria de agendar visita na cobertura duplex dos Jardins.',
    notes: 'Cliente super interessada. Possui imóvel comercial como permuta.',
    stage: 'Novo',
    date: '2026-06-15T10:30:00.000Z'
  },
  {
    id: 'lead-2',
    name: 'Carlos Henrique Silva',
    email: 'carlos.h@incorporadora.com',
    phone: '(21) 99876-5432',
    propertyInterest: 'Alto Padrão - R$900 mil a R$2 milhões',
    contactMethod: 'Telefone',
    urgency: 'Em até 3 meses',
    message: 'Procuro apartamento de 3 dormitórios na Barra da Tijuca.',
    notes: 'Ligação feita em 14/06. Prefere contatos à tarde.',
    stage: 'Em Atendimento',
    date: '2026-06-14T14:15:00.000Z'
  },
  {
    id: 'lead-3',
    name: 'Mariana Souza Dias',
    email: 'mariana.souza@yahoo.com',
    phone: '(31) 97765-4321',
    propertyInterest: 'Médio Padrão - R$500 mil a R$800 mil',
    contactMethod: 'WhatsApp',
    urgency: 'Imediato',
    message: 'Solicito simulação de financiamento bancário para imóvel MCMV premium.',
    notes: 'Visita agendada para sábado às 10h da manhã no decorado.',
    stage: 'Visita Agendada',
    date: '2026-06-13T09:00:00.000Z'
  },
  {
    id: 'lead-4',
    name: 'Roberto Alves de Toledo',
    email: 'roberto.alves@uol.com.br',
    phone: '(19) 96543-2109',
    propertyInterest: 'MCMV - Até R$500mil',
    contactMethod: 'E-mail',
    urgency: 'Apenas pesquisando',
    message: 'Quero conhecer os decorados da região central.',
    notes: 'Proposta enviada pelo banco aprovada. Aguardando assinatura.',
    stage: 'Proposta',
    date: '2026-06-12T16:45:00.000Z'
  }
];

// Utility: format Currency to BRL
const formatBRL = (val) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

// Utility: format Phone mask dynamically
const formatPhoneMask = (val) => {
  if (!val) return '';
  const clean = val.replace(/\D/g, '');
  if (clean.length <= 2) return `(${clean}`;
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
};

function App() {
  // Navigation & Security state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // CRM Leads State
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('acelera_leads');
    return saved ? JSON.parse(saved) : DEFAULT_LEADS;
  });

  // Landing Page Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formInterest, setFormInterest] = useState('MCMV - Até R$500mil');
  const [formContact, setFormContact] = useState('WhatsApp');
  const [formUrgency, setFormUrgency] = useState('Imediato');
  const [formMessage, setFormMessage] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Kanban Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInterest, setFilterInterest] = useState('Todos');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'name'

  // Kanban CRM Detail View and Manual Add Lead Modals
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [activeDragStage, setActiveDragStage] = useState(null);

  // Sync leads with LocalStorage
  useEffect(() => {
    localStorage.setItem('acelera_leads', JSON.stringify(leads));
  }, [leads]);

  // Integration config state
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('acelera_config');
    return saved ? JSON.parse(saved) : {
      whatsappNumber: '5511999999999', // Padrão
      formspreeId: 'YOUR_FORMSPREE_ID' // Padrão
    };
  });
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Sync config with LocalStorage
  useEffect(() => {
    localStorage.setItem('acelera_config', JSON.stringify(config));
  }, [config]);

  // Clean success alert after 8 seconds
  useEffect(() => {
    if (formSuccess) {
      const timer = setTimeout(() => setFormSuccess(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [formSuccess]);

  // Handle PIN admin authorization
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === '1234') {
      setIsAdmin(true);
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  // Lead Form capture handler
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formName.trim()) errors.name = 'Nome completo é obrigatório';
    if (!formEmail.trim() || !/\S+@\S+\.\S+/.test(formEmail)) errors.email = 'E-mail válido é obrigatório';
    
    const cleanPhone = formPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) errors.phone = 'Telefone válido com DDD é obrigatório';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const newLead = {
      id: `lead-${Date.now()}`,
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone,
      propertyInterest: formInterest,
      contactMethod: formContact,
      urgency: formUrgency,
      message: formMessage.trim(),
      notes: '',
      stage: 'Novo',
      date: new Date().toISOString()
    };

    setLeads(prev => [newLead, ...prev]);
    setFormSuccess(true);

    // 1. Enviar para o Formspree (E-mail) se configurado
    if (config.formspreeId && config.formspreeId !== 'YOUR_FORMSPREE_ID') {
      fetch(`https://formspree.io/f/${config.formspreeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: newLead.name,
          email: newLead.email,
          telefone: newLead.phone,
          interesse_imovel: newLead.propertyInterest,
          preferencia_contato: newLead.contactMethod,
          urgencia_compra: newLead.urgency,
          mensagem: newLead.message || 'Sem observações adicionais.'
        })
      }).catch(err => console.error('Erro ao enviar dados para o Formspree:', err));
    }

    // 2. Redirecionar para o WhatsApp do Corretor
    if (config.whatsappNumber) {
      const msg = `Olá! Acabei de me cadastrar no site Acelera Imob. Seguem meus dados:\n\n` +
        `*Nome:* ${newLead.name}\n` +
        `*E-mail:* ${newLead.email}\n` +
        `*Telefone:* ${newLead.phone}\n` +
        `*Perfil de Imóvel:* ${newLead.propertyInterest}\n` +
        `*Contato Preferencial:* ${newLead.contactMethod}\n` +
        `*Urgência de Compra:* ${newLead.urgency}\n` +
        `*Mensagem:* ${newLead.message || 'Nenhuma mensagem adicional.'}`;
      
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${config.whatsappNumber.replace(/\D/g, '')}&text=${encodeURIComponent(msg)}`;
      window.open(whatsappUrl, '_blank');
    }
    
    // Reset inputs
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormInterest('MCMV - Até R$500mil');
    setFormContact('WhatsApp');
    setFormUrgency('Imediato');
    setFormMessage('');
  };

  // Admin Manual Lead creation handler
  const handleAddManualLead = (newLeadData) => {
    const newLead = {
      id: `lead-${Date.now()}`,
      ...newLeadData,
      notes: '',
      date: new Date().toISOString()
    };
    setLeads(prev => [newLead, ...prev]);
    setShowAddLeadModal(false);
  };

  // Delete Lead
  const handleDeleteLead = (id) => {
    if (confirm('Tem certeza que deseja excluir este lead?')) {
      setLeads(prev => prev.filter(l => l.id !== id));
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead(null);
      }
    }
  };

  // Update Lead notes or stage inside modal
  const handleUpdateLeadDetails = (updatedLead) => {
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    setSelectedLead(updatedLead);
  };

  // Move lead stage (CRM drop or click actions)
  const moveLeadStage = (leadId, targetStage) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return { ...lead, stage: targetStage };
      }
      return lead;
    }));
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e, leadId) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    setDraggedLeadId(null);
    setActiveDragStage(null);
    e.target.classList.remove('dragging');
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    if (activeDragStage !== stageId) {
      setActiveDragStage(stageId);
    }
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    if (draggedLeadId) {
      moveLeadStage(draggedLeadId, stageId);
    }
    setDraggedLeadId(null);
    setActiveDragStage(null);
  };

  // Export Leads to CSV
  const handleExportCSV = () => {
    const headers = ['Data', 'Nome', 'E-mail', 'Telefone', 'Interesse de Imovel', 'Contato Preferido', 'Urgencia', 'Estagio', 'Observacoes', 'Mensagem'];
    const csvRows = [headers.join(',')];

    leads.forEach(lead => {
      const row = [
        new Date(lead.date).toLocaleDateString('pt-BR'),
        `"${lead.name.replace(/"/g, '""')}"`,
        `"${lead.email.replace(/"/g, '""')}"`,
        `"${lead.phone.replace(/"/g, '""')}"`,
        `"${lead.propertyInterest.replace(/"/g, '""')}"`,
        `"${lead.contactMethod.replace(/"/g, '""')}"`,
        `"${lead.urgency.replace(/"/g, '""')}"`,
        `"${lead.stage.replace(/"/g, '""')}"`,
        `"${(lead.notes || '').replace(/"/g, '""')}"`,
        `"${(lead.message || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvRows.join('\n'));
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', csvContent);
    downloadLink.setAttribute('download', `leads_acelera_imob_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Filtering and Sorting logic for Kanban Board Display
  const filteredLeads = useMemo(() => {
    return leads
      .filter(lead => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = lead.name.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.phone.includes(query);
        
        const matchesInterest = filterInterest === 'Todos' || lead.propertyInterest === filterInterest;
        
        return matchesSearch && matchesInterest;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.date) - new Date(a.date);
        } else if (sortBy === 'oldest') {
          return new Date(a.date) - new Date(b.date);
        } else if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [leads, searchQuery, filterInterest, sortBy]);

  // Statistics calculation for Dashboard
  const dashboardStats = useMemo(() => {
    let pipelineTotal = 0;
    let commissionTotal = 0;
    let wonLeads = 0;
    let closedLeads = 0; // Won + Lost

    leads.forEach(lead => {
      const metric = PROPERTY_METRICS[lead.propertyInterest];
      if (metric) {
        if (lead.stage !== 'Perdido') {
          pipelineTotal += metric.value;
          commissionTotal += metric.commission;
        }
        if (lead.stage === 'Ganho') {
          wonLeads += 1;
          closedLeads += 1;
        }
        if (lead.stage === 'Perdido') {
          closedLeads += 1;
        }
      }
    });

    const conversionRate = closedLeads > 0 ? (wonLeads / closedLeads) * 100 : 0;

    return {
      totalLeads: leads.length,
      pipelineValue: formatBRL(pipelineTotal),
      commissionValue: formatBRL(commissionTotal),
      conversionRate: conversionRate.toFixed(1) + '%'
    };
  }, [leads]);

  return (
    <div className="relative min-h-screen bg-brand-bg bg-grid-pattern text-gray-100 font-sans select-none pb-12">
      
      {/* ---------------- CABEÇALHO PRINCIPAL ---------------- */}
      <header className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-brand-border/60">
        <div className="flex items-center select-none">
          <img src="logo.png" alt="Blueprint Mídia" className="h-12 w-auto object-contain" />
        </div>

        {/* Admin Navigation Button */}
        <div>
          {isAdmin ? (
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline text-xs font-semibold text-brand-green bg-brand-green/10 border border-brand-green/20 rounded-full px-3 py-1.5 uppercase tracking-widest">
                Painel Conectado
              </span>
              <button
                onClick={() => setIsAdmin(false)}
                className="bg-brand-card hover:bg-brand-cardHover border border-brand-border text-white text-xs font-bold font-outfit uppercase py-2.5 px-4 rounded-xl transition-all flex items-center space-x-2 shadow-sm"
              >
                <span>Voltar para Site</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <a
                href="index.html"
                className="bg-brand-card hover:bg-brand-cardHover border border-brand-border text-white text-xs font-bold font-outfit uppercase py-2.5 px-4 rounded-xl transition-all"
              >
                Simulador de Vendas
              </a>
              <button
                onClick={() => setShowPinModal(true)}
                className="bg-gradient-to-r from-brand-cyan/20 to-brand-cyan/5 hover:from-brand-cyan/30 border border-brand-cyan text-brand-cyan text-xs font-bold font-outfit uppercase py-2.5 px-5 rounded-xl transition-all shadow-glow-cyan tracking-wider"
              >
                Área Administrativa
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ---------------- CONTEÚDO PRINCIPAL ---------------- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* VISTA 1: LANDING PAGE DE CAPTURA (PÚBLICO) */}
        {!isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Esquerda: Hero Info Text */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-bold font-outfit uppercase py-1.5 px-3 rounded-full tracking-wider animate-bounce">
                <span>⚡ Oportunidade Exclusiva</span>
              </div>
              <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl leading-tight text-white">
                Seu próximo imóvel está a <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-green">
                  um clique de distância.
                </span>
              </h1>
              <p className="text-base text-brand-textMuted leading-relaxed max-w-lg">
                Cadastre seus dados e receba uma curadoria exclusiva dos imóveis mais adequados ao seu perfil de investimento, com atendimento especializado e resposta imediata.
              </p>
              
              {/* Feature grid */}
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="glass-card rounded-xl p-4 border-l-4 border-brand-cyan shadow-sm">
                  <h4 className="font-outfit font-bold text-white text-sm">Portfólio Premium</h4>
                  <p className="text-xs text-brand-textMuted mt-1">Acesso a imóveis fora do mercado comum (off-market).</p>
                </div>
                <div className="glass-card rounded-xl p-4 border-l-4 border-brand-green shadow-sm">
                  <h4 className="font-outfit font-bold text-white text-sm">Resposta Rápida</h4>
                  <p className="text-xs text-brand-textMuted mt-1">Atendimento humanizado em menos de 10 minutos via WhatsApp.</p>
                </div>
              </div>
            </div>

            {/* Direita: Formulário de Captura */}
            <div className="lg:col-span-6">
              {formSuccess ? (
                <div className="glass-card rounded-2xl p-8 border border-brand-green/30 text-center space-y-6 shadow-glow-green animate-pulse-cyan">
                  <div className="w-16 h-16 rounded-full bg-brand-green/20 border-2 border-brand-green flex items-center justify-center mx-auto text-brand-green shadow-glow-green">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="font-outfit font-bold text-2xl text-white">Cadastro Confirmado!</h3>
                  <p className="text-brand-textMuted text-sm max-w-sm mx-auto">
                    Excelente escolha! Um consultor especializado da nossa equipe já recebeu seus dados e entrará em contato em breve para apresentar as melhores opções.
                  </p>
                  <button
                    onClick={() => setFormSuccess(false)}
                    className="w-full bg-brand-card hover:bg-brand-cardHover border border-brand-border text-white text-sm font-bold uppercase py-3.5 px-6 rounded-xl transition-all"
                  >
                    Fazer Novo Cadastro
                  </button>
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 border border-brand-border hover:border-brand-cyan/20 transition-all duration-300">
                  <div>
                    <h3 className="font-outfit font-bold text-xl text-white">Demonstrar Interesse</h3>
                    <p className="text-xs text-brand-textMuted mt-1">Insira seus dados abaixo para receber nossa curadoria.</p>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    {/* Nome */}
                    <div>
                      <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-1.5">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: João da Silva Santos"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className={`w-full bg-brand-bg/80 border ${formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-brand-border focus:border-brand-cyan'} rounded-xl py-3 px-4 text-white placeholder-brand-textMuted/40 focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-all`}
                      />
                      {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* E-mail */}
                      <div>
                        <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-1.5">
                          E-mail
                        </label>
                        <input
                          type="email"
                          placeholder="Ex: joao@email.com"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          className={`w-full bg-brand-bg/80 border ${formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-brand-border focus:border-brand-cyan'} rounded-xl py-3 px-4 text-white placeholder-brand-textMuted/40 focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-all`}
                        />
                        {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                      </div>

                      {/* Telefone */}
                      <div>
                        <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-1.5">
                          Telefone (WhatsApp)
                        </label>
                        <input
                          type="tel"
                          placeholder="Ex: (11) 99999-9999"
                          value={formPhone}
                          onChange={(e) => setFormPhone(formatPhoneMask(e.target.value))}
                          className={`w-full bg-brand-bg/80 border ${formErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-brand-border focus:border-brand-cyan'} rounded-xl py-3 px-4 text-white placeholder-brand-textMuted/40 focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-all`}
                        />
                        {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Faixa de Interesse */}
                      <div>
                        <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-1.5">
                          Perfil de Imóvel
                        </label>
                        <select
                          value={formInterest}
                          onChange={(e) => setFormInterest(e.target.value)}
                          className="w-full bg-brand-bg/80 border border-brand-border focus:border-brand-cyan rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-all"
                        >
                          <option value="MCMV - Até R$500mil">Minha Casa Minha Vida</option>
                          <option value="Médio Padrão - R$500 mil a R$800 mil">Médio Padrão (R$500k a R$800k)</option>
                          <option value="Alto Padrão - R$900 mil a R$2 milhões">Alto Padrão (R$900k a R$2M)</option>
                          <option value="Luxo/Superluxo - Acima de R$2 milhões">Luxo / Superluxo (Acima de R$2M)</option>
                        </select>
                      </div>

                      {/* Canal de Contato */}
                      <div>
                        <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-1.5">
                          Contato Preferencial
                        </label>
                        <select
                          value={formContact}
                          onChange={(e) => setFormContact(e.target.value)}
                          className="w-full bg-brand-bg/80 border border-brand-border focus:border-brand-cyan rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-all"
                        >
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Telefone">Ligação Telefônica</option>
                          <option value="E-mail">E-mail</option>
                        </select>
                      </div>
                    </div>

                    {/* Urgência da compra */}
                    <div>
                      <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-2">
                        Quando planeja comprar?
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Imediato', 'Em até 3 meses', 'Apenas pesquisando'].map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setFormUrgency(item)}
                            className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all ${formUrgency === item ? 'border-brand-cyan bg-brand-cyan/15 text-white shadow-glow-cyan' : 'border-brand-border bg-brand-bg/40 text-brand-textMuted hover:text-white'}`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mensagem Opcional */}
                    <div>
                      <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-1.5">
                        Mensagem / Detalhes Adicionais (Opcional)
                      </label>
                      <textarea
                        rows="3"
                        placeholder="Ex: Procuro imóvel com área de lazer integrada ou próximo a escolas..."
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        className="w-full bg-brand-bg/80 border border-brand-border focus:border-brand-cyan rounded-xl py-3 px-4 text-white placeholder-brand-textMuted/40 focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-all"
                      ></textarea>
                    </div>

                    {/* Botão de Enviar */}
                    <button
                      type="submit"
                      className="w-full mt-2 bg-gradient-to-r from-brand-cyan to-brand-green hover:shadow-glow-cyan-lg text-brand-bg text-sm font-black uppercase py-4 px-6 rounded-xl transition-all shadow-glow-cyan"
                    >
                      Enviar Informações
                    </button>
                  </form>
                </div>
              )}
            </div>

          </div>
        )}

        {/* VISTA 2: PAINEL DE LEADS KANBAN (ADMIN) */}
        {isAdmin && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Dashboard Stats Panel */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card rounded-2xl p-5 border border-brand-border shadow-sm flex flex-col justify-between">
                <span className="text-xs text-brand-textMuted uppercase font-bold tracking-wider">Total de Leads</span>
                <span className="text-3xl font-extrabold font-outfit text-white mt-2">{dashboardStats.totalLeads}</span>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-brand-border shadow-sm flex flex-col justify-between">
                <span className="text-xs text-brand-cyan uppercase font-bold tracking-wider">Valor do Pipeline</span>
                <span className="text-3xl font-extrabold font-outfit text-brand-cyan mt-2">{dashboardStats.pipelineValue}</span>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-brand-border shadow-sm flex flex-col justify-between">
                <span className="text-xs text-brand-green uppercase font-bold tracking-wider">Comissão Estimada</span>
                <span className="text-3xl font-extrabold font-outfit text-brand-green mt-2">{dashboardStats.commissionValue}</span>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-brand-border shadow-sm flex flex-col justify-between">
                <span className="text-xs text-amber-500 uppercase font-bold tracking-wider">Taxa de Conversão</span>
                <span className="text-3xl font-extrabold font-outfit text-amber-500 mt-2">{dashboardStats.conversionRate}</span>
              </div>
            </div>

            {/* Filters and Actions Bar */}
            <div className="glass-card rounded-2xl p-5 border border-brand-border flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                
                {/* Search Inputs */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Pesquisar por nome ou e-mail..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 bg-brand-bg border border-brand-border focus:border-brand-cyan rounded-xl py-2.5 pl-4 pr-10 text-xs text-white placeholder-brand-textMuted/50 focus:outline-none transition-all"
                  />
                  <div className="absolute right-3.5 top-3 text-brand-textMuted/65">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>

                {/* Filter Profile Property */}
                <select
                  value={filterInterest}
                  onChange={(e) => setFilterInterest(e.target.value)}
                  className="bg-brand-bg border border-brand-border focus:border-brand-cyan rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Todos">Todos os Perfis</option>
                  <option value="MCMV - Até R$500mil">Minha Casa Minha Vida</option>
                  <option value="Médio Padrão - R$500 mil a R$800 mil">Médio Padrão</option>
                  <option value="Alto Padrão - R$900 mil a R$2 milhões">Alto Padrão</option>
                  <option value="Luxo/Superluxo - Acima de R$2 milhões">Luxo / Superluxo</option>
                </select>

                {/* Sort logic */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-brand-bg border border-brand-border focus:border-brand-cyan rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none transition-all cursor-pointer"
                >
                  <option value="newest">Mais Recentes</option>
                  <option value="oldest">Mais Antigos</option>
                  <option value="name">Ordem Alfabética</option>
                </select>
              </div>

              {/* CRM Actions */}
              <div className="flex space-x-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="bg-brand-card hover:bg-brand-cardHover border border-brand-border hover:border-brand-cyan/25 py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all flex items-center space-x-2 shadow-sm"
                  title="Configurações de Integração"
                >
                  <svg className="w-4 h-4 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span className="hidden sm:inline">Integrações</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="bg-brand-card hover:bg-brand-cardHover border border-brand-border hover:border-brand-cyan/25 py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all flex items-center space-x-2 shadow-sm"
                >
                  <svg className="w-4 h-4 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span>Exportar CSV</span>
                </button>
                <button
                  onClick={() => setShowAddLeadModal(true)}
                  className="bg-gradient-to-tr from-brand-cyan to-brand-green hover:shadow-glow-cyan text-brand-bg py-2.5 px-4 rounded-xl text-xs font-black uppercase transition-all flex items-center space-x-2"
                >
                  <svg className="w-4 h-4 text-brand-bg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <span>Adicionar Lead</span>
                </button>
              </div>
            </div>

            {/* Kanban Scrollable Board Column View */}
            <div className="kanban-board-container overflow-x-auto pb-4 flex gap-4 items-start select-none">
              {KANBAN_STAGES.map((stage) => {
                const stageLeads = filteredLeads.filter(l => l.stage === stage.id);
                const isDragOver = activeDragStage === stage.id;
                
                return (
                  <div
                    key={stage.id}
                    onDragOver={(e) => handleDragOver(e, stage.id)}
                    onDrop={(e) => handleDrop(e, stage.id)}
                    className={`flex-shrink-0 w-80 rounded-2xl border border-brand-border border-t-4 ${stage.color} p-4 kanban-column ${isDragOver ? 'drag-over' : ''} space-y-4`}
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
                      <span className="font-outfit font-bold text-sm text-white tracking-wide uppercase">
                        {stage.label}
                      </span>
                      <span className="text-xs font-black bg-brand-bg border border-brand-border text-brand-cyan rounded-full px-2.5 py-0.5 shadow-sm">
                        {stageLeads.length}
                      </span>
                    </div>

                    {/* Leads Cards List */}
                    <div className="space-y-3 min-h-[400px] overflow-y-auto max-h-[600px] pr-1">
                      {stageLeads.length === 0 ? (
                        <div className="flex items-center justify-center min-h-[120px] rounded-xl border border-dashed border-brand-border/50 text-center">
                          <p className="text-[11px] text-brand-textMuted/60 uppercase font-semibold">Arraste um card aqui</p>
                        </div>
                      ) : (
                        stageLeads.map((lead) => {
                          const metric = PROPERTY_METRICS[lead.propertyInterest];
                          return (
                            <div
                              key={lead.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, lead.id)}
                              onDragEnd={handleDragEnd}
                              className="glass-card rounded-xl p-4 border border-brand-border hover:border-brand-cyan/40 kanban-card shadow-sm hover:shadow-glow-cyan transition-all duration-200"
                            >
                              <div className="flex items-start justify-between">
                                {/* Lead Tag Profile */}
                                <span className={`text-[9px] font-bold uppercase border rounded px-1.5 py-0.5 tracking-wider ${metric ? metric.color : 'text-gray-300'}`}>
                                  {metric ? metric.label : 'Indefinido'}
                                </span>
                                
                                {/* Quick Menu Delete */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead.id); }}
                                  className="text-brand-textMuted/40 hover:text-red-500 transition-colors"
                                  title="Excluir Lead"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                  </svg>
                                </button>
                              </div>

                              {/* Lead Details */}
                              <h4 className="font-outfit font-bold text-white text-sm mt-3.5 tracking-wide leading-tight">
                                {lead.name}
                              </h4>
                              
                              <p className="text-[11px] text-brand-textMuted mt-1 flex items-center space-x-1.5">
                                <span className="text-[10px] opacity-75 font-semibold">📞 {lead.phone}</span>
                                <span className="opacity-40">|</span>
                                <span className="text-[10px] text-brand-cyan font-bold">{lead.contactMethod}</span>
                              </p>

                              {/* Footer information */}
                              <div className="flex items-center justify-between border-t border-brand-border/30 mt-4 pt-3">
                                <span className="text-[9px] text-brand-textMuted/80 font-medium">
                                  {new Date(lead.date).toLocaleDateString('pt-BR')}
                                </span>

                                {/* Quick Stage Movement controls (mobile-friendly buttons) */}
                                <div className="flex items-center space-x-1.5">
                                  <button
                                    onClick={() => setSelectedLead(lead)}
                                    className="p-1 text-brand-textMuted/70 hover:text-brand-cyan transition-colors"
                                    title="Ver Detalhes"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                  </button>

                                  {/* Mobile quick shift buttons */}
                                  <div className="flex border border-brand-border/60 rounded-lg overflow-hidden bg-brand-bg">
                                    <button
                                      disabled={stage.id === 'Novo'}
                                      onClick={() => {
                                        const prevIndex = KANBAN_STAGES.findIndex(s => s.id === stage.id) - 1;
                                        if (prevIndex >= 0) moveLeadStage(lead.id, KANBAN_STAGES[prevIndex].id);
                                      }}
                                      className="p-1 px-1.5 text-xs text-brand-textMuted hover:text-brand-cyan hover:bg-brand-card disabled:opacity-30 disabled:hover:text-brand-textMuted disabled:hover:bg-transparent border-r border-brand-border/60 transition-colors"
                                      title="Mover para esquerda"
                                    >
                                      ‹
                                    </button>
                                    <button
                                      disabled={stage.id === 'Perdido'}
                                      onClick={() => {
                                        const nextIndex = KANBAN_STAGES.findIndex(s => s.id === stage.id) + 1;
                                        if (nextIndex < KANBAN_STAGES.length) moveLeadStage(lead.id, KANBAN_STAGES[nextIndex].id);
                                      }}
                                      className="p-1 px-1.5 text-xs text-brand-textMuted hover:text-brand-cyan hover:bg-brand-card disabled:opacity-30 disabled:hover:text-brand-textMuted disabled:hover:bg-transparent transition-colors"
                                      title="Mover para direita"
                                    >
                                      ›
                                    </button>
                                  </div>

                                </div>
                              </div>

                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </main>

      {/* ---------------- MODAL: DIGITE O PIN (Acesso Restrito) ---------------- */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card rounded-2xl w-full max-w-sm p-6 sm:p-8 border border-brand-cyan/20 shadow-glow-cyan relative">
            
            {/* Close modal */}
            <button
              onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(false); }}
              className="absolute right-4 top-4 text-brand-textMuted/60 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-brand-cyan/15 border border-brand-cyan flex items-center justify-center mx-auto text-brand-cyan shadow-glow-cyan">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-outfit font-bold text-xl text-white">Acesso Restrito</h3>
                <p className="text-xs text-brand-textMuted mt-1">Insira o PIN do CRM para visualizar o Kanban.</p>
                <p className="text-[10px] text-brand-cyan/60 font-semibold tracking-wider uppercase mt-1">PIN Padrão: 1234</p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-4 pt-2">
                <input
                  type="password"
                  maxLength="4"
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className={`w-full bg-brand-bg border ${pinError ? 'border-red-500 focus:ring-red-500' : 'border-brand-border focus:border-brand-cyan'} rounded-xl py-3 px-4 text-center text-xl tracking-[0.75em] text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-all`}
                  autoFocus
                />
                {pinError && <p className="text-xs text-red-500">PIN incorreto. Tente novamente.</p>}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-cyan to-brand-green text-brand-bg text-xs font-black uppercase py-3 rounded-xl transition-all shadow-glow-cyan"
                >
                  Entrar no Kanban
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: MANUAL LEADS INSERÇÃO (Dashboard Action) ---------------- */}
      {showAddLeadModal && (
        <LeadFormModal
          onClose={() => setShowAddLeadModal(false)}
          onSubmit={handleAddManualLead}
        />
      )}

      {/* ---------------- MODAL: DETALHES E NOTAS DO LEAD (CRM CRM) ---------------- */}
      {selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdateLeadDetails}
          onDelete={handleDeleteLead}
        />
      )}

      {/* ---------------- MODAL: CONFIGURAÇÕES DE INTEGRAÇÃO ---------------- */}
      {showConfigModal && (
        <ConfigModal
          config={config}
          onClose={() => setShowConfigModal(false)}
          onSave={(updatedConfig) => {
            setConfig(updatedConfig);
            setShowConfigModal(false);
          }}
        />
      )}

    </div>
  );
}

// ---------------- SUB-COMPONENTE: CONFIGURAÇÃO DE INTEGRAÇÕES ----------------
function ConfigModal({ config, onClose, onSave }) {
  const [whatsapp, setWhatsapp] = useState(config.whatsappNumber);
  const [formspree, setFormspree] = useState(config.formspreeId);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      whatsappNumber: whatsapp.replace(/\D/g, ''), 
      formspreeId: formspree.trim() 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg/85 backdrop-blur-sm p-4 animate-fade-in">
      <div className="glass-card rounded-2xl w-full max-w-md p-6 sm:p-8 border border-brand-border shadow-glow-cyan relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-brand-textMuted hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <h3 className="font-outfit font-bold text-xl text-white border-b border-brand-border/60 pb-3 mb-4">Configurações de Integração</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-1">WhatsApp para Recebimento</label>
            <input
              type="text"
              placeholder="Ex: 5511999999999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border focus:border-brand-cyan rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan"
            />
            <p className="text-[10px] text-brand-textMuted mt-1">Insira apenas números com código do país (55 para Brasil) + DDD + número.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-1">ID do Formspree (E-mail)</label>
            <input
              type="text"
              placeholder="Ex: mqkvzdyz"
              value={formspree}
              onChange={(e) => setFormspree(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border focus:border-brand-cyan rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan"
            />
            <p className="text-[10px] text-brand-textMuted mt-1">Crie um formulário no <a href="https://formspree.io" target="_blank" rel="noopener noreferrer" className="text-brand-cyan underline">formspree.io</a> e cole o ID do endpoint aqui para receber os dados por e-mail.</p>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-brand-card hover:bg-brand-cardHover border border-brand-border text-white text-xs font-bold font-outfit uppercase py-3 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 bg-gradient-to-tr from-brand-cyan to-brand-green text-brand-bg text-xs font-black uppercase py-3 rounded-xl transition-all shadow-glow-cyan"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------- SUB-COMPONENTE: CADASTRO MANUAL DE LEAD ----------------
function LeadFormModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [propertyInterest, setPropertyInterest] = useState('MCMV - Até R$500mil');
  const [contactMethod, setContactMethod] = useState('WhatsApp');
  const [urgency, setUrgency] = useState('Imediato');
  const [message, setMessage] = useState('');
  const [stage, setStage] = useState('Novo');
  const [errors, setErrors] = useState({});

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const tempErrors = {};
    if (!name.trim()) tempErrors.name = 'Nome é obrigatório';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'E-mail válido é obrigatório';
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) tempErrors.phone = 'Telefone com DDD é obrigatório';

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone,
      propertyInterest,
      contactMethod,
      urgency,
      message: message.trim(),
      stage
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg/85 backdrop-blur-sm p-4 animate-fade-in">
      <div className="glass-card rounded-2xl w-full max-w-lg p-6 sm:p-8 border border-brand-border shadow-glow-cyan relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-brand-textMuted hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <h3 className="font-outfit font-bold text-xl text-white border-b border-brand-border/60 pb-3 mb-4">Adicionar Lead Manualmente</h3>
        
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-1">Nome Completo</label>
            <input
              type="text"
              placeholder="Ex: Pedro Henrique"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full bg-brand-bg border ${errors.name ? 'border-red-500' : 'border-brand-border'} focus:border-brand-cyan rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-1">E-mail</label>
              <input
                type="email"
                placeholder="Ex: pedro@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-brand-bg border ${errors.email ? 'border-red-500' : 'border-brand-border'} focus:border-brand-cyan rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-1">Telefone (WhatsApp)</label>
              <input
                type="tel"
                placeholder="Ex: (11) 98888-8888"
                value={phone}
                onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
                className={`w-full bg-brand-bg border ${errors.phone ? 'border-red-500' : 'border-brand-border'} focus:border-brand-cyan rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none`}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-1">Perfil de Interesse</label>
              <select
                value={propertyInterest}
                onChange={(e) => setPropertyInterest(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-brand-cyan cursor-pointer"
              >
                <option value="MCMV - Até R$500mil">Minha Casa Minha Vida</option>
                <option value="Médio Padrão - R$500 mil a R$800 mil">Médio Padrão</option>
                <option value="Alto Padrão - R$900 mil a R$2 milhões">Alto Padrão</option>
                <option value="Luxo/Superluxo - Acima de R$2 milhões">Luxo / Superluxo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-1">Contato Preferencial</label>
              <select
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-brand-cyan cursor-pointer"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Telefone">Ligação Telefônica</option>
                <option value="E-mail">E-mail</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-1">Urgência de Compra</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-brand-cyan cursor-pointer"
              >
                <option value="Imediato">Imediato</option>
                <option value="Em até 3 meses">Em até 3 meses</option>
                <option value="Apenas pesquisando">Apenas pesquisando</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-1">Estágio Inicial</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-brand-cyan cursor-pointer"
              >
                {KANBAN_STAGES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-1">Observações do Lead (Mensagem)</label>
            <textarea
              rows="2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-brand-card hover:bg-brand-cardHover border border-brand-border text-white text-xs font-bold font-outfit uppercase py-3 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 bg-gradient-to-tr from-brand-cyan to-brand-green text-brand-bg text-xs font-black uppercase py-3 rounded-xl transition-all shadow-glow-cyan"
            >
              Salvar Lead
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

// ---------------- SUB-COMPONENTE: DETALHES DO LEAD / GESTÃO DO CRM ----------------
function LeadDetailsModal({ lead, onClose, onUpdate, onDelete }) {
  const [notes, setNotes] = useState(lead.notes || '');
  const [stage, setStage] = useState(lead.stage);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Sync internal state with changing props
  useEffect(() => {
    setNotes(lead.notes || '');
    setStage(lead.stage);
  }, [lead]);

  const handleSaveNotes = () => {
    onUpdate({ ...lead, notes });
    setIsEditingNotes(false);
  };

  const handleStageChange = (e) => {
    const newStage = e.target.value;
    setStage(newStage);
    onUpdate({ ...lead, stage: newStage });
  };

  const metric = PROPERTY_METRICS[lead.propertyInterest];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg/85 backdrop-blur-sm p-4 animate-fade-in">
      <div className="glass-card rounded-2xl w-full max-w-xl p-6 sm:p-8 border border-brand-border shadow-glow-cyan relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute right-4 top-4 text-brand-textMuted hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {/* Modal Title */}
        <div className="border-b border-brand-border/60 pb-4 mb-5">
          <div className="flex items-center space-x-2.5">
            <h3 className="font-outfit font-bold text-2xl text-white">{lead.name}</h3>
            {metric && (
              <span className={`text-[9px] font-bold uppercase border rounded px-1.5 py-0.5 tracking-wider ${metric.color}`}>
                {metric.label}
              </span>
            )}
          </div>
          <p className="text-xs text-brand-textMuted mt-1">
            Lead capturado em {new Date(lead.date).toLocaleDateString('pt-BR')} às {new Date(lead.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Grid Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          
          <div className="space-y-4">
            {/* Contact details */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-brand-cyan uppercase tracking-wider">Contatos</span>
              <p className="text-white font-medium flex items-center space-x-2">
                <span>📞 {lead.phone}</span>
                <span className="text-brand-green text-xs font-bold bg-brand-green/10 px-2 py-0.5 rounded-full border border-brand-green/20">
                  {lead.contactMethod}
                </span>
              </p>
              <p className="text-brand-textMuted">📧 {lead.email}</p>
            </div>

            {/* Stage Selector */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-brand-cyan uppercase tracking-wider">Estágio do Funil</span>
              <select
                value={stage}
                onChange={handleStageChange}
                className="bg-brand-bg border border-brand-border focus:border-brand-cyan rounded-xl py-2 px-3 text-xs text-white focus:outline-none transition-all cursor-pointer w-full"
              >
                {KANBAN_STAGES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Urgency */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-brand-cyan uppercase tracking-wider">Urgência de Compra</span>
              <p className="text-white font-semibold">{lead.urgency}</p>
            </div>

            {/* Original message */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-brand-cyan uppercase tracking-wider">Mensagem Capturada</span>
              <div className="bg-brand-bg/65 rounded-xl p-3 border border-brand-border max-h-32 overflow-y-auto text-xs text-brand-textMuted leading-relaxed">
                {lead.message || <span className="italic">Nenhuma mensagem enviada pelo lead.</span>}
              </div>
            </div>
          </div>

          {/* CRM Internal Notes */}
          <div className="space-y-3 flex flex-col h-full justify-between">
            <div className="space-y-2 flex-grow">
              <div className="flex items-center justify-between">
                <span className="block text-[10px] font-bold text-brand-cyan uppercase tracking-wider">Notas Internas do CRM</span>
                {!isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="text-xs text-brand-cyan font-bold hover:underline"
                  >
                    Editar
                  </button>
                )}
              </div>
              
              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    rows="6"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-cyan rounded-xl p-3 text-xs text-white placeholder-brand-textMuted/40 focus:outline-none"
                    placeholder="Adicione observações de ligações, propostas, condições do cliente..."
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveNotes}
                      className="bg-brand-green/20 border border-brand-green hover:bg-brand-green/35 text-brand-green text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    >
                      Salvar Notas
                    </button>
                    <button
                      onClick={() => { setNotes(lead.notes || ''); setIsEditingNotes(false); }}
                      className="bg-brand-card hover:bg-brand-cardHover border border-brand-border text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-brand-bg/65 rounded-xl p-4 border border-brand-border text-xs leading-relaxed text-white min-h-[160px] whitespace-pre-line flex flex-col justify-between">
                  <div>
                    {lead.notes ? lead.notes : <span className="text-brand-textMuted/50 italic">Nenhuma observação interna registrada. Clique em "Editar" para registrar feedbacks comerciais.</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Delete Lead action */}
            <div className="border-t border-brand-border/40 pt-4 flex justify-between items-center mt-4">
              <span className="text-[10px] text-brand-textMuted font-medium">ID: {lead.id}</span>
              <button
                onClick={() => onDelete(lead.id)}
                className="bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 text-xs font-bold uppercase py-2 px-4 rounded-xl transition-all"
              >
                Excluir Lead
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// ---------------- ROOT RENDER ----------------
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
