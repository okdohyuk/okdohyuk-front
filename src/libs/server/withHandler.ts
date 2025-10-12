import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import logger from '@utils/logger';

export interface ResponseType {
  ok: boolean;
  [key: string]: any;
}

export default function withHandler(
  method: 'GET' | 'POST' | 'DELETE',
  fn: (req: NextApiRequest, res: NextApiResponse) => void,
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<any> => {
    if (req.method !== method) {
      return res.status(405).end();
    }
    try {
      await NextCors(req, res, {
        // Options
        methods: method,
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
      });
      return fn(req, res);
    } catch (error) {
      logger.error(error);
      return res.status(500).json({ error });
    }
  };
}
