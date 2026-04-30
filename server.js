const express = require('express');
const { neon } = require('@neondatabase/serverless');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Neon Connection
const sql = neon(process.env.DATABASE_URL);

// ၁။ အော်ဒါအားလုံးကို ဆွဲထုတ်တဲ့ API (Dashboard အတွက်)
app.get('/orders', async (req, res) => {
    const { tenant_id } = req.query;
    if (!tenant_id) return res.status(400).json({ error: "tenant_id is required" });

    try {
        const result = await sql`
            SELECT * FROM orders 
            WHERE tenant_id = ${tenant_id} 
            ORDER BY created_at DESC
        `;
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ၂။ အော်ဒါအသစ်လက်ခံပြီး Telegram ပို့တဲ့ API (Customer ဝယ်တဲ့အချိန်သုံးရန်)
app.post('/orders', async (req, res) => {
    const { tenant_id, customer_name, phone, items, total_price, address } = req.body;
    
    try {
        // Database ထဲသို့ အော်ဒါအသစ်သွင်းခြင်း
        const newOrder = await sql`
            INSERT INTO orders (tenant_id, customer_name, phone, items, total_price, address)
            VALUES (${tenant_id}, ${customer_name}, ${phone}, ${items}, ${total_price}, ${address})
            RETURNING *;
        `;

        // သက်ဆိုင်ရာ ဆိုင်ရဲ့ Bot Token နဲ့ Chat ID ကို ရှာဖွေခြင်း
        const tenant = await sql`
            SELECT bot_token, telegram_chat_id FROM tenants 
            WHERE id = ${tenant_id}
        `;
        
        // Telegram Message ပို့ဆောင်ခြင်း
        if (tenant[0] && tenant[0].bot_token && tenant[0].telegram_chat_id) {
            const msg = `📦 **Order New!**\n\n👤 Name: ${customer_name}\n📞 Phone: ${phone}\n🛒 Items: ${items}\n💰 Total: ${total_price} ကျပ်\n📍 Address: ${address || 'Not provided'}`;
            
            await fetch(`https://api.telegram.org/bot${tenant[0].bot_token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    chat_id: tenant[0].telegram_chat_id, 
                    text: msg,
                    parse_mode: 'Markdown'
                })
            });
        }

        res.json(newOrder[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ၃။ အော်ဒါ Status ပြောင်းလဲပေးမယ့် API (Dashboard ကနေ ခလုတ်နှိပ်ရင် သုံးရန်)
app.patch('/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'confirmed', 'shipped', 'cancelled'
    
    try {
        const updatedOrder = await sql`
            UPDATE orders 
            SET status = ${status} 
            WHERE id = ${id} 
            RETURNING *;
        `;
        
        if (updatedOrder.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        
        res.json(updatedOrder[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Render ရဲ့ Port ဒါမှမဟုတ် Port 3000 မှာ run မယ်
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
