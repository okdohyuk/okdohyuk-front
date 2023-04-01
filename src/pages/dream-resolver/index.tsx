import { GetStaticPropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect } from 'react';
import Opengraph from '@components/Basic/Opengraph';
import Cookies from 'js-cookie';
import { AiOutlineLoading } from 'react-icons/ai';
import { MdLink } from 'react-icons/md';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from '@components/Basic/Link';
import {
  FacebookShareButton,
  FacebookIcon,
  FacebookMessengerShareButton,
  FacebookMessengerIcon,
  TwitterShareButton,
  TwitterIcon,
  LineShareButton,
  LineIcon,
} from 'react-share';

function DreamResolver() {
  const { locale } = useRouter();
  const { t } = useTranslation('dream-resolver');
  const [dreamContent, setDreamContent] = React.useState<string>('');
  const [dreamResult, setDreamResult] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [isTodayResolved, setIsTodayResolved] = React.useState<boolean>(false);
  const currentUrl = 'https://okdohyuk.dev/dream-resolver';

  const handle = () => {
    if (navigator.share) {
      navigator.share({
        title: t('openGraph.title'),
        text: t('openGraph.description'),
        url: currentUrl,
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      alert(t('copyed'));
    } else {
      alert(t('failShare'));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { dreamResult },
      } = await axios.get(
        `/api/openai/dream-resolver?locale=${locale}&dreamContent=${dreamContent}`,
      );

      setDreamResult(dreamResult.content);
      setIsTodayResolved(true);

      const date = new Date();
      const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

      Cookies.set(
        'dream-resolver',
        JSON.stringify({ dreamContent, dreamResult: dreamResult.content }),
        {
          expires: midnight,
        },
      );
    } catch (error) {
      console.error(error);
      alert(t('error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { dreamContent, dreamResult } = JSON.parse(Cookies.get('dream-resolver') || '{}');
    if (dreamContent && dreamContent.length > 0 && dreamResult && dreamResult.length > 0) {
      setDreamContent(dreamContent);
      setDreamResult(dreamResult);
      setIsTodayResolved(true);
    }
    setLoading(false);
  }, []);

  return (
    <>
      <Opengraph
        title={t('openGraph.title')}
        ogTitle={t('openGraph.ogTitle')}
        description={t('openGraph.description')}
        image={'/dream-resolver.jpg'}
      />
      <main className="flex flex-col items-center w-full h-screen lg:h-auto lg:mx-auto lg:w-96 bg-zinc-100 dark:bg-zinc-800 lg:my-auto lg:rounded-lg p-4">
        <h1 className="text-xl lg:text-2xl font-bold mb-6 text-black dark:text-white">
          {t('openGraph.title')}
        </h1>
        {loading && (
          <>
            <div className="flex items-center bg-zinc-400 p-2 rounded">
              <AiOutlineLoading className="animate-spin h-5 w-5 mr-3" />
              {t('processing')}
            </div>
          </>
        )}
        {dreamContent.length > 0 && dreamResult.length > 0 && isTodayResolved && (
          <>
            <div className="flex flex-col p-2 rounded-sm border-lime-400 border-2 border-solid">
              <h2 className="text-lg lg:text-xl font-bold mb-2 text-black dark:text-white">
                {t('question')}
              </h2>
              <span className="whitespace-pre-line text-base text-black dark:text-white">
                {dreamContent}
              </span>
              <h2 className="text-lg lg:text-xl font-bold mb-2 text-black dark:text-white">
                {t('answer')}
              </h2>
              <span className="whitespace-pre-line text-base text-black dark:text-white">
                {dreamResult}
              </span>
            </div>
            <span className="my-4 text-black dark:text-white">{t('tryAgain')}</span>
            <Link href={'https://toss.me/guksu'} hasTargetBlank>
              <span className="text-black dark:text-white">{t('donate')}</span>
            </Link>
          </>
        )}
        {!loading && !isTodayResolved && (
          <form onSubmit={handleSubmit}>
            <textarea
              placeholder={t('placeholder')}
              value={dreamContent}
              onChange={(e) => setDreamContent(e.target.value)}
              className="mb-4 rounded-lg text-base lg:text-lg border-lime-500 border-2 w-full h-96 p-2 resize-none outline-none focus:ring-4 ring-offset-2 ring-lime-500 ring-opacity-50"
            />
            <button
              disabled={dreamContent.trim().length <= 0}
              type="submit"
              className="w-full disabled:opacity-50 bg-lime-600 p-4 rounded-full font-medium text-base lg:text-lg text-white"
            >
              {t('submit')}
            </button>
          </form>
        )}
        <div className="flex w-full justify-around mt-6">
          <FacebookShareButton url={currentUrl}>
            <FacebookIcon size={48} round={true} borderRadius={24}></FacebookIcon>
          </FacebookShareButton>
          <FacebookMessengerShareButton url={currentUrl} appId="622375919312906">
            <FacebookMessengerIcon size={48} round={true} borderRadius={24}></FacebookMessengerIcon>
          </FacebookMessengerShareButton>
          <TwitterShareButton url={currentUrl}>
            <TwitterIcon size={48} round={true} borderRadius={24}></TwitterIcon>
          </TwitterShareButton>
          <LineShareButton url={currentUrl}>
            <LineIcon size={48} round={true} borderRadius={24}></LineIcon>
          </LineShareButton>
          <button
            onClick={handle}
            className="flex items-center justify-center w-[48px] h-[48px] rounded-full bg-zinc-500"
          >
            <MdLink size={32} className="text-white" />
          </button>
        </div>
      </main>
    </>
  );
}

export default DreamResolver;

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale as string, ['common', 'dream-resolver'])),
  },
});
