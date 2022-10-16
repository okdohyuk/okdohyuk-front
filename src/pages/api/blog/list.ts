import { NextApiRequest, NextApiResponse } from 'next';
import withHandler, { ResponseType } from '@libs/server/withHandler';
import client from '@libs/server/client';

async function findBlogList(page: number, limit: number) {
  try {
    const blogList = await client.blog.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        isPublic: true,
      },
    });
    return blogList;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  const { page, limit } = req.query;
  try {
    if (!(page && limit)) return res.status(400).json({ ok: false });
    const blogList = await findBlogList(+page, +limit);
    if (blogList === null) return res.status(404).json({ ok: false });

    res.status(200).json({ ok: true, blogs: blogList });
  } catch (e) {
    console.error('-> e', e);
    res.status(500).json({ ok: false });
  }
}

export default withHandler('GET', handler);
