import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  type AuthenticationResultType,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  CognitoIdentityClient,
  GetIdCommand,
  GetCredentialsForIdentityCommand,
} from '@aws-sdk/client-cognito-identity';
import { BigInteger } from 'jsbn';
import CryptoJS from 'crypto-js';
import { getConfig } from './config';

// RFC 3072 SRP-6a prime
const INIT_N = [
  'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1',
  '29024E088A67CC74020BBEA63B139B22514A08798E3404DD',
  'EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245',
  'E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED',
  'EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3D',
  'C2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F',
  '83655D23DCA3AD961C62F356208552BB9ED529077096966D',
  '670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B',
  'E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9',
  'DE2BCBF6955817183995497CEA956AE515D2261898FA0510',
  '15728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64',
  'ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7',
  'ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6B',
  'F12FFA06D98A0864D87602733EC86A64521F2B18177B200C',
  'BBE117577A615D6C770988C0BAD946E208E24FA074E5AB31',
  '43DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF',
].join('');

const INFOBITS = 'Caldera Derived Key';

const weekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getNowString(): string {
  const now = new Date();
  const weekDay = weekNames[now.getUTCDay()];
  const month = monthNames[now.getUTCMonth()];
  const day = now.getUTCDate();
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  const year = now.getUTCFullYear();
  return `${weekDay} ${month} ${day} ${hours}:${minutes}:${seconds} UTC ${year}`;
}

function hexToWordArray(hex: string): CryptoJS.lib.WordArray {
  return CryptoJS.enc.Hex.parse(hex);
}

function bufferToWordArray(buf: Uint8Array): CryptoJS.lib.WordArray {
  const words: number[] = [];
  for (let i = 0; i < buf.length; i += 4) {
    words.push(
      ((buf[i] || 0) << 24) |
      ((buf[i + 1] || 0) << 16) |
      ((buf[i + 2] || 0) << 8) |
      (buf[i + 3] || 0)
    );
  }
  return CryptoJS.lib.WordArray.create(words, buf.length);
}

function wordArrayToBuffer(wa: CryptoJS.lib.WordArray): Uint8Array {
  const hex = CryptoJS.enc.Hex.stringify(wa);
  const buf = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    buf[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return buf;
}

function padHex(bigInt: BigInteger): string {
  let sHash = bigInt.toString(16);
  if (sHash.length % 2 === 1) {
    sHash = `0${sHash}`;
  } else if ('89ABCDEFabcdef'.indexOf(sHash[0]) >= 0) {
    sHash = `00${sHash}`;
  }
  return sHash;
}

function hash(data: string | CryptoJS.lib.WordArray): string {
  const hashHex = CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  return hashHex.padStart(64, '0');
}

function hexHash(hexStr: string): string {
  return hash(hexToWordArray(hexStr));
}

class AuthenticationHelper {
  private N: BigInteger;
  private g: BigInteger;
  private k: BigInteger;
  private a: BigInteger;
  private A: BigInteger | null = null;
  private userPoolName: string;

  constructor(userPoolId: string) {
    this.userPoolName = userPoolId.split('_')[1];
    this.N = new BigInteger(INIT_N, 16);
    this.g = new BigInteger('2', 16);
    this.k = new BigInteger(
      hexHash(`00${this.N.toString(16)}0${this.g.toString(16)}`),
      16
    );
    this.a = this.randomizeSmallA();
  }

  private randomizeSmallA(): BigInteger {
    const random = CryptoJS.lib.WordArray.random(128);
    const hex = CryptoJS.enc.Hex.stringify(random);
    const a = new BigInteger(hex, 16);
    return a.mod(this.N);
  }

  calculateA(): BigInteger {
    if (this.A) return this.A;
    this.A = this.g.modPow(this.a, this.N);
    if (this.A.mod(this.N).equals(BigInteger.ZERO)) {
      throw new Error('A mod N cannot be 0');
    }
    return this.A;
  }

  computePasswordAuthenticationKey(
    username: string,
    password: string,
    serverB: BigInteger,
    salt: BigInteger
  ): Uint8Array {
    if (serverB.mod(this.N).equals(BigInteger.ZERO)) {
      throw new Error('B mod N cannot be 0');
    }

    const A = this.calculateA();
    const U = new BigInteger(
      hexHash(padHex(A) + padHex(serverB)),
      16
    );

    if (U.equals(BigInteger.ZERO)) {
      throw new Error('U cannot be 0');
    }

    const usernamePasswordHash = hash(`${this.userPoolName}${username}:${password}`);
    const X = new BigInteger(
      hexHash(padHex(salt) + usernamePasswordHash),
      16
    );

    // S = (B - k*g^X)^(a + U*X) mod N
    const gModPowXN = this.g.modPow(X, this.N);
    const interim = serverB.subtract(this.k.multiply(gModPowXN));
    const S = interim.modPow(this.a.add(U.multiply(X)), this.N).mod(this.N);

    return this.calculateHKDF(
      hexToBytes(padHex(S)),
      hexToBytes(padHex(U))
    );
  }

  private calculateHKDF(ikm: Uint8Array, salt: Uint8Array): Uint8Array {
    const encoder = new TextEncoder();
    const infoBits = new Uint8Array([...encoder.encode(INFOBITS), 1]);

    const ikmWA = bufferToWordArray(ikm);
    const saltWA = bufferToWordArray(salt);
    const infoBitsWA = bufferToWordArray(infoBits);

    const prk = CryptoJS.HmacSHA256(ikmWA, saltWA);
    const hmac = CryptoJS.HmacSHA256(infoBitsWA, prk);

    return wordArrayToBuffer(hmac).slice(0, 16);
  }

  passwordClaimSignature(
    hkdf: Uint8Array,
    username: string,
    secretBlock: string,
    dateNow: string
  ): string {
    const encoder = new TextEncoder();
    const poolNameBytes = encoder.encode(this.userPoolName);
    const usernameBytes = encoder.encode(username);
    const secretBlockBytes = Uint8Array.from(atob(secretBlock), c => c.charCodeAt(0));
    const dateBytes = encoder.encode(dateNow);

    const combined = new Uint8Array([
      ...poolNameBytes,
      ...usernameBytes,
      ...secretBlockBytes,
      ...dateBytes,
    ]);

    const message = bufferToWordArray(combined);
    const key = bufferToWordArray(hkdf);
    const signature = CryptoJS.HmacSHA256(message, key);

    return CryptoJS.enc.Base64.stringify(signature);
  }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function decodeJwtPayload(token: string): Record<string, any> {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: Date;
}

export interface ChallengeResponse {
  challengeName: 'NEW_PASSWORD_REQUIRED';
  session: string;
  username: string;
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let onTokenRefreshed: (() => void) | null = null;

function getIdpClient(): CognitoIdentityProviderClient {
  const config = getConfig();
  return new CognitoIdentityProviderClient({ region: config.Region });
}

export function setOnTokenRefreshed(cb: () => void) {
  onTokenRefreshed = cb;
}

export async function signIn(
  username: string,
  password: string
): Promise<AuthTokens | ChallengeResponse> {
  const config = getConfig();
  const client = getIdpClient();
  const helper = new AuthenticationHelper(config.Cognito.UserPoolId);

  // Step 1: Initiate SRP auth
  const srpA = helper.calculateA();
  const initResponse = await client.send(
    new InitiateAuthCommand({
      AuthFlow: 'USER_SRP_AUTH',
      ClientId: config.Cognito.ClientId,
      AuthParameters: {
        USERNAME: username,
        SRP_A: srpA.toString(16),
      },
    })
  );

  // Step 2: Handle PASSWORD_VERIFIER challenge
  if (initResponse.ChallengeName === 'PASSWORD_VERIFIER') {
    const params = initResponse.ChallengeParameters!;
    const srpUserId = params.USER_ID_FOR_SRP;
    const serverB = new BigInteger(params.SRP_B, 16);
    const salt = new BigInteger(params.SALT, 16);
    const dateNow = getNowString();

    const hkdf = helper.computePasswordAuthenticationKey(
      srpUserId,
      password,
      serverB,
      salt
    );

    const signature = helper.passwordClaimSignature(
      hkdf,
      srpUserId,
      params.SECRET_BLOCK,
      dateNow
    );

    const challengeResponse = await client.send(
      new RespondToAuthChallengeCommand({
        ChallengeName: 'PASSWORD_VERIFIER',
        ClientId: config.Cognito.ClientId,
        ChallengeResponses: {
          USERNAME: srpUserId,
          PASSWORD_CLAIM_SECRET_BLOCK: params.SECRET_BLOCK,
          PASSWORD_CLAIM_SIGNATURE: signature,
          TIMESTAMP: dateNow,
        },
        Session: initResponse.Session,
      })
    );

    if (challengeResponse.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      return {
        challengeName: 'NEW_PASSWORD_REQUIRED',
        session: challengeResponse.Session!,
        username: srpUserId,
      };
    }

    return extractTokens(challengeResponse.AuthenticationResult!, username);
  }

  // Direct success (unlikely but handle)
  if (initResponse.AuthenticationResult) {
    return extractTokens(initResponse.AuthenticationResult, username);
  }

  // NEW_PASSWORD_REQUIRED from initial auth
  if (initResponse.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
    return {
      challengeName: 'NEW_PASSWORD_REQUIRED',
      session: initResponse.Session!,
      username,
    };
  }

  throw new Error(`Unexpected challenge: ${initResponse.ChallengeName}`);
}

export async function completeNewPassword(
  username: string,
  newPassword: string,
  session: string
): Promise<AuthTokens> {
  const config = getConfig();
  const client = getIdpClient();

  const response = await client.send(
    new RespondToAuthChallengeCommand({
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ClientId: config.Cognito.ClientId,
      ChallengeResponses: {
        USERNAME: username,
        NEW_PASSWORD: newPassword,
      },
      Session: session,
    })
  );

  return extractTokens(response.AuthenticationResult!, username);
}

export async function forgotPassword(username: string): Promise<void> {
  const config = getConfig();
  const client = getIdpClient();

  await client.send(
    new ForgotPasswordCommand({
      ClientId: config.Cognito.ClientId,
      Username: username,
    })
  );
}

export async function confirmForgotPassword(
  username: string,
  code: string,
  newPassword: string
): Promise<void> {
  const config = getConfig();
  const client = getIdpClient();

  await client.send(
    new ConfirmForgotPasswordCommand({
      ClientId: config.Cognito.ClientId,
      Username: username,
      ConfirmationCode: code,
      Password: newPassword,
    })
  );
}

export async function refreshSession(refreshToken: string): Promise<AuthTokens> {
  const config = getConfig();
  const client = getIdpClient();

  const response = await client.send(
    new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: config.Cognito.ClientId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    })
  );

  const result = response.AuthenticationResult!;
  const username = localStorage.getItem('cognito.username') || '';

  return {
    accessToken: result.AccessToken!,
    idToken: result.IdToken!,
    refreshToken: refreshToken, // refresh token is not returned on refresh
    expiresIn: result.ExpiresIn || 3600,
  };
}

export async function getCredentials(idToken: string): Promise<AwsCredentials> {
  const config = getConfig();
  const client = new CognitoIdentityClient({ region: config.Region });

  const payload = decodeJwtPayload(idToken);
  const issUrl = new URL(payload.iss);
  const endpoint = `${issUrl.hostname}${issUrl.pathname}`;

  const logins = { [endpoint]: idToken };

  const idResponse = await client.send(
    new GetIdCommand({
      IdentityPoolId: config.Cognito.IdentityPoolId,
      Logins: logins,
    })
  );

  const credsResponse = await client.send(
    new GetCredentialsForIdentityCommand({
      IdentityId: idResponse.IdentityId!,
      Logins: logins,
    })
  );

  const creds = credsResponse.Credentials!;
  return {
    accessKeyId: creds.AccessKeyId!,
    secretAccessKey: creds.SecretKey!,
    sessionToken: creds.SessionToken!,
    expiration: creds.Expiration!,
  };
}

export function startRefreshTimer(
  expiresIn: number,
  refreshToken: string,
  onRefresh: (tokens: AuthTokens, credentials: AwsCredentials) => void
) {
  stopRefreshTimer();

  // Refresh 5 minutes before expiry
  const duration = (expiresIn - 300) * 1000;
  if (duration <= 0) return;

  refreshTimer = setTimeout(async () => {
    try {
      const tokens = await refreshSession(refreshToken);
      const credentials = await getCredentials(tokens.idToken);
      onRefresh(tokens, credentials);
      startRefreshTimer(tokens.expiresIn, tokens.refreshToken, onRefresh);
    } catch (e) {
      console.error('Token refresh failed:', e);
    }
  }, duration);
}

export function stopRefreshTimer() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

export function signOut() {
  stopRefreshTimer();
  localStorage.removeItem('cognito.username');
  localStorage.removeItem('cognito.refreshtoken');
}

export function getUserGroups(idToken: string): string[] {
  const payload = decodeJwtPayload(idToken);
  return payload['cognito:groups'] || [];
}

function extractTokens(
  result: AuthenticationResultType,
  username: string
): AuthTokens {
  // Cache for session recovery
  localStorage.setItem('cognito.username', username);
  localStorage.setItem('cognito.refreshtoken', result.RefreshToken || '');

  return {
    accessToken: result.AccessToken!,
    idToken: result.IdToken!,
    refreshToken: result.RefreshToken!,
    expiresIn: result.ExpiresIn || 3600,
  };
}
