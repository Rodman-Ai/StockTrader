export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';
export type OrderStatus = 'open' | 'filled' | 'rejected' | 'cancelled';

export type Order = {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  qty: number;
  limitPrice?: number;
  status: OrderStatus;
  placedAt: number;
};

export type Trade = {
  id: string;
  orderId: string;
  symbol: string;
  side: OrderSide;
  qty: number;
  price: number;
  total: number;
  ts: number;
};

export type Position = {
  symbol: string;
  qty: number;
  avgCost: number;
};

export type Portfolio = {
  cash: number;
  positions: Record<string, Position>;
  history: Trade[];
  openOrders: Order[];
};

export type PlaceOrderInput = {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  qty: number;
  limitPrice?: number;
};

export type PlaceOrderResult =
  | { ok: true; order: Order; trade?: Trade }
  | { ok: false; reason: string };
