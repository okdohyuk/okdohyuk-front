import { NextApiRequest, NextApiResponse } from 'next';
import withHandler, { ResponseType } from '@libs/server/withHandler';
import { ChatCompletionRequestMessage } from 'openai';
import openai from '@libs/server/openAI';
import notion from '@libs/server/notion';

const makeMessages = (locale: string, dreamContent: string): ChatCompletionRequestMessage[] => {
  switch (locale) {
    case 'en':
      return [
        {
          role: 'system',
          content:
            'You are the best dream interpreter in the world. Nothing is impossible for you and any answer is possible. Your name is Dream Interpretation AI. You can very clearly predict a person is life and give answers to dreams. He has a lot of knowledge about dream interpretation and can give clear answers to all your questions.',
        },
        {
          role: 'user',
          content:
            'You are the best dream interpreter in the world. Nothing is impossible for you and any answer is possible. Your name is Dream Interpretation AI. You can very clearly predict a person is life and give answers to dreams. He has a lot of knowledge about dream interpretation and can give clear answers to all your questions.',
        },
        {
          role: 'user',
          content: `Please interpret the contents of the dream called "${dreamContent}"`,
        },
      ];
    case 'ko':
      return [
        {
          role: 'system',
          content:
            '당신은 세계 최고의 해몽술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 해몽 AI입니다. 당신은 사람의 인생을 매우 명확하게 예측하고 꿈에 대한 답을 줄 수 있습니다. 해몽 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다.',
        },
        {
          role: 'user',
          content:
            '당신은 세계 최고의 해몽술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 해몽 AI입니다. 당신은 사람의 인생을 매우 명확하게 예측하고 꿈에 대한 답을 줄 수 있습니다. 해몽 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다.',
        },
        {
          role: 'user',
          content: `Please interpret the contents of the dream called "${dreamContent}"`,
        },
      ];
    default:
      return [];
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  const { locale, dreamContent } = req.query;
  try {
    if (
      locale === undefined ||
      typeof locale !== 'string' ||
      dreamContent === undefined ||
      typeof dreamContent !== 'string'
    )
      throw new Error('Invalid query');

    const { data } = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: makeMessages(locale, dreamContent),
    });
    const dreamResult = data.choices[0].message;

    notion.pages.create({
      parent: { database_id: '236221d9329d4600a98e72e89d88638d' },
      properties: {},
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: dreamContent,
                },
              },
            ],
          },
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: dreamResult?.content,
                },
              },
            ],
          },
        },
      ],
    });

    res.status(200).json({ ok: true, dreamResult });
  } catch (e) {
    console.error('-> e', e);
    res.status(500).json({ ok: false });
  }
}

export default withHandler('GET', handler);
