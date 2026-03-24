import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log("KEY TYPE:", process.env.SUPABASE_SERVICE_ROLE?.slice(0, 10));

export default async function handler(req, res) {
    
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
            return res.json({ error: err1 || err2 });
        }

        return res.json({
            pengumuman,
            jadwal
        });
    }

    if (req.method === 'POST') {
        const { pr, note, key } = req.body;

        if (key !== 'viic') {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { error } = await supabase
        .from('pengumuman')
        .update({ pr, note })
        .eq('id', 1);

        return res.json({ success: !error, error });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}