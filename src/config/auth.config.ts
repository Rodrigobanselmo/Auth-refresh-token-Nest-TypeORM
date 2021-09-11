export default {
  jwt: {
    secret_token: process.env.TOKEN_SECRET || 'token_secret',
    expires_in_token: 5,
    secret_refresh_token:
      process.env.REFRESH_TOKEN_SECRET || 'secret_refresh_token',
    expires_in_refresh_token: 10,
    expires_refresh_token_days: 30,
  },
};
