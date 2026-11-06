/**
 * Esquema SQLite local (Seção 5 — Modelo de dados)
 * Compatível com expo-sqlite e Drizzle ORM.
 */
export const SQLITE_MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS shopping_lists (
    id TEXT PRIMARY KEY NOT NULL,
    trip_id TEXT NOT NULL,
    loja TEXT NOT NULL,
    moeda_origem TEXT NOT NULL,
    moeda_destino TEXT NOT NULL,
    cotacao_congelada_json TEXT,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS list_items (
    id TEXT PRIMARY KEY NOT NULL,
    list_id TEXT NOT NULL,
    nome TEXT NOT NULL,
    qtd INTEGER NOT NULL,
    preco_minor INTEGER NOT NULL,
    moeda TEXT NOT NULL,
    FOREIGN KEY (list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS fx_rates (
    par TEXT PRIMARY KEY NOT NULL,
    taxa TEXT NOT NULL,
    obtida_em TEXT NOT NULL
  );`,
] as const;

export const TABLE_NAMES = {
  shoppingLists: 'shopping_lists',
  listItems: 'list_items',
  fxRates: 'fx_rates',
} as const;
