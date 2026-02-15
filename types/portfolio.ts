export interface PortfolioAsset {
    id: string
    user_id: string
    ticker: string
    amount: number      // Quantity of shares
    buy_price: number   // Average buy price
    currency: 'KRW' | 'USD'
    created_at?: string
}

// Extended type for Donut Chart (includes calculated value and color)
export interface PortfolioChartItem extends PortfolioAsset {
    value: number       // amount * current_price (or buy_price for now)
    name: string        // Company Name from API or Ticker
    logoUrl: string
    color?: string
}
