import React from 'react';
import { useTranslation } from 'next-i18next';
import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { observer } from 'mobx-react';
import Opengraph from '@components/Basic/Opengraph';
import MobileScreenWarpper from '@components/Complex/Layouts/MobileScreenWarpper';
import ClassName from '@utils/classNameUtils';

type CoderType = 'BASE64' | 'URL';

const coderList: CoderType[] = ['BASE64', 'URL'];

function CoderPage() {
  const { t } = useTranslation('coder');
  const { cls } = ClassName;
  const [coder, setCoder] = React.useState<CoderType>('BASE64');
  //   const { blogs, getBlogsPage, status, isLastPage } = useStore<BlogStore>('blogStore');

  return (
    <>
      <Opengraph
        title={t('openGraph.title')}
        ogTitle={t('openGraph.ogTitle')}
        description={t('openGraph.description')}
      />
      <MobileScreenWarpper className="dark:text-white">
        <h1 className="t-t-1 t-basic-1">{t('title')}</h1>
        <section className="flex flex-col mb-4 space-y-4">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {coderList.map((i) => (
              <div
                key={i}
                className={cls('t-t-3 cursor-pointer', coder === i ? 't-basic-1' : 't-basic-4')}
                onClick={() => setCoder(i)}
              >
                {i}
              </div>
            ))}
          </div>
          <div>
            횟수
            <input type="text" className="input-text" />
          </div>
        </section>
        <section className="flex flex-col space-y-4">
          <input type="text" className="input-text" />
          <button className="button">완성</button>
          <div>사이보기 + 복사</div>
          <input type="text" className="input-text h-32 " />
          <button>복사</button>
        </section>
      </MobileScreenWarpper>
    </>
  );
}

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale as string, ['common', 'coder'])),
  },
});

export default observer(CoderPage);
