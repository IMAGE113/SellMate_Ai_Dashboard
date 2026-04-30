const express = require('express');
const { neon } = require('@neondatabase/serverless');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Neon Connection (ဒါကို Render Environment Variable မှာ ထည့်ရမယ်)
const sql = neon(process.env.DATABASE_URL);

// ၁။ အော်ဒါအားလုံးကို ဆွဲထုတ်တဲ့ API
app.get('/orders', async (req, res) => {
    const { tenant_id } = req.query;
    try {
        const result = await sql`SELECT * FROM orders WHERE tenant_id = ${tenant_id} ORDER BY created_at DESC`;
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ၂။ အော်ဒါအသစ်လက်ခံပြီး Telegram ပို့တဲ့ API
app.post('/orders', async (req, res) => {
    const { tenant_id, customer_name, phone, items, total_price } = req.body;
    try {
        // Database ထဲသွင်း
        const newOrder = await sql`
            INSERT INTO orders (tenant_id, customer_name, phone, items, total_price)
            VALUES (${tenant_id}, ${customer_name}, ${phone}, ${items}, ${total_price})
            RETURNING *;
        `;

        // Bot Token ကို ရှာ
        const tenant = await sql`SELECT bot_token, telegram_chat_id FROM tenants WHERE id = ${tenant_id}`;
        
        // Telegram Message ပို့
        if (tenant[0] && tenant[0].bot_token) {
            const msg = `📦 Order New!\nName: ${customer_name}\nItems: ${items}\nTotal: ${total_price}`;
            await fetch(`https://api.telegram.org/bot${tenant[0].bot_token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: tenant[0].telegram_chat_id || 'YOUR_CHAT_ID', text: msg })
            });
        }

        res.json(newOrder[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
