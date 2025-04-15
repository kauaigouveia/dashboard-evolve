import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import * as XLSX from "xlsx";

const API_URL = "https://dashboard-evolve-backend.onrender.com";

const App = () => {
  return (
    <Router>
      <div className="p-4">
        <nav className="mb-4 flex gap-4">
          <Link to="/">Dashboard</Link>
          <Link to="/inserir">Inserir Proposta</Link>
          <Link to="/acompanhar">Acompanhamento</Link>
          <Link to="/parceiros">Parceiros</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inserir" element={<InserirProposta />} />
          <Route path="/acompanhar" element={<Acompanhamento />} />
          <Route path="/parceiros" element={<CadastroParceiros />} />
        </Routes>
      </div>
    </Router>
  );
};

const Dashboard = () => {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/propostas`)
      .then(res => res.json())
      .then(setDados);
  }, []);

  const total = dados.reduce((acc, cur) => acc + parseFloat(cur.valor || 0), 0);
  const porParceiro = Object.entries(
    dados.reduce((acc, cur) => {
      acc[cur.parceiro] = (acc[cur.parceiro] || 0) + parseFloat(cur.valor || 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid gap-4">
      <Card><CardContent>Valor Total Produzido: R$ {total.toFixed(2)}</CardContent></Card>
      <BarChart width={500} height={300} data={porParceiro}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

const InserirProposta = () => {
  const [form, setForm] = useState({ nome: "", cpf: "", ade: "", banco: "", valor: "", digitador: "", parceiro: "" });
  const [parceiros, setParceiros] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/parceiros`).then(res => res.json()).then(setParceiros);
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    const body = { ...form, valor: parseFloat(form.valor.replace(/[^\d,.-]+/g, '').replace(',', '.')) };
    fetch(`${API_URL}/propostas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(res => res.json())
      .then(() => {
        setForm({ nome: "", cpf: "", ade: "", banco: "", valor: "", digitador: "", parceiro: "" });
        alert("Proposta salva com sucesso!");
      });
  };

  return (
    <div className="grid gap-2 max-w-md">
      <Input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome do Cliente" />
      <Input name="cpf" value={form.cpf} onChange={handleChange} placeholder="CPF (000.000.000-00)" />
      <Input name="ade" value={form.ade} onChange={handleChange} placeholder="ADE" />
      <Input name="banco" value={form.banco} onChange={handleChange} placeholder="Banco" />
      <Input name="valor" value={form.valor} onChange={handleChange} placeholder="Valor (R$ 0,00)" />
      <Input name="digitador" value={form.digitador} onChange={handleChange} placeholder="Agente Digitador" />
      <Input name="parceiro" value={form.parceiro} onChange={handleChange} list="parceiros" placeholder="Parceiro" />
      <datalist id="parceiros">
        {parceiros.map((p, i) => <option key={i} value={p.nome} />)}
      </datalist>
      <Button onClick={handleSubmit}>Salvar Proposta</Button>
    </div>
  );
};

const Acompanhamento = () => {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/propostas`)
      .then(res => res.json())
      .then(setDados);
  }, []);

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Propostas");
    XLSX.writeFile(wb, "propostas.xlsx");
  };

  return (
    <div>
      <Button onClick={exportarExcel}>Exportar Excel</Button>
      <table className="w-full mt-4 text-sm">
        <thead><tr><th>Data</th><th>Nome</th><th>CPF</th><th>Banco</th><th>Valor</th><th>Parceiro</th></tr></thead>
        <tbody>
          {dados.map((item, i) => (
            <tr key={i} className="border-t"><td>{new Date(item.data).toLocaleString()}</td><td>{item.nome}</td><td>{item.cpf}</td><td>{item.banco}</td><td>{item.valor}</td><td>{item.parceiro}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CadastroParceiros = () => {
  const [novo, setNovo] = useState("");
  const [lista, setLista] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/parceiros`).then(res => res.json()).then(setLista);
  }, []);

  const adicionar = () => {
    fetch(`${API_URL}/parceiros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: novo })
    }).then(() => {
      setLista([...lista, { nome: novo }]);
      setNovo("");
    });
  };

  return (
    <div className="grid gap-2 max-w-md">
      <Input value={novo} onChange={e => setNovo(e.target.value)} placeholder="Nome do parceiro" />
      <Button onClick={adicionar}>Cadastrar</Button>
      <ul>
        {lista.map((p, i) => <li key={i}>{p.nome}</li>)}
      </ul>
    </div>
  );
};

export default App;
