// Status ပြောင်းလဲမှုကို စစ်ဆေးခြင်း
function updateStatus(selectElement) {
    const status = selectElement.value;
    alert("Order Status changed to: " + status.toUpperCase());
    
    // နောက်ပိုင်း ဒီနေရာမှာ Database ကို Data ပို့မယ့် Code တွေ ထည့်ပါမယ်
    if(status === 'confirmed') {
        selectElement.style.color = "#10b981"; // Green
    } else if (status === 'delivered') {
        selectElement.style.color = "#3b82f6"; // Blue
    } else {
        selectElement.style.color = "#fbbf24"; // Yellow
    }
}

// Confirm Button နှိပ်လိုက်တဲ့အခါ
function confirmAction() {
    const isConfirmed = confirm("ဒီအော်ဒါကို အတည်ပြုပြီး Customer ဆီ Notification ပို့မလား?");
    if(isConfirmed) {
        alert("Success: Customer ဆီသို့ အကြောင်းကြားစာ ပို့ပြီးပါပြီ။");
    }
}
