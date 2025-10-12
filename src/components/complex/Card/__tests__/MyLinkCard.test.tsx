import React from 'react';
import { render } from '@testing-library/react';
import MyLinkCard from '@components/complex/Card/MyLinkCard';

describe('<MyLinkCard />', () => {
  it('matches snapshot', () => {
    const utils = render(<MyLinkCard title="제목" explanation="테스트 설명입니다." link="/" />);
    expect(utils.container).toMatchSnapshot();
  });
});
