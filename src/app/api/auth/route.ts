import { NextRequest, NextResponse } from 'next/server';
import cookie from 'cookie';

export async function POST(req: NextRequest) {
  try {
    const { refreshToken, accessToken, userData, action } = await req.json();

    if (action === 'set') {
      if (!refreshToken || !accessToken || !userData) {
        return NextResponse.json(
          {
            message: 'Refresh token, access token, and user data are required for setting cookies',
          },
          { status: 400 },
        );
      }

      const refreshTokenCookie = cookie.serialize('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7일
        path: '/',
      });

      const accessTokenCookie = cookie.serialize('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 60 * 15, // 15분
        path: '/',
      });

      const userInfoString = JSON.stringify(userData);
      const userInfoCookie = cookie.serialize('user_info', userInfoString, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7일
        path: '/',
      });

      const response = NextResponse.json(
        { message: 'Authentication cookies set successfully' },
        { status: 200 },
      );
      response.headers.append('Set-Cookie', refreshTokenCookie);
      response.headers.append('Set-Cookie', userInfoCookie);
      response.headers.append('Set-Cookie', accessTokenCookie);
      return response;
    } else if (action === 'clear') {
      const clearRefreshTokenCookie = cookie.serialize('refresh_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        expires: new Date(0), // 쿠키 즉시 만료
        path: '/',
      });

      const clearUserInfoCookie = cookie.serialize('user_info', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        expires: new Date(0), // 쿠키 즉시 만료
        path: '/',
      });

      const clearAccessTokenCookie = cookie.serialize('access_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        expires: new Date(0), // 쿠키 즉시 만료
        path: '/',
      });

      const response = NextResponse.json(
        { message: 'Authentication cookies cleared successfully' },
        { status: 200 },
      );
      response.headers.append('Set-Cookie', clearRefreshTokenCookie);
      response.headers.append('Set-Cookie', clearUserInfoCookie);
      response.headers.append('Set-Cookie', clearAccessTokenCookie);
      return response;
    } else {
      return NextResponse.json({ message: 'Invalid action specified' }, { status: 400 });
    }
  } catch (error) {
    console.error('[API /api/auth POST] Internal server error:', error); // POST 에러 로깅 추가
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ user: null, message: 'No cookies found' }, { status: 200 }); // 사용자 정보가 없을 수 있으므로 200으로 변경하고 user: null 추가
    }

    const parsedCookies = cookie.parse(cookieHeader);
    const userInfoCookie = parsedCookies.user_info;

    if (!userInfoCookie) {
      return NextResponse.json(
        { user: null, message: 'User info cookie not found' },
        { status: 200 },
      ); // 사용자 정보가 없을 수 있으므로 200으로 변경하고 user: null 추가
    }

    try {
      const userData = JSON.parse(userInfoCookie);
      return NextResponse.json({ user: userData }, { status: 200 });
    } catch (error) {
      // 쿠키 파싱 실패 시, 유효하지 않은 쿠키로 간주하고 삭제 시도
      const clearUserInfoCookie = cookie.serialize('user_info', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        expires: new Date(0), // 쿠키 즉시 만료
        path: '/',
      });
      const response = NextResponse.json(
        { user: null, message: 'Invalid user info cookie, cleared' }, // user: null 추가
        { status: 200 }, // 클라이언트에서 에러로 처리하지 않도록 200으로 변경
      );
      response.headers.append('Set-Cookie', clearUserInfoCookie);
      // access_token과 refresh_token도 함께 클리어하는 것이 좋을 수 있습니다.
      const clearAccessTokenCookie = cookie.serialize('access_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        expires: new Date(0),
        path: '/',
      });
      response.headers.append('Set-Cookie', clearAccessTokenCookie);
      const clearRefreshTokenCookie = cookie.serialize('refresh_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        expires: new Date(0),
        path: '/',
      });
      response.headers.append('Set-Cookie', clearRefreshTokenCookie);
      return response;
    }
  } catch (error) {
    console.error('[API /api/auth GET] Internal server error:', error);
    return NextResponse.json({ user: null, message: 'Internal server error' }, { status: 500 }); // user: null 추가
  }
}
