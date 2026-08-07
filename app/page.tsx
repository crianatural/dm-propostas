"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";

type Tab = "dados" | "custos" | "escopo" | "imagem" | "proposta";

type CostItem = {
  id: number;
  service: string;
  unit: string;
  quantity: number;
  unitCost: number;
  salePrice: number;
};

const initialCosts: CostItem[] = [
  { id: 1, service: "Demolição e retirada", unit: "m²", quantity: 36, unitCost: 45, salePrice: 70 },
  { id: 2, service: "Estrutura e cobertura", unit: "m²", quantity: 112, unitCost: 135, salePrice: 210 },
  { id: 3, service: "Reboco interno e externo", unit: "m²", quantity: 284, unitCost: 32, salePrice: 52 },
  { id: 4, service: "Contrapiso nivelado", unit: "m²", quantity: 126, unitCost: 30, salePrice: 48 },
  { id: 5, service: "Revestimento cerâmico", unit: "m²", quantity: 98, unitCost: 42, salePrice: 68 },
];

const tabs: { id: Tab; label: string; short: string }[] = [
  { id: "dados", label: "Cliente e obra", short: "01" },
  { id: "custos", label: "Custos internos", short: "02" },
  { id: "escopo", label: "Escopo comercial", short: "03" },
  { id: "imagem", label: "Imagem da obra", short: "04" },
  { id: "proposta", label: "Proposta", short: "05" },
];

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function Home() {
  const [tab, setTab] = useState<Tab>("dados");
  const [client, setClient] = useState("Nome do cliente");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("Endereço da obra");
  const [category, setCategory] = useState("Reforma residencial");
  const [proposal, setProposal] = useState("DM-2026-001");
  const [deadline, setDeadline] = useState("90 dias corridos");
  const [validity, setValidity] = useState("10 dias");
  const [payment, setPayment] = useState("30% na contratação + 4 parcelas por etapa");
  const [scope, setScope] = useState(
    "Reforma e modernização da residência, contemplando demolições controladas, nova cobertura, regularização de superfícies, revestimentos e acabamentos descritos nesta proposta."
  );
  const [notIncluded, setNotIncluded] = useState(
    "Projetos complementares, taxas públicas, mobiliário, equipamentos e serviços não descritos no escopo."
  );
  const [costs, setCosts] = useState(initialCosts);
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const totals = useMemo(() => {
    const cost = costs.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    const sale = costs.reduce((sum, item) => sum + item.quantity * item.salePrice, 0);
    return { cost, sale, profit: sale - cost, margin: sale ? ((sale - cost) / sale) * 100 : 0 };
  }, [costs]);

  const updateCost = (id: number, field: keyof CostItem, value: string) => {
    setCosts((current) => current.map((item) => item.id === id
      ? { ...item, [field]: field === "service" || field === "unit" ? value : Number(value) }
      : item));
  };

  const prepareImage = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const source = String(reader.result);
      const preview = new Image();
      preview.onerror = () => resolve(source);
      preview.onload = () => {
        const maxSide = 2000;
        const scale = Math.min(1, maxSide / Math.max(preview.naturalWidth, preview.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(preview.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(preview.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) return resolve(source);
        context.drawImage(preview, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.88));
      };
      preview.src = source;
    };
    reader.readAsDataURL(file);
  });

  const applyImage = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    try {
      setImage(await prepareImage(file));
      setImageName(file.name);
    } catch {
      setImageName("");
    }
  };

  const onUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await applyImage(file);
  };

  const handlePrint = async () => {
    const images = Array.from(document.querySelectorAll<HTMLImageElement>(".proposal-sheet img"));
    await Promise.all(images.map(async (item) => {
      if (item.complete && item.naturalWidth > 0) return;
      try {
        await item.decode();
      } catch {
        await new Promise<void>((resolve) => {
          item.addEventListener("load", () => resolve(), { once: true });
          item.addEventListener("error", () => resolve(), { once: true });
        });
      }
    }));
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    window.print();
  };

  const addItem = () => {
    setCosts((current) => [...current, {
      id: Math.max(0, ...current.map((item) => item.id)) + 1,
      service: "Novo serviço",
      unit: "m²",
      quantity: 1,
      unitCost: 0,
      salePrice: 0,
    }]);
  };

  const saveDraft = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-logo" src="./brand/dm-logo-branco.png" alt="DM Soluções em Obras" />
          <small>Sistema interno de propostas</small>
        </div>

        <nav aria-label="Etapas da proposta">
          <p className="nav-label">NOVA PROPOSTA</p>
          {tabs.map((item) => (
            <button key={item.id} className={`nav-item ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}>
              <span className="nav-number">{item.short}</span>
              <span>{item.label}</span>
              {item.id === "imagem" && image && <i className="done">✓</i>}
            </button>
          ))}
        </nav>

        <div className="privacy-note">
          <span className="lock">◇</span>
          <div><strong>Área interna da DM</strong><p>Custos e margens nunca aparecem no PDF do cliente.</p></div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p>PROPOSTA EM EDIÇÃO</p>
            <strong>{proposal} <span>•</span> {client}</strong>
          </div>
          <div className="edit-status"><i /> Dados protegidos</div>
          <div className="top-actions">
            <button className="button ghost" onClick={saveDraft}>{saved ? "Salvo ✓" : "Salvar rascunho"}</button>
            <button className="button dark" onClick={() => setTab("proposta")}>Visualizar proposta</button>
          </div>
        </header>

        <div className="content">
          {tab === "dados" && (
            <div className="panel page-enter">
              <SectionIntro eyebrow="Etapa 01" title="Cliente e obra" text="Informações que identificam a proposta e serão exibidas ao cliente." />
              <div className="form-grid">
                <Field label="Nome do cliente" value={client} onChange={setClient} />
                <Field label="Telefone / WhatsApp" value={phone} onChange={setPhone} />
                <Field label="Endereço da obra" value={address} onChange={setAddress} wide />
                <Field label="Categoria" value={category} onChange={setCategory} />
                <Field label="Número da proposta" value={proposal} onChange={setProposal} />
                <Field label="Prazo previsto" value={deadline} onChange={setDeadline} />
                <Field label="Validade da proposta" value={validity} onChange={setValidity} />
              </div>
              <StepFooter next="Custos internos" onNext={() => setTab("custos")} />
            </div>
          )}

          {tab === "custos" && (
            <div className="panel wide-panel page-enter">
              <SectionIntro eyebrow="Etapa 02 • Uso interno" title="Custos e formação do preço" text="O cliente verá apenas o investimento final. Quantidades, custos e margens ficam protegidos nesta área." />
              <div className="cost-summary">
                <Summary label="Custo estimado" value={brl.format(totals.cost)} />
                <Summary label="Preço de venda" value={brl.format(totals.sale)} accent />
                <Summary label="Lucro estimado" value={brl.format(totals.profit)} />
                <Summary label="Margem" value={`${totals.margin.toFixed(1)}%`} />
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Serviço</th><th>Un.</th><th>Qtd.</th><th>Custo un.</th><th>Venda un.</th><th>Subtotal</th><th></th></tr></thead>
                  <tbody>{costs.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Serviço"><input value={item.service} onChange={(e) => updateCost(item.id, "service", e.target.value)} /></td>
                      <td data-label="Unidade"><input className="small-input" value={item.unit} onChange={(e) => updateCost(item.id, "unit", e.target.value)} /></td>
                      <td data-label="Quantidade"><input className="small-input" type="number" value={item.quantity} onChange={(e) => updateCost(item.id, "quantity", e.target.value)} /></td>
                      <td data-label="Custo unitário"><MoneyInput value={item.unitCost} onChange={(v) => updateCost(item.id, "unitCost", v)} /></td>
                      <td data-label="Venda unitária"><MoneyInput value={item.salePrice} onChange={(v) => updateCost(item.id, "salePrice", v)} /></td>
                      <td data-label="Subtotal" className="subtotal">{brl.format(item.quantity * item.salePrice)}</td>
                      <td className="remove-cell"><button className="remove" aria-label={`Remover ${item.service}`} onClick={() => setCosts((current) => current.filter((cost) => cost.id !== item.id))}>×</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <button className="add-row" onClick={addItem}>＋ Adicionar serviço</button>
              <StepFooter back="Cliente e obra" onBack={() => setTab("dados")} next="Escopo comercial" onNext={() => setTab("escopo")} />
            </div>
          )}

          {tab === "escopo" && (
            <div className="panel page-enter">
              <SectionIntro eyebrow="Etapa 03" title="Escopo comercial" text="Transforme a composição técnica em uma descrição clara e segura para o cliente." />
              <label className="field textarea-field"><span>Resumo da obra</span><textarea value={scope} onChange={(e) => setScope(e.target.value)} /></label>
              <div className="service-chips">
                <span>Serviços incluídos no PDF</span>
                <div>{costs.map((item) => <button key={item.id} className="chip">✓ {item.service}</button>)}</div>
              </div>
              <label className="field textarea-field"><span>Não contemplado</span><textarea value={notIncluded} onChange={(e) => setNotIncluded(e.target.value)} /></label>
              <Field label="Condição de pagamento" value={payment} onChange={setPayment} wide />
              <StepFooter back="Custos internos" onBack={() => setTab("custos")} next="Imagem da obra" onNext={() => setTab("imagem")} />
            </div>
          )}

          {tab === "imagem" && (
            <div className="panel page-enter">
              <SectionIntro eyebrow="Etapa 04" title="Imagem da casa ou obra" text="Escolha uma foto do local. Ela será aplicada na capa da proposta para aumentar o impacto da apresentação." />
              <div className={`upload-layout ${image ? "has-image" : ""}`}>
                <div className="upload-box" onClick={() => fileRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={async (e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (!file) return;
                  await applyImage(file);
                }}>
                  {image ? <img src={image} alt="Prévia da obra enviada" /> : <div className="upload-empty"><span>＋</span><strong>Enviar imagem da obra</strong><p>Arraste uma foto ou clique para selecionar</p><small>JPG, PNG ou WEBP • até 10 MB</small></div>}
                  <input ref={fileRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={onUpload} />
                </div>
                {image && <div className="image-details">
                  <span className="status-badge">✓ Imagem adicionada</span>
                  <h3>{imageName}</h3>
                  <p>A foto será recortada automaticamente no formato horizontal da capa, mantendo o centro da imagem em destaque.</p>
                  <button className="button ghost" onClick={() => fileRef.current?.click()}>Trocar imagem</button>
                  <button className="text-button" onClick={() => { setImage(null); setImageName(""); }}>Remover</button>
                </div>}
              </div>
              <div className="tip"><strong>Dica para um resultado melhor</strong><p>Use uma foto horizontal, bem iluminada e sem elementos cobrindo a fachada principal.</p></div>
              <StepFooter back="Escopo comercial" onBack={() => setTab("escopo")} next="Ver proposta" onNext={() => setTab("proposta")} />
            </div>
          )}

          {tab === "proposta" && (
            <div className="proposal-area page-enter">
              <div className="preview-toolbar">
                <div><span>PRÉVIA DO CLIENTE</span><strong>Somente dados comerciais</strong></div>
                <button className="button ghost" onClick={() => setTab("dados")}>Editar dados</button>
                <button className="button gold" onClick={handlePrint}>Gerar PDF</button>
              </div>
              <article className="proposal-sheet">
                <div className="cover-image print-page">
                  <img className="cover-print-base" src="./brand/cover-print-base.svg" alt="" aria-hidden="true" />
                  {image ? <img className="cover-photo" src={image} alt="Casa ou obra do cliente" loading="eager" decoding="sync" /> : <div className="cover-placeholder"><img src="./brand/dm-logo-dourado.png" alt="DM Soluções em Obras" /><p>Adicione uma imagem da obra para personalizar esta capa</p></div>}
                  <div className="cover-gradient" />
                  <div className="cover-gold-corner" />
                  <div className="cover-navy-panel" />
                  <div className="cover-brand"><img src="./brand/dm-logo-branco.png" alt="DM Soluções em Obras" /></div>
                  <div className="cover-copy"><p>PROPOSTA COMERCIAL</p><h1>{category}</h1><span>{address}</span></div>
                  <div className="cover-client"><span>CLIENTE</span><strong>{client}</strong><small>{proposal}</small></div>
                </div>
                <div className="proposal-body proposal-print-page print-page scope-page">
                    <div className="proposal-meta"><div><span>PREPARADA PARA</span><strong>{client}</strong></div><div><span>PROPOSTA</span><strong>{proposal}</strong></div><div><span>EMISSÃO</span><strong>06 AGO 2026</strong></div></div>
                    <section><p className="section-number">01 / ESCOPO DOS SERVIÇOS</p><h2>Uma execução organizada, do início à entrega.</h2><p>{scope}</p><div className="commercial-services">{costs.map((item, index) => <span key={item.id}><b>{String(index + 1).padStart(2, "0")}</b>{item.service}</span>)}</div></section>
                </div>
                <div className="proposal-body proposal-print-page print-page terms-page">
                    <section className="conditions"><p className="section-number">02 / CONDIÇÕES</p><div className="condition-grid"><div><span>PRAZO PREVISTO</span><strong>{deadline}</strong></div><div><span>VALIDADE</span><strong>{validity}</strong></div><div><span>PAGAMENTO</span><strong>{payment}</strong></div></div><p className="muted"><strong>Não contemplado:</strong> {notIncluded}</p></section>
                    <section className="investment"><div><p className="section-number">03 / INVESTIMENTO</p><h2>Valor total da proposta</h2><p>Materiais, mão de obra e acompanhamento conforme escopo.</p></div><strong>{brl.format(totals.sale)}</strong></section>
                    <footer><img className="footer-logo" src="./brand/dm-logo-azul.png" alt="DM Soluções em Obras" /><span>Contato comercial da DM Construções</span></footer>
                </div>
              </article>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function SectionIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="section-intro"><div className="section-mark">DM</div><div><p>{eyebrow}</p><h1>{title}</h1><span>{text}</span></div></div>;
}

function Field({ label, value, onChange, wide = false }: { label: string; value: string; onChange: (value: string) => void; wide?: boolean }) {
  return <label className={`field ${wide ? "wide" : ""}`}><span>{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}

function MoneyInput({ value, onChange }: { value: number; onChange: (value: string) => void }) {
  return <div className="money-input"><span>R$</span><input type="number" value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}

function Summary({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className={`summary ${accent ? "accent" : ""}`}><span>{label}</span><strong>{value}</strong></div>;
}

function StepFooter({ back, onBack, next, onNext }: { back?: string; onBack?: () => void; next: string; onNext: () => void }) {
  return <div className="step-footer">{back ? <button className="back-link" onClick={onBack}>← {back}</button> : <span />}<button className="button dark" onClick={onNext}>Continuar: {next} →</button></div>;
}
