import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FinancialData {
  totalBalance: number;
  hdfcBalance: number;
  postalBalance: number;
  totalExpenses: number;
  totalIncome: number;
  categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  splitsPending: number;
  splitsSettled: number;
  transactionCount: number;
  recentTransactions: Array<{
    amount: number;
    type: string;
    category: string;
    description: string;
    date: string;
    account: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, financialData } = await req.json() as { 
      message: string; 
      financialData: FinancialData 
    };
    
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context from financial data
    const financialContext = `
## Current Financial Summary:
- **Total Balance**: ₹${financialData.totalBalance.toFixed(2)}
  - HDFC Bank: ₹${financialData.hdfcBalance.toFixed(2)}
  - Postal Bank: ₹${financialData.postalBalance.toFixed(2)}
- **Total Income**: ₹${financialData.totalIncome.toFixed(2)}
- **Total Expenses**: ₹${financialData.totalExpenses.toFixed(2)}
- **Split Expenses**: Pending ₹${financialData.splitsPending.toFixed(2)}, Settled ₹${financialData.splitsSettled.toFixed(2)}
- **Total Transactions**: ${financialData.transactionCount}

## Spending by Category (sorted by highest):
${financialData.categoryBreakdown.map(c => 
  `- ${c.category}: ₹${c.amount.toFixed(2)} (${c.percentage.toFixed(1)}%)`
).join('\n') || 'No expenses recorded yet.'}

## Recent Transactions:
${financialData.recentTransactions.slice(0, 10).map(t => 
  `- ${t.type === 'expense' ? '📉' : '📈'} ${t.description} (${t.category}): ₹${t.amount.toFixed(2)} via ${t.account} on ${new Date(t.date).toLocaleDateString('en-IN')}`
).join('\n') || 'No recent transactions.'}
`;

    const systemPrompt = `You are a friendly and insightful personal financial advisor AI assistant. You have access to the user's complete financial data and transaction history.

Your role is to:
1. Answer questions about their spending patterns and finances
2. Identify areas where they might be overspending
3. Suggest practical ways to save money
4. Provide personalized financial insights based on their actual data
5. Be encouraging and supportive while giving honest advice

Guidelines:
- Always reference specific numbers from their data when giving advice
- Be conversational and friendly, not robotic
- Use Indian Rupee (₹) format for all amounts
- Keep responses concise but informative (2-4 paragraphs max)
- If they have high spending in a category, suggest specific ways to reduce it
- Celebrate good financial habits when you see them
- If there's no data yet, encourage them to start tracking expenses

Current user financial data:
${financialContext}`;

    console.log("Calling OpenRouter API with model xiaomi/mimo-v2-flash:free");
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lovable.dev",
        "X-Title": "Financial Tracker AI",
      },
      body: JSON.stringify({
        model: "xiaomi/mimo-v2-flash:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return the stream directly
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Error in financial-advisor function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
