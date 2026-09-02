const axios = require('axios');
const OpenAI = require('openai');

let openai = null;
function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

// === SUA BASE TACO 100% GRÁTIS - PRIORIDADE 1 ===
const ALIMENTOS_FALLBACK = [
  { nome: 'Arroz, branco, cozido', kcal: 128, porcao: '100g' },
  { nome: 'Feijão, carioca, cozido', kcal: 76, porcao: '100g' },
  { nome: 'Frango, peito, grelhado', kcal: 159, porcao: '100g' },
  { nome: 'Ovo, de galinha, cozido', kcal: 146, porcao: '100g' },
  { nome: 'Banana, prata', kcal: 98, porcao: '100g' },
  { nome: 'Pão, francês', kcal: 300, porcao: '100g' },
  { nome: 'Leite, integral', kcal: 61, porcao: '100ml' },
  { nome: 'Batata, inglesa, cozida', kcal: 52, porcao: '100g' },
  { nome: 'Alface, crua', kcal: 11, porcao: '100g' },
  { nome: 'Maçã, fuji, com casca', kcal: 56, porcao: '100g' },
  { nome: 'Aveia, flocos', kcal: 394, porcao: '100g' },
  { nome: 'Iogurte, natural', kcal: 51, porcao: '100g' },
];

const MAPA_REFEICAO = {
  cafe: ['aveia', 'pão', 'leite', 'ovo', 'banana', 'iogurte', 'maçã'],
  almoco: ['arroz', 'feijão', 'frango', 'batata', 'alface', 'ovo'],
  janta: ['arroz', 'feijão', 'frango', 'salada', 'alface', 'batata', 'ovo'],
};

async function buscarNaApiTaco(termo) {
  const url = `https://taco-food-api.herokuapp.com/foods?description=${encodeURIComponent(termo)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const dados = await res.json();
    const lista = Array.isArray(dados) ? dados : dados.foods || [];
    if (!lista.length) return null;
    const item = lista[0];
    const kcal = item.energy?.kcal ?? item.kcal ?? item.energy_kcal ?? item.calories ?? null;
    if (!kcal) return null;
    return { nome: item.description || item.name || termo, kcal: Number(kcal), porcao: '100g', fonte: 'TACO API' };
  } catch { clearTimeout(timeout); return null; }
}

function buscarFallback(termo) {
  const t = termo.toLowerCase();
  const found = ALIMENTOS_FALLBACK.find((a) => a.nome.toLowerCase().includes(t));
  return found ? { ...found, fonte: 'TACO (base local)' } : null;
}

async function buscarAlimento(termo) {
  const api = await buscarNaApiTaco(termo);
  if (api) return api;
  return buscarFallback(termo);
}

function buscarFallbackLista(termo, limite = 10) {
  const t = termo.toLowerCase().trim();
  if (!t) return [];
  return ALIMENTOS_FALLBACK.filter((a) => a.nome.toLowerCase().includes(t)).slice(0, limite).map((a) => ({ ...a, fonte: 'TACO (base local)' }));
}

async function buscarAlimentosParaConsulta(termo) {
  const lista = buscarFallbackLista(termo);
  const api = await buscarNaApiTaco(termo);
  if (api && !lista.some((a) => a.nome === api.nome)) lista.unshift(api);
  return lista.slice(0, 10);
}

async function montarRefeicao(termos, caloriasAlvo) {
  const itens = [];
  let total = 0;
  for (const termo of termos) {
    const alimento = await buscarAlimento(termo);
    if (!alimento) continue;
    const fator = Math.min(1.5, Math.max(0.5, caloriasAlvo / 3 / alimento.kcal));
    const kcalPorcao = Math.round(alimento.kcal * fator);
    itens.push({ alimento: alimento.nome, porcao: alimento.porcao, kcal: kcalPorcao, fonte: alimento.fonte });
    total += kcalPorcao;
    if (total >= caloriasAlvo * 0.85) break;
  }
  return { itens, calorias: total, meta: caloriasAlvo, texto: itens.map((i) => `${i.alimento} (${i.kcal} kcal)`).join('; ') || 'Sem itens' };
}

// === OUTRAS APIS (FALLBACK) ===
async function buscarEdamam(ingrediente) {
  if (!process.env.EDAMAM_APP_ID || !process.env.EDAMAM_APP_KEY) return null;
  try {
    const url = `https://api.edamam.com/api/nutrition-data?app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}&ingr=${encodeURIComponent(ingrediente)}`;
    const { data } = await axios.get(url);
    return data;
  } catch { return null; }
}

async function buscarCalorieNinjas(query) {
  if (!process.env.CALORIENINJAS_API_KEY) return null;
  try {
    const { data } = await axios.get(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`, { headers: { 'X-Api-Key': process.env.CALORIENINJAS_API_KEY } });
    if (data.items && data.items.length) return { fonte: 'calorieninjas', items: data.items };
    return null;
  } catch { return null; }
}

async function buscarOpenFoodFacts(query) {
  try {
    const { data } = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=true&page_size=3`);
    if (data.products && data.products.length) {
      const p = data.products[0];
      const n = p.nutriments || {};
      return { fonte: 'openfoodfacts', nome: p.product_name, calorias: n['energy-kcal_100g'] || n.energy_100g, proteinas: n.proteins_100g, carboidratos: n.carbohydrates_100g, gorduras: n.fat_100g };
    }
    return null;
  } catch { return null; }
}

async function buscarUSDA(query) {
  if (!process.env.USDA_API_KEY) return null;
  try {
    const { data } = await axios.post(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${process.env.USDA_API_KEY}`, { query, pageSize: 1 });
    if (data.foods && data.foods.length) {
      const f = data.foods[0];
      const getNut = (id) => f.foodNutrients?.find(n => n.nutrientId === id)?.value || 0;
      return { fonte: 'usda', nome: f.description, calorias: getNut(1008), proteinas: getNut(1003), carboidratos: getNut(1005), gorduras: getNut(1004) };
    }
    return null;
  } catch { return null; }
}

async function buscarAlimentoUniversal(query) {
  // Cascata com TACO prioritário (grátis e brasileiro)
  return (await buscarAlimento(query)) || (await buscarCalorieNinjas(query)) || (await buscarOpenFoodFacts(query)) || (await buscarUSDA(query)) || (await buscarEdamam(query)) || null;
}

async function gerarDietaOpenAI({ caloriasAlvo, macros, restricoes = '', objetivo = 'manutencao' }) {
  const client = getOpenAI();
  if (!client) return gerarDietaMock(caloriasAlvo, macros);
  const prompt = `Gere uma dieta brasileira com ${caloriasAlvo} kcal, proteinas ${macros.proteinas}g, carboidratos ${macros.carboidratos}g, gorduras ${macros.gorduras}g. Objetivo: ${objetivo}. Restrições: ${restricoes || 'nenhuma'}. Retorne JSON com array refeicoes [{nome, horario, alimentos:[{nome,quantidade,calorias,proteinas,carboidratos,gorduras}], calorias}].`;
  try {
    const res = await client.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' } });
    return JSON.parse(res.choices[0].message.content);
  } catch { return gerarDietaMock(caloriasAlvo, macros); }
}

function gerarDietaMock(caloriasAlvo, macros) {
  const porRef = Math.round(caloriasAlvo / 4);
  return {
    refeicoes: [
      { nome: 'Café da manhã', horario: '07:00', alimentos: [{ nome: 'Ovos mexidos', quantidade: '2 unidades', calorias: porRef * 0.3 }, { nome: 'Pão integral', quantidade: '2 fatias', calorias: porRef * 0.2 }], calorias: porRef },
      { nome: 'Almoço', horario: '12:00', alimentos: [{ nome: 'Frango grelhado', quantidade: '150g', calorias: porRef * 0.4 }, { nome: 'Arroz integral', quantidade: '100g', calorias: porRef * 0.3 }], calorias: porRef },
      { nome: 'Lanche', horario: '15:30', alimentos: [{ nome: 'Whey + fruta', quantidade: '1 dose + 1 banana', calorias: porRef * 0.2 }], calorias: porRef * 0.5 },
      { nome: 'Jantar', horario: '19:30', alimentos: [{ nome: 'Peixe + legumes', quantidade: '150g + 200g', calorias: porRef * 0.4 }], calorias: porRef },
    ]
  };
}

const TREINOS_BASE = {
  hipertrofia: {
    iniciante: [
      { dia: 'A - Peito/Tríceps', grupoMuscular: 'peito', exercicios: [{ nome: 'Supino reto', series: 3, repeticoes: '8-12' }, { nome: 'Flexão', series: 3, repeticoes: '10-15' }] },
      { dia: 'B - Costas/Bíceps', grupoMuscular: 'costas', exercicios: [{ nome: 'Remada curvada', series: 3, repeticoes: '8-12' }, { nome: 'Puxada frente', series: 3, repeticoes: '10-12' }] },
      { dia: 'C - Pernas/Ombro', grupoMuscular: 'pernas', exercicios: [{ nome: 'Agachamento', series: 4, repeticoes: '8-10' }, { nome: 'Desenvolvimento', series: 3, repeticoes: '10-12' }] },
    ],
    intermediario: [
      { dia: 'A - Peito/Ombro', grupoMuscular: 'peito', exercicios: [{ nome: 'Supino inclinado', series: 4, repeticoes: '6-10' }] },
      { dia: 'B - Costas', grupoMuscular: 'costas', exercicios: [{ nome: 'Levantamento terra', series: 4, repeticoes: '5-8' }] },
      { dia: 'C - Pernas', grupoMuscular: 'pernas', exercicios: [{ nome: 'Leg press', series: 4, repeticoes: '10-12' }] },
      { dia: 'D - Braços', grupoMuscular: 'bracos', exercicios: [{ nome: 'Rosca direta', series: 3, repeticoes: '10-12' }] },
    ]
  },
  emagrecimento: [
    { dia: 'A - Full Body + HIIT', grupoMuscular: 'fullbody', exercicios: [{ nome: 'Agachamento com salto', series: 3, repeticoes: '15' }, { nome: 'Burpee', series: 3, repeticoes: '10' }] },
    { dia: 'B - Cardio + Core', grupoMuscular: 'core', exercicios: [{ nome: 'Prancha', series: 3, repeticoes: '45s' }, { nome: 'Corrida intervalada', series: 1, repeticoes: '20min' }] },
  ]
};

function gerarTreinoMock({ objetivo = 'hipertrofia', nivel = 'iniciante', frequencia = 3 }) {
  const base = TREINOS_BASE[objetivo]?.[nivel] || TREINOS_BASE[objetivo] || TREINOS_BASE.hipertrofia.iniciante;
  return Array.isArray(base) ? base.slice(0, frequencia) : [];
}

async function gerarTreinoOpenAI({ objetivo, nivel, frequencia }) {
  const client = getOpenAI();
  if (!client) return gerarTreinoMock({ objetivo, nivel, frequencia });
  const prompt = `Gere treino objetivo ${objetivo} nivel ${nivel} frequencia ${frequencia}x semana. Retorne JSON {dias:[{dia, grupoMuscular, exercicios:[{nome, series, repeticoes, descanso}]}]}`;
  try {
    const res = await client.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' } });
    const data = JSON.parse(res.choices[0].message.content);
    return data.dias || data;
  } catch { return gerarTreinoMock({ objetivo, nivel, frequencia }); }
}

module.exports = {
  ALIMENTOS_FALLBACK,
  MAPA_REFEICAO,
  buscarAlimento,
  buscarAlimentosParaConsulta,
  montarRefeicao,
  buscarNaApiTaco,
  buscarFallback,
  buscarFallbackLista,
  buscarEdamam,
  buscarCalorieNinjas,
  buscarOpenFoodFacts,
  buscarUSDA,
  buscarAlimentoUniversal,
  gerarDietaOpenAI,
  gerarTreinoOpenAI,
  gerarDietaMock,
  gerarTreinoMock
};
