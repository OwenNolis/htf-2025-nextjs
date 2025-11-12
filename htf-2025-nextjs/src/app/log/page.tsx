"use client";

import NewSightingForm from '../../components/NewSightingForm'; // Pas het pad aan indien nodig

// Dit is een Server Component (standaard in de app-router)
export default function LogSightingPage() {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Nieuwe Waarneming Loggen</h1>

            {/* De NewSightingForm wordt hier gerenderd. 
        Het is een Client Component (vanwege de useState/useEffect hooks), 
        maar wordt op de Server geladen en gehydrateerd in de browser.
      */}
            <NewSightingForm />
        </div>
    );
}