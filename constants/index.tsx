export const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080'
    : 'http://ec2-3-39-151-81.ap-northeast-2.compute.amazonaws.com';

export const OAUTH2_REDIRECT_URI =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080/login/oauth2/code/google'
    : 'http://ec2-3-39-151-81.ap-northeast-2.compute.amazonaws.com/login/oauth2/code/google';

export const LOGIN_URL = API_BASE_URL + '/login';
export const LOGOUT_URL = API_BASE_URL + '/logout';
export const GOOGLE_AUTH_URL = API_BASE_URL + '/oauth2/authorize/google?redirect_uri=' + OAUTH2_REDIRECT_URI;
