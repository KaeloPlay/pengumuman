import { createClient } from '../lib/supabase.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        const { data: pengumuman, error: err1 } = await supabase
        .from('pengumuman')
        .select('*')
        .eq('id', 1)
        .single();

        const { data: jadwal, error: err2 } = await supabase
        .from('jadwal_besok')
        .select('*')
        .single();

        if (err1 || err2) {
            return res.status(500).json({ error: err1 || err2 });
        }

        const now = new Date();
        const hour = now.toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta',
            hour: '2-digit',
            hour12: false
        });
        
        let tanggal_besok = {};
        if (hour >= 7) {
            now.setDate(now.getDate() + 1);
            
            tanggal_besok = { tanggal_besok: `Besok, ${now.toLocaleDateString('sv-SE', {
            timeZone: 'Asia/Jakarta'
        })}` };
        } else if (hour >= 0 && hour < 7) {
            tanggal_besok = { tanggal_besok: `Hari ini, ${now.toLocaleDateString('sv-SE', {
            timeZone: 'Asia/Jakarta'
        })}` };
    }
    
    const { libur } = pengumuman;
    if (libur) {
        console.log('Returning libur data to user.');
        return res.json({
            ...tanggal_besok,
            mapel: 'Pembelajaran untuk esok hari ditiadakan. (Libur)',
            ulangan: '',
            pr: '',
            piket: '',
            note: '@Gunakan waktu sebaik mungkin!',
            libur,
            uuid: crypto.randomUUID()
        });
    }

    console.log('Sent data to user.');
    return res.json({
        ...pengumuman,
        ...jadwal,
        ...tanggal_besok
        });
    }

    if (req.method === 'POST') {
        const { ulangan, pr, note, libur, key } = req.body;

        if (key !== 'viic') {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        
        if (libur === undefined) {
            const { error: updateError } = await supabase
            .from('pengumuman')
            .update({
                ulangan,
                pr,
                note,
                uuid: crypto.randomUUID()
            })
            .eq('id', 1);
            console.log("New data sent to backend:", { ulangan, pr, note });
            return res.json({ success: !updateError, error: updateError });
        }
        
        if (libur !== undefined) {
            const { error: liburError } = await supabase
            .from('pengumuman')
            .update({ libur })
            .eq('id', 1);
            console.log("Updated libur to:", libur);
            return res.json({ success: !liburError, error: liburError });
        }

    }
    return res.status(405).json({ error: 'Method not allowed' });
}
