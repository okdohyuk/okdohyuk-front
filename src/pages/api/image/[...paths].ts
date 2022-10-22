import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';

async function findImage(paths: string) {
  try {
    const image = await fetch(`${process.env.WORKER_URL}/image/${paths.replace(/,/g, '/')}`);
    if (image.status !== 200) throw 'not found image';
    return image.body;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await NextCors(req, res, {
      methods: ['GET'],
      origin: '*',
      optionsSuccessStatus: 200,
    });
    if (!req.query.paths) return res.status(400).json({ ok: false });
    const image = await findImage(req.query.paths.toString());
    if (image === null) return res.status(404).json({ statusText: 'not found image' });

    res.status(200).send(image);
  } catch (e) {
    console.error('-> e', e);
    res.status(500).json({ ok: false });
  }
}

export default handler;
