-- Trocado Backend Schema (PostgreSQL — Etapa 6 / Seção 5)
-- Tabelas Place, PricePoint e PriceVote para o Mapa de Comida Barata e Comunidade.

CREATE TABLE IF NOT EXISTS places (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  endereco TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  categoria TEXT NOT NULL,
  cidade TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_places_cidade_geo
  ON places (cidade, lat, lng);

CREATE TABLE IF NOT EXISTS price_points (
  id TEXT PRIMARY KEY,
  place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  -- Valor sempre em inteiro na menor unidade (pence, centavos) — nunca float
  preco_minor INTEGER NOT NULL CHECK (preco_minor > 0),
  moeda CHAR(3) NOT NULL,
  confirmacoes INTEGER NOT NULL DEFAULT 1 CHECK (confirmacoes >= 0),
  ultima_confirmacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_points_place
  ON price_points (place_id, preco_minor);

CREATE TABLE IF NOT EXISTS price_votes (
  id TEXT PRIMARY KEY,
  price_point_id TEXT NOT NULL REFERENCES price_points(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  voto TEXT NOT NULL CHECK (voto IN ('confirm', 'changed')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_votes_point
  ON price_votes (price_point_id, criado_em DESC);
