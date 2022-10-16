import { NextApiRequest, NextApiResponse } from 'next';
import withHandler, { ResponseType } from '@libs/server/withHandler';
import client from '@libs/server/client';

async function findBlog(id: string) {
  try {
    const blog = await client.blog.findUnique({
      where: {
        id,
      },
    });
    if (!blog || !blog.isPublic) return null;
    return blog;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  try {
    if (!req.query.id) return res.status(400).json({ ok: false });
    const blog = await findBlog(req.query.id + '');
    if (blog === null) return res.status(404).json({ ok: false });

    res.status(200).json({ ok: true, blog });
  } catch (e) {
    console.error('-> e', e);
    res.status(500).json({ ok: false });
  }
}

export default withHandler('GET', handler);
