// alert.js
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const CALLMEBOT_API_KEY = 'YOUR_CALLMEBOT_API_KEY'; // Get this from CallMeBot

async function checkAllFamilies() {
    console.log("Starting global check for all families...");

    // 1. Get all families from the database
    const famRes = await fetch(`${SUPABASE_URL}/rest/v1/families`, {
        headers: { 
            'apikey': SUPABASE_ANON_KEY, 
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}` 
        }
    });
    const families = await famRes.json();

    if (!families || families.length === 0) {
        console.log("No families registered yet.");
        return;
    }

    // 2. Loop through each family
    for (const family of families) {
        // Get their latest check-in
        const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/check_ins?family_id=eq.${family.id}&select=created_at&order=created_at.desc&limit=1`, {
            headers: { 
                'apikey': SUPABASE_ANON_KEY, 
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}` 
            }
        });
        const checkData = await checkRes.json();

        let needsAlert = false;
        let lastSeenText = "Never";

        if (checkData.length === 0) {
            needsAlert = true; 
        } else {
            const lastCheckIn = new Date(checkData[0].created_at);
            const diffInHours = (new Date() - lastCheckIn) / (1000 * 60 * 60);
            lastSeenText = lastCheckIn.toLocaleString();
            if (diffInHours > 24) {
                needsAlert = true;
            }
        }

        // 3. Send WhatsApp if needed
        if (needsAlert) {
            console.log(`ALERT: ${family.caregiver_name} needs an alert.`);
            
            const message = `🚨 AAMI ACHI ALERT 🚨\n\nHello ${family.caregiver_name},\nYour parent has missed their check-in.\nLast seen: ${lastSeenText}\n\nPlease check on them.`;
            
            // Use the WhatsApp number they provided during setup
            const url = `https://api.callmebot.com/whatsapp.php?phone=${family.whatsapp_number}&text=${encodeURIComponent(message)}&apikey=${CALLMEBOT_API_KEY}`;
            
            await fetch(url);
            console.log(`WhatsApp sent to ${family.whatsapp_number}`);
        } else {
            console.log(`${family.caregiver_name}'s parent is safe.`);
        }
    }
}

checkAllFamilies();