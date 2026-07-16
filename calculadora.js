// calculadora.js
const { useState, useEffect, useMemo } = React;

const CPL_MATRIX = {
  'Econômico / Popular - MCMV (até R$350 mil)': {
    conservador: 15.00,
    moderado: 12.50,
    agressivo: 10.00
  },
  'Médio Padrão (R$400 mil a R$800 mil)': {
    conservador: 30.00,
    moderado: 22.50,
    agressivo: 15.00
  },
  'Alto Padrão / Altíssimo Padrão (R$900 mil a R$5MM)': {
    conservador: 60.00,
    moderado: 45.00,
    agressivo: 30.00
  },
  'Luxo (a partir de R$10MM)': {
    conservador: 120.00,
    moderado: 90.00,
    agressivo: 60.00
  }
};

const SCENARIOS = {
  conservador: {
    label: 'Conservador',
    color: 'red',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'border-brand-red',
    shadow: 'shadow-glow-red hover:shadow-brand-red/30',
    borderActive: 'border-brand-red',
    agendamentoTaxa: 0.12,
    comparecimentoTaxa: 0.25,
    conversaoTaxa: 0.25,
    desc: 'Corretor autônomo ou equipe iniciante sem estrutura comercial dedicada'
  },
  moderado: {
    label: 'Moderado',
    color: 'yellow',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'border-brand-yellow',
    shadow: 'shadow-glow-yellow hover:shadow-brand-yellow/30',
    borderActive: 'border-brand-yellow',
    agendamentoTaxa: 0.15,
    comparecimentoTaxa: 0.30,
    conversaoTaxa: 0.30,
    desc: 'Produto validado no mercado com estrutura básica de vendas e follow-up'
  },
  agressivo: {
    label: 'Agressivo',
    color: 'green',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'border-brand-green',
    shadow: 'shadow-glow-green hover:shadow-brand-green/30',
    borderActive: 'border-brand-green',
    agendamentoTaxa: 0.20,
    comparecimentoTaxa: 0.50,
    conversaoTaxa: 0.30,
    desc: 'Operação madura: produto estrela, equipe dedicada, CRM implementado e processos otimizados'
  }
};

const formatBRL = (val) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

const formatBRLDecimals = (val) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

const formatPercent = (val) => {
  return `${val}%`;
};

function App() {
  const [clienteName, setClienteName] = useState('');
  const [modoInvestimento, setModoInvestimento] = useState('padrao'); // 'padrao' | 'reversa'
  
  const [rawInvestimento, setRawInvestimento] = useState(10000); 
  const [rawMetaFaturamento, setRawMetaFaturamento] = useState(100000); 
  const [rawMetaVendas, setRawMetaVendas] = useState(5); 
  const [tipoMetaReversa, setTipoMetaReversa] = useState('faturamento'); 
  
  const [rawTicketMedio, setRawTicketMedio] = useState(600000);
  const [rawComissao, setRawComissao] = useState(5);
  
  const [modeloImovel, setModeloImovel] = useState('Médio Padrão (R$400 mil a R$800 mil)');
  const [cenario, setCenario] = useState('conservador'); 
  
  const [tempoRampagem, setTempoRampagem] = useState(false);
  const [crescimentoInvestimento, setCrescimentoInvestimento] = useState(false);
  const [projecaoMeses, setProjecaoMeses] = useState(6); 
  
  const [alavancaTrafego, setAlavancaTrafego] = useState(true); 
  const [alavancaProspeccao, setAlavancaProspeccao] = useState(false);
  const [alavancaSocial, setAlavancaSocial] = useState(false);
  const [alavancaIndicacoes, setAlavancaIndicacoes] = useState(false);
 
  const [displayInvestimento, setDisplayInvestimento] = useState('R$ 10.000');
  const [displayMetaFaturamento, setDisplayMetaFaturamento] = useState('R$ 100.000');
  const [displayMetaVendas, setDisplayMetaVendas] = useState('5');
  const [displayTicketMedio, setDisplayTicketMedio] = useState('R$ 600.000');
  const [displayComissao, setDisplayComissao] = useState('5%');
 
  const [userCPL, setUserCPL] = useState(30.00); 
  const [displayCPL, setDisplayCPL] = useState('R$ 30,00');
  const [isCustomCPL, setIsCustomCPL] = useState(false);
 
  useEffect(() => {
    setDisplayInvestimento(formatBRL(rawInvestimento));
    setDisplayMetaFaturamento(formatBRL(rawMetaFaturamento));
    setDisplayMetaVendas(String(rawMetaVendas));
    setDisplayTicketMedio(formatBRL(rawTicketMedio));
    setDisplayComissao(formatPercent(rawComissao));
  }, []);
 
  // Sync CPL when property profile or scenario changes, unless it's customized
  useEffect(() => {
    if (!isCustomCPL) {
      const defaultVal = CPL_MATRIX[modeloImovel][cenario];
      setUserCPL(defaultVal);
      setDisplayCPL(formatBRLDecimals(defaultVal));
    }
  }, [modeloImovel, cenario, isCustomCPL]);
 
  // Sync profile property type based on average ticket size
  useEffect(() => {
    if (rawTicketMedio <= 350000) {
      setModeloImovel('Econômico / Popular - MCMV (até R$350 mil)');
    } else if (rawTicketMedio > 350000 && rawTicketMedio <= 800000) {
      setModeloImovel('Médio Padrão (R$400 mil a R$800 mil)');
    } else if (rawTicketMedio > 800000 && rawTicketMedio <= 5000000) {
      setModeloImovel('Alto Padrão / Altíssimo Padrão (R$900 mil a R$5MM)');
    } else {
      setModeloImovel('Luxo (a partir de R$10MM)');
    }
  }, [rawTicketMedio]);

  // Masked handlers
  const handleInvestimentoChange = (e) => {
    const val = e.target.value;
    if (!val) { setRawInvestimento(0); setDisplayInvestimento(''); return; }
    const clean = val.replace(/\D/g, '');
    if (!clean) { setRawInvestimento(0); setDisplayInvestimento(''); return; }
    const num = parseInt(clean, 10);
    setRawInvestimento(num);
    setDisplayInvestimento(formatBRL(num));
  };

  const handleMetaFaturamentoChange = (e) => {
    const val = e.target.value;
    if (!val) { setRawMetaFaturamento(0); setDisplayMetaFaturamento(''); return; }
    const clean = val.replace(/\D/g, '');
    if (!clean) { setRawMetaFaturamento(0); setDisplayMetaFaturamento(''); return; }
    const num = parseInt(clean, 10);
    setRawMetaFaturamento(num);
    setDisplayMetaFaturamento(formatBRL(num));
  };

  const handleMetaVendasChange = (e) => {
    const val = e.target.value;
    if (!val) { setRawMetaVendas(0); setDisplayMetaVendas(''); return; }
    const clean = val.replace(/\D/g, '');
    if (!clean) { setRawMetaVendas(0); setDisplayMetaVendas(''); return; }
    const num = parseInt(clean, 10);
    setRawMetaVendas(num);
    setDisplayMetaVendas(String(num));
  };

  const handleTicketChange = (e) => {
    const val = e.target.value;
    if (!val) { setRawTicketMedio(0); setDisplayTicketMedio(''); return; }
    const clean = val.replace(/\D/g, '');
    if (!clean) { setRawTicketMedio(0); setDisplayTicketMedio(''); return; }
    const num = parseInt(clean, 10);
    setRawTicketMedio(num);
    setDisplayTicketMedio(formatBRL(num));
  };

  const handleComissaoChange = (e) => {
    const val = e.target.value;
    const oldVal = displayComissao;
    if (!val) { setRawComissao(0); setDisplayComissao(''); return; }
    let clean = val.replace(/\D/g, '');
    if (oldVal && oldVal.endsWith('%') && val === oldVal.slice(0, -1)) {
      clean = clean.slice(0, -1);
    }
    if (!clean) { setRawComissao(0); setDisplayComissao(''); return; }
    const num = parseInt(clean, 10);
    const bounded = num > 100 ? 100 : num;
    setRawComissao(bounded);
    setDisplayComissao(`${bounded}%`);
  };

  const handleCPLInputChange = (e) => {
    const val = e.target.value;
    if (!val) { 
      setUserCPL(0); 
      setDisplayCPL(''); 
      setIsCustomCPL(true); 
      return; 
    }
    const clean = val.replace(/\D/g, '');
    if (!clean) { 
      setUserCPL(0); 
      setDisplayCPL(''); 
      setIsCustomCPL(true); 
      return; 
    }
    const num = parseInt(clean, 10) / 100;
    setUserCPL(num);
    setIsCustomCPL(true);
    setDisplayCPL(formatBRLDecimals(num));
  };

  // Funnel calculations
  const activeCPL = useMemo(() => {
    return userCPL;
  }, [userCPL]);

  const activeScenarioConfig = useMemo(() => {
    return SCENARIOS[cenario];
  }, [cenario]);

  const baseMonthlyInvestment = useMemo(() => {
    if (modoInvestimento === 'padrao') {
      return rawInvestimento;
    } else {
      let vendasNecessarias = 0;
      if (tipoMetaReversa === 'faturamento') {
        const comissaoPorVenda = rawTicketMedio * (rawComissao / 100);
        if (comissaoPorVenda <= 0) return 0;
        vendasNecessarias = Math.ceil(rawMetaFaturamento / comissaoPorVenda);
      } else {
        vendasNecessarias = rawMetaVendas;
      }
      if (vendasNecessarias <= 0) return 0;
      
      const visitasNecessarias = Math.ceil(vendasNecessarias / activeScenarioConfig.conversaoTaxa);
      const agendamentosNecessarios = Math.ceil(visitasNecessarias / activeScenarioConfig.comparecimentoTaxa);
      const leadsNecessarios = Math.ceil(agendamentosNecessarios / activeScenarioConfig.agendamentoTaxa);
      return leadsNecessarios * activeCPL;
    }
  }, [modoInvestimento, tipoMetaReversa, rawInvestimento, rawMetaFaturamento, rawMetaVendas, rawTicketMedio, rawComissao, activeCPL, activeScenarioConfig]);

  const monthlyProjectionData = useMemo(() => {
    const projection = [];
    const activeLeversCount = (alavancaProspeccao ? 1 : 0) + (alavancaSocial ? 1 : 0) + (alavancaIndicacoes ? 1 : 0);

    for (let month = 1; month <= projecaoMeses; month++) {
      let monthlyInvestment = baseMonthlyInvestment;
      if (crescimentoInvestimento && month > 1) {
        monthlyInvestment = baseMonthlyInvestment * Math.pow(1.10, month - 1);
      }

      let rampFactor = 1.0;
      if (tempoRampagem) {
        if (month === 1) rampFactor = 0.70;
        else if (month === 2) rampFactor = 0.85;
      }

      const leads = Math.floor((monthlyInvestment / activeCPL) * rampFactor);
      const agendamentos = Math.floor(leads * activeScenarioConfig.agendamentoTaxa);
      const visitas = Math.floor(agendamentos * activeScenarioConfig.comparecimentoTaxa);
      const baseSales = Math.floor(visitas * activeScenarioConfig.conversaoTaxa);

      let extraSales = 0;
      if (month >= 3) {
        extraSales = activeLeversCount;
      }
      const totalSales = baseSales + extraSales;

      const comissaoPorVenda = rawTicketMedio * (rawComissao / 100);
      const faturamento = totalSales * comissaoPorVenda;
      const roas = monthlyInvestment > 0 ? (faturamento / monthlyInvestment) : 0;

      projection.push({
        month,
        investment: monthlyInvestment,
        leads,
        agendamentos,
        visitas,
        vendasBase: baseSales,
        vendasExtra: extraSales,
        vendas: totalSales,
        faturamento,
        roas
      });
    }
    return projection;
  }, [baseMonthlyInvestment, activeCPL, activeScenarioConfig, tempoRampagem, crescimentoInvestimento, projecaoMeses, alavancaProspeccao, alavancaSocial, alavancaIndicacoes, rawTicketMedio, rawComissao]);

  const totalComAcelera = useMemo(() => {
    let investment = 0, leads = 0, agendamentos = 0, visitas = 0, vendas = 0, faturamento = 0;
    monthlyProjectionData.forEach(m => {
      investment += m.investment;
      leads += m.leads;
      agendamentos += m.agendamentos;
      visitas += m.visitas;
      vendas += m.vendas;
      faturamento += m.faturamento;
    });
    const roas = investment > 0 ? faturamento / investment : 0;
    return { investment, leads, agendamentos, visitas, vendas, faturamento, roas };
  }, [monthlyProjectionData]);

  const totalSemAcelera = useMemo(() => {
    let investment = 0, leads = 0, agendamentos = 0, visitas = 0, vendas = 0, faturamento = 0;
    monthlyProjectionData.forEach(m => {
      investment += m.investment;
      let rampFactor = 1.0;
      if (tempoRampagem) {
        if (m.month === 1) rampFactor = 0.70;
        else if (m.month === 2) rampFactor = 0.85;
      }
      const normalLeads = Math.floor((m.investment / activeCPL) * rampFactor);
      const normalAgendamentos = Math.floor(normalLeads * activeScenarioConfig.agendamentoTaxa);
      const normalVisitas = Math.floor(normalAgendamentos * activeScenarioConfig.comparecimentoTaxa);
      const normalVendas = Math.floor(normalVisitas * activeScenarioConfig.conversaoTaxa);

      const leadsM = Math.floor(normalLeads * 0.70);
      const agendamentosM = Math.floor(normalAgendamentos * 0.70);
      const visitasM = Math.floor(normalVisitas * 0.70);
      const vendasM = Math.floor(normalVendas * 0.70);

      leads += leadsM;
      agendamentos += agendamentosM;
      visitas += visitasM;
      vendas += vendasM;
      faturamento += vendasM * (rawTicketMedio * (rawComissao / 100));
    });
    const roas = investment > 0 ? faturamento / investment : 0;
    return { investment, leads, agendamentos, visitas, vendas, faturamento, roas };
  }, [monthlyProjectionData, activeCPL, activeScenarioConfig, tempoRampagem, rawTicketMedio, rawComissao]);

  const currentMonthFunnel = useMemo(() => {
    const leads = Math.floor(baseMonthlyInvestment / activeCPL);
    const agendamentos = Math.floor(leads * activeScenarioConfig.agendamentoTaxa);
    const visitas = Math.floor(agendamentos * activeScenarioConfig.comparecimentoTaxa);
    const vendas = Math.floor(visitas * activeScenarioConfig.conversaoTaxa);
    const faturamento = vendas * (rawTicketMedio * (rawComissao / 100));
    const roas = baseMonthlyInvestment > 0 ? faturamento / baseMonthlyInvestment : 0;
    return { investment: baseMonthlyInvestment, leads, agendamentos, visitas, vendas, faturamento, roas };
  }, [baseMonthlyInvestment, activeCPL, activeScenarioConfig, rawTicketMedio, rawComissao]);

  const breakEvenCalculations = useMemo(() => {
    const comissaoPorVenda = rawTicketMedio * (rawComissao / 100);
    const salesNeeded = comissaoPorVenda > 0 ? baseMonthlyInvestment / comissaoPorVenda : 0;
    const currentSales = currentMonthFunnel.vendas;
    const progress = salesNeeded > 0 ? Math.min(100, (currentSales / salesNeeded) * 100) : 0;
    return {
      salesNeeded: salesNeeded.toFixed(1),
      progress: progress.toFixed(0)
    };
  }, [baseMonthlyInvestment, rawTicketMedio, rawComissao, currentMonthFunnel.vendas]);

  const healthStatus = useMemo(() => {
    const isHealthy = currentMonthFunnel.roas >= 1.5;
    return {
      isHealthy,
      title: isHealthy ? 'SAUDÁVEL' : 'PRECISA AJUSTES',
      desc: isHealthy ? 'Cenário com boa previsibilidade' : 'Fale com um especialista para otimizar',
      colorClass: isHealthy ? 'text-brand-green border-brand-green bg-brand-green/10 shadow-glow-green' : 'text-brand-red border-brand-red bg-brand-red/10 shadow-glow-red'
    };
  }, [currentMonthFunnel.roas]);

  const impactSummary = useMemo(() => {
    const salesAdded = totalComAcelera.vendas - totalSemAcelera.vendas;
    const faturamentoExtra = totalComAcelera.faturamento - totalSemAcelera.faturamento;
    const leadsAdded = totalComAcelera.leads - totalSemAcelera.leads;
    const wastedSaved = totalComAcelera.investment * 0.30;
    const efficiency = totalSemAcelera.vendas > 0 
      ? ((totalComAcelera.vendas - totalSemAcelera.vendas) / totalSemAcelera.vendas) * 100 
      : 100;
    return {
      salesAdded,
      faturamentoExtra,
      leadsAdded,
      wastedSaved,
      efficiency: efficiency.toFixed(0)
    };
  }, [totalComAcelera, totalSemAcelera]);

  const maxFaturamento = useMemo(() => {
    const vals = monthlyProjectionData.map(m => m.faturamento);
    return Math.max(...vals, 1);
  }, [monthlyProjectionData]);

  const handleGeneratePDF = () => {
    window.print();
  };

  const portalContent = (
    <div className="print-page bg-print-dark">
      {/* PAGE 1: COVER */}
      <div className="print-header flex items-center justify-between">
        <span className="font-outfit font-black text-2xl tracking-tighter text-print-cyan uppercase">
          acelera<span className="text-white">imob</span>
        </span>
        <div className="text-right">
          <h1 className="text-xl font-bold font-outfit text-white">Relatório Método Precisão</h1>
          <p className="text-xs text-brand-textMuted mt-1">
            Proposta de Investimento e Retorno Funil
          </p>
        </div>
      </div>
      
      <div className="mt-8 space-y-4">
        {clienteName && (
          <div className="bg-brand-card p-5 rounded-xl border border-brand-border">
            <h4 className="text-xs uppercase font-bold text-brand-cyan">Cliente / Incorporadora</h4>
            <p className="text-lg font-bold text-white mt-1">{clienteName}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-brand-card p-4 rounded-xl border border-brand-border">
            <span className="text-xs text-brand-textMuted uppercase font-bold">Investimento Simulado</span>
            <p className="text-xl font-bold text-white mt-1">{formatBRL(baseMonthlyInvestment)} / mês</p>
          </div>
          <div className="bg-brand-card p-4 rounded-xl border border-brand-border">
            <span className="text-xs text-brand-textMuted uppercase font-bold">Cenário Operacional</span>
            <p className="text-xl font-bold text-brand-cyan mt-1 uppercase">{activeScenarioConfig.label}</p>
          </div>
        </div>

        {/* Funnel Metrics Table print */}
        <h3 className="font-outfit font-bold text-lg text-white mt-6">Projeção Mensal do Funil</h3>
        <table className="print-table">
          <thead>
            <tr>
              <th>Etapa do Funil</th>
              <th>Volume Mensal</th>
              <th>Taxa de Conversão</th>
              <th>Métrica Resultante</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Investimento</td>
              <td>{formatBRL(baseMonthlyInvestment)}</td>
              <td>-</td>
              <td>CPL Efetivo: {formatBRL(activeCPL)}</td>
            </tr>
            <tr>
              <td>Leads Gerados</td>
              <td>{currentMonthFunnel.leads} Leads</td>
              <td>{formatPercent(activeScenarioConfig.agendamentoTaxa * 100)} (Agendamento)</td>
              <td>{currentMonthFunnel.agendamentos} Agendados</td>
            </tr>
            <tr>
              <td>Agendamentos</td>
              <td>{currentMonthFunnel.agendamentos} Agendados</td>
              <td>{formatPercent(activeScenarioConfig.comparecimentoTaxa * 100)} (Comparecimento)</td>
              <td>{currentMonthFunnel.visitas} Visitas</td>
            </tr>
            <tr>
              <td>Visitas Realizadas</td>
              <td>{currentMonthFunnel.visitas} Visitas</td>
              <td>{formatPercent(activeScenarioConfig.conversaoTaxa * 100)} (Fechamento)</td>
              <td>{currentMonthFunnel.vendas} Vendas</td>
            </tr>
            <tr>
              <td>Faturamento Bruto</td>
              <td>{formatBRL(currentMonthFunnel.faturamento)}</td>
              <td>ROAS Efetivo</td>
              <td className="text-print-cyan font-bold">{currentMonthFunnel.roas.toFixed(1)}x retorno</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="absolute bottom-6 left-12 right-12 text-[10px] text-brand-textMuted/60 flex justify-between border-t border-brand-border/30 pt-3">
        <span>Acelera Imob Ltda</span>
        <span>Página 1 de 2</span>
      </div>

      {/* PAGE 2 */}
      <div className="page-break" style={{ pageBreakBefore: 'always', height: '100%', position: 'relative' }}>
        <div className="print-header flex items-center justify-between pt-6">
          <span className="font-outfit font-bold text-sm tracking-tighter text-brand-cyan uppercase">
            Metodologia Acelera Imob
          </span>
          <span className="text-xs text-brand-textMuted font-medium">Projeções Temporais</span>
        </div>

        <h3 className="font-outfit font-bold text-base text-white mt-6">Cronograma de Retorno Financeiro ({projecaoMeses} meses)</h3>
        <table className="print-table mt-4">
          <thead>
            <tr>
              <th>Mês</th>
              <th>Investimento</th>
              <th>Leads</th>
              <th>Vendas</th>
              <th>Faturamento</th>
              <th>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {monthlyProjectionData.map(m => (
              <tr key={m.month}>
                <td>Mês {m.month}</td>
                <td>{formatBRL(m.investment)}</td>
                <td>{m.leads}</td>
                <td>{m.vendas}</td>
                <td>{formatBRL(m.faturamento)}</td>
                <td>{m.roas.toFixed(1)}x</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Impact summary prints */}
        <h3 className="font-outfit font-bold text-base text-white mt-6">Comparativo Acumulado do Período</h3>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="bg-brand-card p-4 rounded-xl border border-brand-border">
            <h4 className="text-xs font-bold text-brand-green uppercase">Com Inteligência Acelera Imob</h4>
            <p className="text-lg font-black mt-2 text-white">{formatBRL(totalComAcelera.faturamento)}</p>
            <span className="text-[10px] text-brand-textMuted mt-1 block">ROAS Médio: {totalComAcelera.roas.toFixed(1)}x ({totalComAcelera.vendas} vendas)</span>
          </div>
          <div className="bg-brand-card p-4 rounded-xl border border-brand-border">
            <h4 className="text-xs font-bold text-brand-red uppercase">Sem Acelera Imob (Degradado)</h4>
            <p className="text-lg font-black mt-2 text-white">{formatBRL(totalSemAcelera.faturamento)}</p>
            <span className="text-[10px] text-brand-textMuted mt-1 block">ROAS Médio: {totalSemAcelera.roas.toFixed(1)}x ({totalSemAcelera.vendas} vendas)</span>
          </div>
        </div>

        <div className="bg-brand-card p-5 rounded-xl border border-brand-border mt-5 space-y-2">
          <h4 className="text-xs font-bold text-brand-cyan uppercase">Resumo de Ganho Operacional</h4>
          <p className="text-xs text-brand-textMuted leading-relaxed">
            Com o Método Precisão da Acelera Imob, a sua operação comercial recebe leads pré-qualificados, reduzindo custos desnecessários em publicidade e otimizando a taxa de visitas/fechamentos em <strong>{impactSummary.efficiency}%</strong>. Isso gerará uma receita incremental de <strong>{formatBRL(impactSummary.faturamentoExtra)}</strong> no período analisado.
          </p>
        </div>

        <div className="absolute bottom-6 left-12 right-12 text-[10px] text-brand-textMuted/60 flex justify-between border-t border-brand-border/30 pt-3">
          <span>Relatório Proposta Corporativa - Acelera Imob</span>
          <span>Página 2 de 2</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-brand-bg bg-grid-pattern py-8 px-4 sm:px-6 lg:px-8">
      
      {/* ---------------- CONTAINER PRINCIPAL WEB ---------------- */}
      <div className="max-w-7xl mx-auto space-y-8 no-print animate-fade-in">
        
        {/* --- TOPO / CABEÇALHO --- */}
        <header className="flex items-center justify-center border-b border-brand-border/60 pb-6">
          <div className="flex items-center select-none">
            <img src="logo.png" alt="Blueprint Mídia" className="h-12 w-auto object-contain" />
          </div>
        </header>

        {/* --- SEÇÃO FORMULÁRIO + FUNIL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUNA ESQUERDA: FORMULÁRIO */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Card 1: Modo de Investimento */}
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-3">
                  Qual o seu investimento previsto?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setModoInvestimento('padrao')}
                    className={`flex items-center justify-center p-3 rounded-xl border text-sm font-semibold transition-all ${modoInvestimento === 'padrao' ? 'border-brand-cyan bg-brand-cyan/5 text-white shadow-glow-cyan' : 'border-brand-border bg-brand-bg/50 text-brand-textMuted hover:text-white'}`}
                  >
                    Modo Padrão
                  </button>
                  <button
                    onClick={() => setModoInvestimento('reversa')}
                    className={`flex items-center justify-center p-3 rounded-xl border text-sm font-semibold transition-all ${modoInvestimento === 'reversa' ? 'border-brand-cyan bg-brand-cyan/5 text-white shadow-glow-cyan' : 'border-brand-border bg-brand-bg/50 text-brand-textMuted hover:text-white'}`}
                  >
                    Meta Reversa
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Dados do Investimento */}
            <div className="glass-card rounded-2xl p-6 space-y-5">
              {modoInvestimento === 'padrao' ? (
                <div>
                  <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-2">
                    Investimento em Anúncios (Mensal)
                  </label>
                  <input
                    type="text"
                    placeholder="R$ 10.000"
                    value={displayInvestimento}
                    onChange={handleInvestimentoChange}
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-cyan rounded-xl py-3 px-4 text-white text-lg font-semibold focus:outline-none transition-all"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-2">
                      Tipo de Meta Reversa
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-brand-bg/60 p-1 rounded-xl border border-brand-border">
                      <button
                        type="button"
                        onClick={() => setTipoMetaReversa('faturamento')}
                        className={`text-xs font-bold py-2 rounded-lg transition-all ${tipoMetaReversa === 'faturamento' ? 'bg-brand-cyan text-brand-bg shadow-glow-cyan' : 'text-brand-textMuted hover:text-white'}`}
                      >
                        Faturamento
                      </button>
                      <button
                        type="button"
                        onClick={() => setTipoMetaReversa('vendas')}
                        className={`text-xs font-bold py-2 rounded-lg transition-all ${tipoMetaReversa === 'vendas' ? 'bg-brand-cyan text-brand-bg shadow-glow-cyan' : 'text-brand-textMuted hover:text-white'}`}
                      >
                        Vendas
                      </button>
                    </div>
                  </div>

                  {tipoMetaReversa === 'faturamento' ? (
                    <div>
                      <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-2">
                        Meta de Faturamento (Mensal)
                      </label>
                      <input
                        type="text"
                        placeholder="R$ 100.000"
                        value={displayMetaFaturamento}
                        onChange={handleMetaFaturamentoChange}
                        className="w-full bg-brand-bg border border-brand-border focus:border-brand-cyan rounded-xl py-3 px-4 text-white text-lg font-semibold focus:outline-none transition-all"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-2">
                        Meta de Vendas Desejadas (Mensal)
                      </label>
                      <input
                        type="text"
                        placeholder="5"
                        value={displayMetaVendas}
                        onChange={handleMetaVendasChange}
                        className="w-full bg-brand-bg border border-brand-border focus:border-brand-cyan rounded-xl py-3 px-4 text-white text-lg font-semibold focus:outline-none transition-all"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-2">
                    Ticket Médio
                  </label>
                  <input
                    type="text"
                    value={displayTicketMedio}
                    onChange={handleTicketChange}
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-cyan rounded-xl py-3 px-4 text-white font-medium focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-2">
                    Comissão (%)
                  </label>
                  <input
                    type="text"
                    value={displayComissao}
                    onChange={handleComissaoChange}
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-cyan rounded-xl py-3 px-4 text-white font-medium focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-2">
                  Modelo do Imóvel
                </label>
                <div className="w-full bg-brand-bg/40 border border-brand-border/60 rounded-xl py-3 px-4 text-white/80 font-medium select-none">
                  {modeloImovel}
                </div>
              </div>

              {/* Seletor e customizador de CPL */}
              <div className="border-t border-brand-border/40 pt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-2">
                    CPL de Referência de Mercado
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['conservador', 'moderado', 'agressivo'].map((scKey) => {
                      const presetVal = CPL_MATRIX[modeloImovel][scKey];
                      const isPresetActive = cenario === scKey && !isCustomCPL;
                      const scConfig = SCENARIOS[scKey];
                      return (
                        <button
                          key={scKey}
                          type="button"
                          onClick={() => {
                            setCenario(scKey);
                            setIsCustomCPL(false);
                          }}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${isPresetActive ? 'border-brand-cyan bg-brand-cyan/15 text-white shadow-glow-cyan' : 'border-brand-border bg-brand-bg/30 text-brand-textMuted hover:text-white'}`}
                        >
                          <span className="text-[9px] uppercase font-bold tracking-wider mb-0.5">{scConfig.label}</span>
                          <span className="text-xs font-extrabold">{formatBRLDecimals(presetVal)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-cyan tracking-wider uppercase mb-2">
                    CPL de Cálculo Ativo
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs text-brand-textMuted/80 font-semibold select-none">
                      CPL Ativo:
                    </span>
                    <input
                      type="text"
                      value={displayCPL}
                      onChange={handleCPLInputChange}
                      className={`w-full bg-brand-bg border focus:border-brand-cyan rounded-xl py-3 pl-20 pr-4 text-right text-sm font-bold focus:outline-none transition-all ${isCustomCPL ? 'border-brand-cyan text-brand-cyan shadow-glow-cyan bg-brand-cyan/5' : 'border-brand-border text-white/90'}`}
                      placeholder="R$ 0,00"
                    />
                  </div>
                  <span className="block text-[10px] text-brand-textMuted/60 mt-1.5 leading-normal">
                    *Clique nos botões acima para selecionar a média do perfil (<strong>{modeloImovel}</strong>) ou insira um CPL personalizado para simular.
                  </span>
                </div>
              </div>
            </div>



            {/* Card 4: Alavancas & Rampagem */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <span className="block text-[10px] font-bold text-brand-cyan tracking-widest uppercase">Alavancas e Temporização</span>
              
              <div className="flex items-center justify-between py-2 border-b border-brand-border/40">
                <span className="text-xs font-semibold">Considerar Rampagem (Meses 1-2)</span>
                <input
                  type="checkbox"
                  checked={tempoRampagem}
                  onChange={(e) => setTempoRampagem(e.target.checked)}
                  className="w-4 h-4 text-brand-cyan focus:ring-brand-cyan border-brand-border rounded"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-semibold">Crescimento de Investimento (10%/mês)</span>
                <input
                  type="checkbox"
                  checked={crescimentoInvestimento}
                  onChange={(e) => setCrescimentoInvestimento(e.target.checked)}
                  className="w-4 h-4 text-brand-cyan focus:ring-brand-cyan border-brand-border rounded"
                />
              </div>

              <div className="border-t border-brand-border/40 pt-4 space-y-3">
                <span className="block text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">Canais de Vendas Adicionais</span>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2 text-xs text-brand-textMuted">
                    <input type="checkbox" checked={alavancaProspeccao} onChange={(e) => setAlavancaProspeccao(e.target.checked)} />
                    <span>Prospecção Ativa</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-brand-textMuted">
                    <input type="checkbox" checked={alavancaSocial} onChange={(e) => setAlavancaSocial(e.target.checked)} />
                    <span>Social Media</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-brand-textMuted col-span-2">
                    <input type="checkbox" checked={alavancaIndicacoes} onChange={(e) => setAlavancaIndicacoes(e.target.checked)} />
                    <span>Parcerias/Indicações</span>
                  </label>
                </div>
              </div>
            </div>

          </div>

          {/* COLUNA DIREITA: METRICAS DO FUNIL */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Visual Funnel Card */}
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                <h3 className="font-outfit font-bold text-lg text-white">Funil de Conversão do Investimento</h3>
                <span className="text-xs bg-brand-cyan/15 text-brand-cyan font-bold tracking-wider px-2.5 py-1 rounded-full uppercase">Mês Médio</span>
              </div>

              {/* FUNNEL DISPLAY */}
              <div className="flex flex-col items-center space-y-3.5 pt-3 w-full">
                {[
                  { 
                    label: 'Investimento Mensal', 
                    val: formatBRL(currentMonthFunnel.investment), 
                    desc: `CPL Estimado: ${formatBRL(activeCPL)}`, 
                    width: 'w-full', 
                    border: 'border-brand-cyan/40', 
                    bg: 'bg-gradient-to-r from-brand-cyan/15 to-brand-cyan/5',
                    labelColor: 'text-brand-cyan'
                  },
                  { 
                    label: 'Leads Gerados', 
                    val: currentMonthFunnel.leads.toLocaleString('pt-BR'), 
                    desc: `Taxa Agendamento: ${formatPercent(activeScenarioConfig.agendamentoTaxa * 100)}`, 
                    width: 'w-[91%]', 
                    border: 'border-blue-500/40', 
                    bg: 'bg-gradient-to-r from-blue-500/15 to-blue-500/5',
                    labelColor: 'text-blue-400'
                  },
                  { 
                    label: 'Agendamentos', 
                    val: currentMonthFunnel.agendamentos.toLocaleString('pt-BR'), 
                    desc: `Taxa Comparecimento: ${formatPercent(activeScenarioConfig.comparecimentoTaxa * 100)}`, 
                    width: 'w-[82%]', 
                    border: 'border-purple-500/40', 
                    bg: 'bg-gradient-to-r from-purple-500/15 to-purple-500/5',
                    labelColor: 'text-purple-400'
                  },
                  { 
                    label: 'Visitas Realizadas', 
                    val: currentMonthFunnel.visitas.toLocaleString('pt-BR'), 
                    desc: `Taxa Fechamento: ${formatPercent(activeScenarioConfig.conversaoTaxa * 100)}`, 
                    width: 'w-[73%]', 
                    border: 'border-pink-500/40', 
                    bg: 'bg-gradient-to-r from-pink-500/15 to-pink-500/5',
                    labelColor: 'text-pink-400'
                  },
                  { 
                    label: 'Vendas Fechadas', 
                    val: currentMonthFunnel.vendas.toLocaleString('pt-BR'), 
                    desc: `Comissão p/ Venda: ${formatBRL(rawTicketMedio * (rawComissao / 100))}`, 
                    width: 'w-[64%]', 
                    border: 'border-brand-green/45 border-2', 
                    bg: 'bg-gradient-to-r from-brand-green/15 to-brand-green/5',
                    labelColor: 'text-brand-green'
                  },
                  { 
                    label: 'Faturamento de Comissão', 
                    val: formatBRL(currentMonthFunnel.faturamento), 
                    desc: `Retorno ROAS: ${currentMonthFunnel.roas.toFixed(1)}x`, 
                    width: 'w-[55%]', 
                    border: 'border-brand-cyan/60 border-2 shadow-glow-cyan', 
                    bg: 'bg-gradient-to-r from-brand-cyan/20 to-brand-cyan/10',
                    labelColor: 'text-brand-cyan font-black'
                  }
                ].map((row, idx) => (
                  <div key={idx} className={`${row.width} border ${row.border} ${row.bg} p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all hover:scale-[1.03] hover:brightness-125 space-y-1`}>
                    <span className={`font-black text-xs uppercase tracking-widest ${row.labelColor}`}>{row.label}</span>
                    <span className="font-extrabold text-2xl md:text-3xl font-outfit text-white tracking-tight leading-none my-1">{row.val}</span>
                    <span className="text-xs text-white/90 font-semibold tracking-wide">{row.desc}</span>
                  </div>
                ))}
              </div>

              {/* Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-brand-border/40 pt-4">
                <div className={`border rounded-xl p-4 ${healthStatus.colorClass}`}>
                  <h4 className="text-[10px] font-bold tracking-widest uppercase">Saúde Operacional</h4>
                  <p className="text-lg font-black mt-1">{healthStatus.title}</p>
                  <p className="text-xs text-brand-textMuted mt-1">{healthStatus.desc}</p>
                </div>

                <div className="border border-brand-border bg-brand-card p-4 rounded-xl">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>Ponto de Equilíbrio</span>
                    <span className="text-brand-cyan">{breakEvenCalculations.salesNeeded} vendas</span>
                  </div>
                  <div className="w-full bg-brand-bg h-2.5 rounded-full overflow-hidden mt-2 border border-brand-border">
                    <div className="bg-brand-cyan h-full transition-all" style={{ width: `${breakEvenCalculations.progress}%` }}></div>
                  </div>
                  <p className="text-[10px] text-brand-textMuted mt-1.5 uppercase font-medium">Progresso: {breakEvenCalculations.progress}% do Ad Spend recuperado</p>
                </div>
              </div>

            </div>

            {/* Visual Custom Project Table */}
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-brand-border/60 pb-4 gap-4">
                <h3 className="font-outfit font-bold text-lg text-white">Projeção Temporal</h3>
                <div className="flex bg-brand-bg/60 p-1 rounded-xl border border-brand-border/80 max-w-fit">
                  {[3, 6, 12].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setProjecaoMeses(m)}
                      className={`text-xs font-bold font-outfit px-4 py-2 rounded-lg transition-all ${projecaoMeses === m ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/20 shadow-glow-cyan' : 'text-brand-textMuted hover:text-white border border-transparent'}`}
                    >
                      {m} Meses
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border/40 text-brand-textMuted font-bold text-[11px] tracking-wider">
                      <th className="py-3 px-4 font-outfit font-semibold">Mês</th>
                      <th className="py-3 px-4 text-right font-outfit font-semibold">Investimento</th>
                      <th className="py-3 px-4 text-right font-outfit font-semibold">Leads</th>
                      <th className="py-3 px-4 text-right font-outfit font-semibold">Vendas</th>
                      <th className="py-3 px-4 text-right font-outfit font-semibold">Faturamento</th>
                      <th className="py-3 px-4 text-right font-outfit font-semibold">ROAS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/20">
                    {monthlyProjectionData.map((m) => (
                      <tr key={m.month} className="hover:bg-brand-cardHover/20 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white font-outfit">{m.month}</td>
                        <td className="py-3.5 px-4 text-right text-white font-semibold">{formatBRLDecimals(m.investment)}</td>
                        <td className="py-3.5 px-4 text-right text-white/90">{m.leads.toLocaleString('pt-BR')}</td>
                        <td className="py-3.5 px-4 text-right text-white/90">{m.vendas}</td>
                        <td className="py-3.5 px-4 text-right text-white font-semibold">{formatBRLDecimals(m.faturamento)}</td>
                        <td className="py-3.5 px-4 text-right text-brand-cyan font-bold font-outfit">{m.roas.toFixed(1)}x</td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="bg-brand-cyan/5 font-bold border-t border-brand-border/60">
                      <td className="py-4 px-4 text-brand-cyan font-black font-outfit">Total</td>
                      <td className="py-4 px-4 text-right text-white font-black">{formatBRLDecimals(totalComAcelera.investment)}</td>
                      <td className="py-4 px-4 text-right text-white font-black">{totalComAcelera.leads.toLocaleString('pt-BR')}</td>
                      <td className="py-4 px-4 text-right text-white font-black">{totalComAcelera.vendas}</td>
                      <td className="py-4 px-4 text-right text-white font-black">{formatBRLDecimals(totalComAcelera.faturamento)}</td>
                      <td className="py-4 px-4 text-right text-brand-cyan font-black font-outfit">{totalComAcelera.roas.toFixed(1)}x</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>



          </div>

        </div>

      </div>

      {/* RENDER PORTAL PARA IMPRESSÃO (Siblings of #root) */}
      {ReactDOM.createPortal(portalContent, document.getElementById('print-proposal'))}

    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
