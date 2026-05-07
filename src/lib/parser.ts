export interface ParsedItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

const CATEGORY_MAP: Record<string, string[]> = {
  'Hortifruti': ['alface', 'tomate', 'cebola', 'alho', 'batata', 'cenoura', 'maçã', 'banana', 'laranja', 'limão', 'abacaxi', 'melancia', 'uva', 'couve', 'brócolis', 'pimentão', 'fruta', 'legume', 'verdura'],
  'Padaria': ['pão', 'bisnaguinha', 'bolo', 'torta', 'doce', 'salgado', 'pão de queijo', 'baguete', 'croissant'],
  'Açougue': ['carne', 'frango', 'peixe', 'linguiça', 'salsicha', 'bife', 'sobrecoxa', 'asa', 'costela', 'picanha', 'maminha', 'alcatra'],
  'Mistura': ['presunto', 'queijo', 'mortadela', 'salame', 'presuntada', 'patê'],
  'Frios': ['leite', 'iogurte', 'manteiga', 'requeijão', 'margarina', 'ovos', 'yakult'],
  'Bebidas': ['água', 'suco', 'refrigerante', 'cerveja', 'vinho', 'vodka', 'whisky', 'energético', 'chá', 'café'],
  'Limpeza': ['detergente', 'sabão', 'amaciante', 'desinfetante', 'veja', 'cloro', 'água sanitária', 'esponja', 'vassoura', 'rodo', 'saco de lixo'],
  'Higiene': ['shampoo', 'condicionador', 'sabonete', 'pasta de dente', 'escova de dente', 'desodorante', 'papel higiênico', 'absorsente', 'fralda', 'lenço'],
  'Pet': ['ração', 'petisco', 'areia', 'brinquedo pet'],
  'Utilidades': ['pilha', 'lâmpada', 'fósforo', 'isqueiro', 'carvão'],
  'Congelados': ['nuggets', 'pizza', 'hambúrguer', 'sorvete', 'açai', 'pão de queijo congelado']
};

export const parseSmartInput = (input: string): ParsedItem => {
  const trimmed = input.trim().toLowerCase();
  
  // Pattern: "2 leite" or "2x leite"
  const qtyNameRegex = /^(\d+x?)\s+(.+)$/;
  // Pattern: "arroz 5kg" or "arroz 500g"
  const nameQtyUnitRegex = /^(.+)\s+(\d+)(kg|g|l|ml|un|pct|caixa|sc)$/;

  let quantity = 1;
  let name = trimmed;
  let unit = 'un';

  const qtyMatch = trimmed.match(qtyNameRegex);
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1].replace('x', ''));
    name = qtyMatch[2];
  } else {
    const nameQtyUnitMatch = trimmed.match(nameQtyUnitRegex);
    if (nameQtyUnitMatch) {
      name = nameQtyUnitMatch[1];
      quantity = parseInt(nameQtyUnitMatch[2]);
      unit = nameQtyUnitMatch[3];
    }
  }

  // Detect category
  let category = 'Outros';
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(keyword => name.includes(keyword))) {
      category = cat;
      break;
    }
  }

  return {
    name: name.charAt(0).toUpperCase() + name.slice(1),
    quantity,
    unit,
    category
  };
};

export const getSuggestions = (input: string, preferredCategories: string[] = []): string[] => {
  if (input.length < 2) return [];
  const normalized = input.toLowerCase();
  
  // 1. Collect items from preferred categories first
  let prioritizedItems: string[] = [];
  if (preferredCategories.length > 0) {
    preferredCategories.forEach(cat => {
      if (CATEGORY_MAP[cat]) {
        prioritizedItems = [...prioritizedItems, ...CATEGORY_MAP[cat]];
      }
    });
  }

  const matchesPrioritized = prioritizedItems
    .filter(item => item.startsWith(normalized));

  // 2. Global items (all categories)
  const allGlobalItems = Object.values(CATEGORY_MAP).flat();
  const globalMatches = allGlobalItems.filter(item => item.startsWith(normalized));
  
  // Combine, remove duplicates (preserving order)
  const combined = [...matchesPrioritized, ...globalMatches];
  
  return Array.from(new Set(combined)).slice(0, 5);
};
