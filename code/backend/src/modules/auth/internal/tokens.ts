/**
 * DI tokens.
 *
 * TypeScript interfaces don't exist at runtime, so NestJS can't inject by
 * interface type — the ports are bound to these symbols instead. Keeping the
 * tokens here (rather than in the module) lets the controller import them
 * without pulling in the whole provider graph.
 */
export const AUTH_SERVICE = Symbol('AUTH_SERVICE');
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
export const OTP_CHALLENGE_REPOSITORY = Symbol('OTP_CHALLENGE_REPOSITORY');
export const SMS_SENDER = Symbol('SMS_SENDER');
