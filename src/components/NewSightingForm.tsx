"use client";

import React, { useState, useEffect } from 'react';

// Interfaces voor duidelijke datastructuur
interface Fish {
    id: string; // Unieke ID van de vissoort
    name: string; // Naam van de vis
}

interface SightingData {
    fishId: string;
    latitude: number | ''; // Numerieke velden voor coördinaten, met '' voor lege invoer
    longitude: number | '';
    sightingDate: string; // ISO 8601 formaat voor datum
}

/**
 * Next.js component voor het opnemen van een nieuwe viswaarneming.
 */
const NewSightingForm: React.FC = () => {
    const [fishes, setFishes] = useState<Fish[]>([]);
    const [formData, setFormData] = useState<SightingData>({
        fishId: '',
        latitude: '',
        longitude: '',
        sightingDate: new Date().toISOString().substring(0, 10), // Vandaag als standaard
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');

    // --- Geolocation Functie ---
    const getLocation = () => {
        if (navigator.geolocation) {
            setGeoStatus('loading');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }));
                    setGeoStatus('success');
                    setTimeout(() => setGeoStatus('idle'), 2000);
                },
                (error) => {
                    console.error("Geolocation Error:", error);
                    setGeoStatus('error');
                    setTimeout(() => setGeoStatus('idle'), 3000);
                }
            );
        } else {
            setGeoStatus('error');
            setTimeout(() => setGeoStatus('idle'), 3000);
        }
    };


    // 1. Haal de lijst van vissoorten op bij het laden van de component
    useEffect(() => {
        const fetchFishes = async () => {
            try {
                const response = await fetch('http://localhost:5555/api/fish');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: Fish[] = await response.json();
                setFishes(data);
                if (data.length > 0) {
                    // Stel de eerste vis in als standaard geselecteerde vis
                    setFormData(prev => ({ ...prev, fishId: data[0].id }));
                }
            } catch (e) {
                if (e instanceof Error) {
                    setError(`Error fetching fish list: ${e.message}. Make sure the API is running on port 5555.`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFishes();
    }, []);

    // Handler voor het wijzigen van invoervelden
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        let processedValue: string | number = value;

        // Converteer breedtegraad/lengtegraad naar nummers, sta lege string toe
        if (name === 'latitude' || name === 'longitude') {
            processedValue = value === '' ? '' : parseFloat(value);
            if (typeof processedValue === 'number' && isNaN(processedValue)) {
                return; // Negeer ongeldige numerieke invoer
            }
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    // 3. Verzend de nieuwe waarneming
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus('submitting');

        // Controleer of de coördinaten nummers zijn voordat je ze verzendt
        const payload = {
            ...formData,
            latitude: formData.latitude !== '' ? formData.latitude : null,
            longitude: formData.longitude !== '' ? formData.longitude : null,
        };

        // Submit to our internal user sightings API
        try {
            const response = await fetch('/api/user-sightings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fishId: formData.fishId }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Please log in to save a sighting');
                } else if (response.status === 409) {
                    throw new Error('This fish has already been spotted');
                } else {
                    throw new Error('Error saving the sighting');
                }
            }

            setSubmitStatus('success');
            // Reset the form after success
            setFormData({
                fishId: formData.fishId,
                latitude: '',
                longitude: '',
                sightingDate: new Date().toISOString().substring(0, 10),
            });

        } catch (e) {
            console.error(e);
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unexpected error occurred');
            }
            setSubmitStatus('error');
        } finally {
            // Reset status after 2 seconds
            setTimeout(() => setSubmitStatus('idle'), 2000);
        }
    };

    // Render logica
    if (loading) {
        return <p>Loading fish species...</p>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    // Determine the status of the GeoLocation button
    const geoButtonText =
        geoStatus === 'loading' ? 'Getting Location...' :
            geoStatus === 'success' ? 'Saved!' :
                geoStatus === 'error' ? 'Location Error' :
                    'Use Current Location';

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Register New Sighting 📍</h2>
            <form onSubmit={handleSubmit}>

                {/* Fish Species Selection */}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="fishId" style={{ display: 'block', marginBottom: '5px' }}>Fish Species:</label>
                    <select
                        id="fishId"
                        name="fishId"
                        value={formData.fishId}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        {fishes.map((fish) => (
                            <option key={fish.id} value={fish.id}>
                                {fish.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Location Fields (Latitude & Longitude) */}
                <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Location Coordinates:</label>

                    {/* GeoLocation Button */}
                    <button
                        type="button"
                        onClick={getLocation}
                        disabled={geoStatus === 'loading'}
                        style={{
                            padding: '8px',
                            backgroundColor: geoStatus === 'loading' ? '#707070' : geoStatus === 'success' ? '#10b981' : '#1e3a8a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: geoStatus === 'loading' ? 'not-allowed' : 'pointer',
                            marginBottom: '10px',
                        }}
                    >
                        {geoButtonText}
                    </button>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        {/* Latitude */}
                        <div style={{ flex: 1 }}>
                            <label htmlFor="latitude" style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Latitude:</label>
                            <input
                                type="number"
                                id="latitude"
                                name="latitude"
                                step="0.000001"
                                value={formData.latitude}
                                onChange={handleChange}
                                placeholder="e.g. 52.3702"
                                required
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        {/* Longitude */}
                        <div style={{ flex: 1 }}>
                            <label htmlFor="longitude" style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Longitude:</label>
                            <input
                                type="number"
                                id="longitude"
                                name="longitude"
                                step="0.000001"
                                value={formData.longitude}
                                onChange={handleChange}
                                placeholder="e.g. 4.8952"
                                required
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Date Field */}
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="sightingDate" style={{ display: 'block', marginBottom: '5px' }}>Sighting Date:</label>
                    <input
                        type="date"
                        id="sightingDate"
                        name="sightingDate"
                        value={formData.sightingDate}
                        onChange={handleChange}
                        required
                        max={new Date().toISOString().substring(0, 10)} // Cannot be in the future
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={submitStatus !== 'idle'}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: submitStatus === 'submitting' ? '#ccc' : submitStatus === 'success' ? '#10b981' : '#0070f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: submitStatus === 'idle' ? 'pointer' : 'not-allowed',
                    }}
                >
                    {submitStatus === 'submitting' ? 'Saving...' : submitStatus === 'success' ? 'Saved! 🎉' : 'Save Sighting'}
                </button>

                {/* Statusberichten */}
                {submitStatus === 'error' && <p style={{ color: 'red', marginTop: '10px' }}>Fout bij het opslaan. Probeer opnieuw.</p>}
            </form>
        </div>
    );
};

export default NewSightingForm;