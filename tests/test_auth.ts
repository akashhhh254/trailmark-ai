import { TrailmarkDatabase } from '../server/db';
import { AuthService } from '../server/auth';
import fs from 'fs';

console.log('\n--- Running Trailmark Authentication Test Suite ---');

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

async function runAuthTests() {
  const testDb = new TrailmarkDatabase('./data/test_auth');
  await testDb.initialize();
  const auth = new AuthService(testDb);

  // 1. Password hashing test
  const password = 'StrongPassword2026!';
  const hash = auth.hashPassword(password);
  assert(hash.includes(':'), 'Generates salted hash with delimiter');
  assert(auth.verifyPassword(password, hash), 'Verifies correct password against hash');
  assert(!auth.verifyPassword('WrongPassword', hash), 'Rejects incorrect password');

  // 2. User registration
  const email = `engineer_${Date.now()}@trailmark.io`;
  const { user, token } = auth.registerLocal('Jane Doe', email, password);
  assert(user.email === email, 'Registers user with correct lowercase email');
  assert(user.name === 'Jane Doe', 'Preserves user full name');
  assert(Boolean(token), 'Generates signed session token upon registration');

  // 3. Duplicate registration prevention
  try {
    auth.registerLocal('Jane Clone', email, password);
    assert(false, 'Should prevent duplicate email registration');
  } catch (err: any) {
    assert(err.message.includes('already exists'), 'Prevents duplicate email registration');
  }

  // 4. User login
  const loginResult = auth.loginLocal(email, password);
  assert(loginResult.user.id === user.id, 'Authenticates valid credentials');
  assert(Boolean(loginResult.token), 'Issues valid session token');

  // 5. Invalid credentials rejection
  try {
    auth.loginLocal(email, 'BadPassword');
    assert(false, 'Should reject invalid password');
  } catch (err: any) {
    assert(err.message.includes('Invalid email or password'), 'Safely rejects invalid login credentials');
  }

  // 6. Token verification
  const payload = auth.verifyToken(token);
  assert(payload !== null && payload.userId === user.id, 'Verifies HMAC session token signature and user ID');
  assert(auth.verifyToken('invalid.token.tampered') === null, 'Rejects forged or tampered token');

  // 7. Demo / Guest Login
  const demoResult = auth.loginDemoUser();
  assert(demoResult.user.email === 'alex.rivera@trailmark.internal', 'Provisions demo reviewer user');
  assert(demoResult.user.name.includes('Alex Rivera'), 'Sets demo user display name');

  console.log(`\nAuth Test Results: ${passedTests}/${totalTests} tests passed.`);
  if (passedTests === totalTests) {
    console.log('ALL AUTHENTICATION TESTS PASSED SUCCESSFULLY! 🔐\n');
  }

  // Clean test db
  try {
    fs.rmSync('./data/test_auth', { recursive: true, force: true });
  } catch {}
}

runAuthTests().catch((e) => {
  console.error('Auth test failed:', e);
  process.exit(1);
});
