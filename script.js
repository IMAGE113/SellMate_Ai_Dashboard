// ၁။ အော်ဒါ Status ကို Database မှာ တကယ်သွားပြင်မယ့် Function
async function updateStatus(selectElement, orderId) {
    const newStatus = selectElement.value;
    
    // UI အရောင်ပြောင်းတာ အရင်လုပ်မယ်
    const statusColors = {
        'pending': '#fbbf24',   // Yellow
        'confirmed': '#10b981', // Green
        'shipped': '#3b82f6',   // Blue
        'delivered': '#6366f1',  // Indigo
        'cancelled': '#ef4444'   // Red
    };
    selectElement.style.color = statusColors[newStatus] || '#000';

    try {
        // Backend API ဆီသို့ Status update လှမ်းပို့ခြင်း
        const response = await fetch(`https://sellmate-ai-dashboard-backend.onrender.com/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            console.log("Status updated successfully in database!");
        } else {
            alert("Database update failed. Please try again.");
        }
    } catch (error) {
        console.error("Error updating status:", error);
        alert("Server နဲ့ ချိတ်ဆက်လို့မရပါဘူး။");
    }
}

// ၂။ Confirm Button နှိပ်ရင် Status ကို 'confirmed' လို့ တန်းပြောင်းပေးမယ်
async function confirmAction(orderId, selectElementId) {
    const isConfirmed = confirm("ဒီအော်ဒါကို အတည်ပြုမှာ သေချာပါသလား?");
    
    if (isConfirmed) {
        const selectElement = document.getElementById(selectElementId);
        selectElement.value = 'confirmed'; // Select box ကို confirmed ပြောင်းမယ်
        
        // Database ကို updateStatus function သုံးပြီး လှမ်းပို့မယ်
        await updateStatus(selectElement, orderId);
        
        alert("Success: အော်ဒါကို အတည်ပြုပြီးပါပြီ။");
    }
}
