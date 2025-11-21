document.addEventListener('DOMContentLoaded', async () => {
    
    // Helper: Apply settings to the HTML elements
    const applySettingsToDOM = (data) => {
        if (!data) return;

        // Update WhatsApp Links
        if (data.whatsappLink) {
            document.querySelectorAll('.dynamic-wa-link').forEach(link => {
                link.href = data.whatsappLink;
            });
        }

        // Update Payment Details (if they exist on the page)
        if (document.getElementById('account-number')) document.getElementById('account-number').textContent = data.accountNumber || '...';
        if (document.getElementById('bank-name')) document.getElementById('bank-name').textContent = data.bankName || '...';
        if (document.getElementById('account-name')) document.getElementById('account-name').textContent = data.accountName || '...';
        
        // Update Admin Form (if it exists)
        if (document.getElementById('accountName')) document.getElementById('accountName').value = data.accountName || '';
        if (document.getElementById('accountNumber')) document.getElementById('accountNumber').value = data.accountNumber || '';
        if (document.getElementById('bankName')) document.getElementById('bankName').value = data.bankName || '';
        if (document.getElementById('whatsappLink')) document.getElementById('whatsappLink').value = data.whatsappLink || '';
    };

    // Helper: Fetch settings from Firestore
    const loadSettings = async () => {
        try {
            const doc = await db.collection('settings').doc('payment').get();
            if (doc.exists) {
                applySettingsToDOM(doc.data());
                return doc.data();
            }
        } catch (error) {
            console.error("Error loading settings:", error);
            if (window.location.pathname.includes('admin.html')) {
                document.getElementById('status-message').innerHTML = `<span class="text-danger">Database Error: ${error.message}</span>`;
            }
        }
    };

    // --- LOGIC BRANCHING ---

    if (window.location.pathname.includes('admin.html')) {
        // === ADMIN PAGE LOGIC ===
        
        // 1. Security Prompt
        const password = prompt("Enter admin password:");
        if (password !== "animoemerald") {
            document.body.innerHTML = '<div class="d-flex justify-content-center align-items-center vh-100"><h1 class="text-danger">Access Denied</h1></div>';
            return;
        }

        // 2. Show Admin Panel
        const adminPanel = document.querySelector('.admin-panel');
        if (adminPanel) adminPanel.style.display = 'block';

        // 3. Authenticate Anonymously (Required for Write Permissions)
        try {
            await auth.signInAnonymously();
            console.log("Admin authenticated successfully.");
            
            // 4. Load Data (Now that we are authenticated)
            await loadSettings();

            // 5. Setup Save Button
            const settingsForm = document.getElementById('settings-form');
            if (settingsForm) {
                settingsForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const statusMsg = document.getElementById('status-message');
                    const btn = settingsForm.querySelector('button');
                    
                    btn.disabled = true;
                    btn.textContent = "Saving...";
                    statusMsg.textContent = "";

                    const newData = {
                        accountName: document.getElementById('accountName').value,
                        accountNumber: document.getElementById('accountNumber').value,
                        bankName: document.getElementById('bankName').value,
                        whatsappLink: document.getElementById('whatsappLink').value
                    };

                    try {
                        await db.collection('settings').doc('payment').set(newData);
                        statusMsg.innerHTML = '<span class="text-success fw-bold">Settings saved successfully!</span>';
                    } catch (error) {
                        console.error("Save error:", error);
                        statusMsg.innerHTML = `<span class="text-danger">Error saving: ${error.message}</span>`;
                    } finally {
                        btn.disabled = false;
                        btn.textContent = "Save Changes";
                    }
                });
            }

        } catch (error) {
            console.error("Auth Failed:", error);
            alert("Error: Could not connect to database. Check console.");
            const statusMsg = document.getElementById('status-message');
            if(statusMsg) statusMsg.innerHTML = `<span class="text-danger fw-bold">Auth Failed: Enable 'Anonymous' Sign-in in Firebase Console.</span>`;
        }

    } else {
        // === PUBLIC PAGE LOGIC ===
        // Just load the settings. If this fails, it's because Firestore Rules block public reads.
        loadSettings();
    }
});