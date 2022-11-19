export const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080'
    : 'http://http://ec2-3-39-151-81.ap-northeast-2.compute.amazonaws.com';
export const LOGIN_URL = API_BASE_URL + '/login';
export const LOGOUT_URL = API_BASE_URL + '/logout';
export const GOOGLE_AUTH_URL = API_BASE_URL + '/oauth2/authorize/google';
