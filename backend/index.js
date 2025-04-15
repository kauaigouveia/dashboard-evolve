const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3015;

app.use(cors());
app.use(express.json());

let propostas = [];
let parceiros = [];

app.get("/propostas", (req, res) => res.json(propostas));
app.post("/propostas", (req, res) => {
  const nova = { ...req.body, data: new Date() };
  propostas.push(nova);
  res.json({ sucesso: true });
});

app.get("/parceiros", (req, res) => res.json(parceiros));
app.post("/parceiros", (req, res) => {
  parceiros.push({ nome: req.body.nome });
  res.json({ sucesso: true });
});

app.listen(PORT, () => console.log("Servidor rodando na porta", PORT));
