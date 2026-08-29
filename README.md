# Nutri+ 🏋️‍♂️🥗 - Plataforma para Nutricionistas e Personal Trainers

Plataforma para profissionais da saúde gerenciarem clientes com geração automática de dietas e treinos baseada em cálculo de calorias (TMB/TDEE).

## ✨ Features MVP
- Auth JWT (Admin / Profissional / Cliente) + Refresh Token
- CRUD Clientes + Avaliação Física (IMC, TMB, TDEE)
- Dieta automática via API (Edamam/Nutritionix + OpenAI)
- Treino automático por objetivo
- Pagamentos: PIX, Cartão e Boleto (Mercado Pago)
- Dashboard Cliente + Evolução de peso

## 🛠️ Stack
- **Backend:** Node.js + Express + MongoDB (Mongoose) + JWT
- **Frontend:** React (Vite) + HTML + CSS
- **Infra:** Docker + Docker Compose

## 📁 Estrutura
```
/backend  -> Node API :3001
/frontend -> React App :5173
docker-compose.yml
```

## 🚀 Como Rodar

### 1. Pré-requisitos
Node 20+, Docker Desktop, Git

### 2. Clone e instale
```bash
git clone https://github.com/seu-user/nutri-plus.git
cd nutri-plus
```

### 3. Configure o .env
Crie `/backend/.env`:
```env
PORT=3001
MONGO_URI=mongodb://mongo:27017/nutriplus
JWT_SECRET=seu_secret_super_forte
JWT_REFRESH_SECRET=seu_refresh_secret
MERCADOPAGO_ACCESS_TOKEN=TEST-xxx
EDAMAM_APP_ID=xxx
EDAMAM_APP_KEY=xxx
OPENAI_API_KEY=sk-xxx
```

### 4. Rode com Docker (Recomendado)
```bash
docker-compose up --build
```
Acesse: Frontend `http://localhost:5173` | API `http://localhost:3001/api`

### 5. Rode sem Docker
```bash
# Terminal 1
cd backend && npm install && npm run dev
# Terminal 2
cd frontend && npm install && npm run dev
```

## 🔐 API Endpoints
| Método | Rota | Acesso |
|---|---|---|
| POST | /api/auth/register | Público |
| POST | /api/auth/login | Público |
| GET | /api/clientes | NUTRI, PERSONAL |
| POST | /api/avaliacao/calcular | NUTRI, PERSONAL |
| POST | /api/dieta/gerar | NUTRI |
| POST | /api/treino/gerar | PERSONAL |
| POST | /api/pagamento/pix | CLIENTE |
| POST | /api/pagamento/cartao | CLIENTE |
| POST | /api/pagamento/boleto | CLIENTE |
| POST | /api/webhook/mercadopago | Webhook |

## 👥 Roles
- `ADMIN`: Gerencia planos e usuários
- `NUTRI` / `PERSONAL`: Criam dietas/treinos para seus clientes
- `CLIENTE`: Apenas visualiza sua dieta/treino

## 💳 Teste Pagamento (Mercado Pago)
Use cartão teste `5031 4332 1540 6351` e PIX com QR Code gerado em modo TEST.

## 📦 Docker
```bash
docker-compose down    # parar
docker-compose logs -f # ver logs
```

## 🗓️ Roadmap 30 Dias (2h/dia)
Semana 1: Setup + Auth JWT | Semana 2: Dieta/Treino + APIs | Semana 3: Pagamentos | Semana 4: Polish + Deploy
