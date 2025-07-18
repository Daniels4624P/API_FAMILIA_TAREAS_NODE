const crypto = require("node:crypto");

const generateCodeChallenge = (codeVerifier) => {
  const base64CodeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64");

  return Buffer.from(base64CodeChallenge, "base64").toString("base64url");
};

module.exports = {
    generateCodeChallenge
}