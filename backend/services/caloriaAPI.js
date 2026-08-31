function calcularIMC(peso, altura) {
  const alturaM = altura > 3 ? altura / 100 : altura;
  return Number((peso / (alturaM * alturaM)).toFixed(2));
}

function classificarIMC(imc) {
  if (imc < 18.5) return 'abaixo do peso';
  if (imc < 24.9) return 'peso normal';
  if (imc < 29.9) return 'sobrepeso';
  if (imc < 34.9) return 'obesidade I';
  if (imc < 39.9) return 'obesidade II';
  return 'obesidade III';
}

function calcularTMB({ peso, altura, idade, sexo }) {
  const alturaCm = altura > 3 ? altura : altura * 100;
  const base = 10 * peso + 6.25 * alturaCm - 5 * idade;
  return sexo === 'masculino' ? Math.round(base + 5) : Math.round(base - 161);
}

function calcularTDEE(tmb, nivelAtividade) {
  const fatores = { sedentario: 1.2, leve: 1.375, moderado: 1.55, ativo: 1.725, muito_ativo: 1.9 };
  return Math.round(tmb * (fatores[nivelAtividade] || 1.55));
}

function calcularCaloriasAlvo(tdee, objetivo) {
  if (objetivo === 'emagrecimento') return tdee - 500;
  if (objetivo === 'hipertrofia') return tdee + 300;
  return tdee;
}

function calcularMacros(caloriasAlvo, peso, objetivo) {
  let proteinaPerKg = 1.8;
  if (objetivo === 'hipertrofia') proteinaPerKg = 2.0;
  if (objetivo === 'emagrecimento') proteinaPerKg = 2.2;
  const proteinas = Math.round(peso * proteinaPerKg);
  const gorduras = Math.round((caloriasAlvo * 0.25) / 9);
  const carboidratos = Math.round((caloriasAlvo - proteinas * 4 - gorduras * 9) / 4);
  return { proteinas, carboidratos, gorduras };
}

function calcularAvaliacaoCompleta({ peso, altura, idade, sexo, nivelAtividade = 'moderado', objetivo = 'manutencao' }) {
  const imc = calcularIMC(peso, altura);
  const tmb = calcularTMB({ peso, altura, idade, sexo });
  const tdee = calcularTDEE(tmb, nivelAtividade);
  const caloriasAlvo = calcularCaloriasAlvo(tdee, objetivo);
  const macros = calcularMacros(caloriasAlvo, peso, objetivo);
  return { imc, classificacao: classificarIMC(imc), tmb, tdee, caloriasAlvo, macros };
}

module.exports = { calcularIMC, classificarIMC, calcularTMB, calcularTDEE, calcularCaloriasAlvo, calcularMacros, calcularAvaliacaoCompleta };
