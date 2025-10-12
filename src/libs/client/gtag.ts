'use client';

import { sendGAEvent as sE } from '@next/third-parties/google';
import Cookies from 'js-cookie';
import Jwt from '@utils/jwtUtils';

type Event = 'button_click' | 'link_click' | 'page_view';

type GTagEvent = {
  id: string;
  pathname: string;
  event: Event;
  value: string;
};

type SendGAEventType = (event: Event, value: string) => void;

export const sendGAEvent: SendGAEventType = (event, value) => {
  if (window === undefined) return;
  let id = '';
  const accessToken = Cookies.get('access_token');

  if (accessToken) {
    const { id: userId } = Jwt.getPayload(accessToken) || {};
    id = userId;
  } else {
    id = Cookies.get('session_id') || '';
  }

  const object: GTagEvent = {
    id,
    pathname: window.location.pathname,
    event,
    value,
  };

  sE(object);
};
