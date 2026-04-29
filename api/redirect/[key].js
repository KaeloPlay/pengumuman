import { createClient as createClientRedirect } from '@supabase/supabase-js'

export const supaRedirect = createClientRedirect(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
    const { key } = req.query;

    const { data, error } = await supaRedirect
    .from('links')
    .select('target')
    .eq('key', key)
    .single();

    if (error || !data) {
        return res.status(404).send('Link is not found')
    }

    res.writeHead(302, { location: data.target });
    res.end();
}