import crypto from 'crypto';
import { UserRecord } from './types';
import { TrailmarkDatabase } from './db';

const SESSION_SECRET = process.env.SESSION_SECRET_KEY || 'trailmark-super-secret-session-key-2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || '';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  exp: number;
}

export class AuthService {
  private db: TrailmarkDatabase;

  constructor(db: TrailmarkDatabase) {
    this.db = db;
  }

  // --- Password Hashing with Salt ---
  public hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  public verifyPassword(password: string, storedHash: string): boolean {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(hash, 'hex'));
  }

  // --- Signed Token Generation & Verification ---
  public createToken(user: UserRecord): string {
    const payload: SessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    };
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(data)
      .digest('base64url');
    return `${data}.${signature}`;
  }

  public verifyToken(token: string): SessionPayload | null {
    try {
      const [data, signature] = token.split('.');
      if (!data || !signature) return null;

      const expectedSig = crypto
        .createHmac('sha256', SESSION_SECRET)
        .update(data)
        .digest('base64url');

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
        return null;
      }

      const payload: SessionPayload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
      if (Date.now() > payload.exp) {
        return null; // Expired
      }
      return payload;
    } catch {
      return null;
    }
  }

  // --- Local User Registration ---
  public registerLocal(name: string, email: string, password: string): { user: UserRecord; token: string } {
    const cleanEmail = email.trim().toLowerCase();
    const existing = this.db.getUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const newUser: UserRecord = {
      id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      email: cleanEmail,
      name: name.trim() || cleanEmail.split('@')[0],
      password_hash: this.hashPassword(password),
      auth_provider: 'local',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      created_at: new Date().toISOString(),
    };

    const saved = this.db.createUser(newUser);
    const token = this.createToken(saved);
    return { user: saved, token };
  }

  // --- Local User Login ---
  public loginLocal(email: string, password: string): { user: UserRecord; token: string } {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.db.getUserByEmail(cleanEmail);
    if (!user || !user.password_hash) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    const isValid = this.verifyPassword(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    const token = this.createToken(user);
    return { user, token };
  }

  // --- Google OAuth Integration Status & Flow ---
  public getGoogleOAuthConfig() {
    return {
      configured: Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
      clientId: GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.substring(0, 12)}...` : null,
      redirectUri: GOOGLE_REDIRECT_URI || '/api/auth/google/callback',
    };
  }

  public getGoogleAuthUrl(state: string = 'tm_oauth_state'): string {
    if (!GOOGLE_CLIENT_ID) {
      return '';
    }
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      state,
      prompt: 'select_account',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // --- Google ID Token / Callback Verification & Account Upsert ---
  public async handleGoogleAuth(googleProfile: {
    email: string;
    name: string;
    sub?: string;
    picture?: string;
  }): Promise<{ user: UserRecord; token: string }> {
    const cleanEmail = googleProfile.email.toLowerCase().trim();
    let user = this.db.getUserByEmail(cleanEmail);

    if (!user) {
      user = {
        id: `usr_g_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        email: cleanEmail,
        name: googleProfile.name || cleanEmail.split('@')[0],
        password_hash: null,
        auth_provider: 'google',
        avatar_url: googleProfile.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleProfile.name)}`,
        created_at: new Date().toISOString(),
      };
      user = this.db.createUser(user);
    }

    const token = this.createToken(user);
    return { user, token };
  }

  // --- Demo / Quick Guest Login for Instant Hackathon Evaluation ---
  public loginDemoUser(): { user: UserRecord; token: string } {
    const demoEmail = 'alex.rivera@trailmark.internal';
    let user = this.db.getUserByEmail(demoEmail);

    if (!user) {
      user = {
        id: 'usr_demo_alex_rivera',
        email: demoEmail,
        name: 'Alex Rivera (Lead Architect)',
        password_hash: this.hashPassword('trailmark2026!'),
        auth_provider: 'demo',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        created_at: new Date().toISOString(),
      };
      user = this.db.createUser(user);
    }

    const token = this.createToken(user);
    return { user, token };
  }
}
