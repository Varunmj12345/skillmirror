import { NextApiRequest, NextApiResponse } from 'next';

const API_URL = process.env.BACKEND_API_URL || 'https://skillmirror-api.onrender.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        Object.entries(req.headers).forEach(([k, v]) => {
            if (v && typeof v === 'string') headers[k] = v;
        });
        const response = await fetch(`${API_URL}${req.url}`, {
            method,
            headers,
            body: method !== 'GET' ? JSON.stringify(req.body) : undefined,
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}