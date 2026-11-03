// alert.js
const SUPABASE_URL = 'https://fdjihxwnttsncxntzjef.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkamloeHdudHRzbmN4bnR6amVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTk5MzgsImV4cCI6MjEwOTE3NTkzOH0.RKJ3TYX8tZMR0rEalsCsR0eBW4QF-Ryi_HXBEqvI7WQ';

async function checkAllFamilies() {
    console.log("Starting global check for all families...");

    try {
        const famRes = await fetch(`${SUPABASE_URL}/rest/v1/families`, {
            headers: { 
                'apikey': SUPABASE_ANON_KEY, 
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}` 
            }
        });

        const families = await famRes.json();
        console.log(`Found ${families.length} family profiles.`);

        if (!families || families.length === 0) {
            console.log("No families registered yet.");
            return;
        }

        for (const family of families) {
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

            if (needsAlert) {
                // THIS IS THE TEST MODE. No WhatsApp sent, just a log.
                console.log(`🚨 ALERT NEEDED FOR ${family.caregiver_name} (${family.whatsapp_number})`);
                console.log(`Message would be: Your parent missed check-in. Last seen: ${lastSeenText}`);
            } else {
                console.log(`✅ ${family.caregiver_name}'s parent is safe. Last seen: ${lastSeenText}`);
            }
        }
    } catch (error) {
        console.error("CRITICAL ERROR:", error);
        process.exit(1); 
    }
}

checkAllFamilies();
