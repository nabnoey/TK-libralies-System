const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { googleClientId, jwtSecret } = require("../config/env");
const User = require("../models/user.model");

const client = new OAuth2Client(googleClientId);

async function verifyGoogleIdToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: googleClientId,
  });
  return ticket.getPayload(); // { email, email_verified, name, picture, sub, hd? }
}

function signJwt(user) {
  return jwt.sign(
    { uid: user.userId, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: "7d" }
  );
}

async function loginWithGoogle(idToken) {
  if (!idToken) throw new Error("Missing idToken");

  const payload = await verifyGoogleIdToken(idToken);
  if (!payload?.email || !payload?.email_verified) {
    throw new Error("Email not verified");
  }

  // ถ้าจำกัดโดเมนองค์กร:
  // if (payload.hd !== "yourcompany.com") throw new Error("Domain not allowed");

  const email = payload.email.toLowerCase();
  const name = payload.name || email.split("@")[0];

  let user = await User.findOne({ where: { email } });
  if (!user) {
    user = await User.create({
      email,
      name,
      avatar: payload.picture,
      provider: "google",
      providerId: payload.sub,
      lastLoginAt: new Date(),
    });
  } else {
    await user.update({
      name,
      avatar: payload.picture,
      providerId: payload.sub,
      lastLoginAt: new Date(),
    });
  }

  const token = signJwt(user);
  return { token, user };
}

module.exports = { loginWithGoogle };
