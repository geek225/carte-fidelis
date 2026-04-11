import { timingSafeEqual } from "node:crypto";

type BasicCredentials = {
  username: string;
  password: string;
};

const defaultAdminCredentials: BasicCredentials = {
  username: "admin",
  password: "password123",
};

function readAdminCredentials(): BasicCredentials {
  return {
    username: process.env.ADMIN_BASIC_AUTH_USER || defaultAdminCredentials.username,
    password: process.env.ADMIN_BASIC_AUTH_PASSWORD || defaultAdminCredentials.password,
  };
}

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function parseBasicAuthHeader(headerValue: string | null) {
  if (!headerValue || !headerValue.startsWith("Basic ")) {
    return null;
  }

  const encoded = headerValue.slice("Basic ".length).trim();
  if (!encoded) {
    return null;
  }

  let decoded = "";
  try {
    decoded = Buffer.from(encoded, "base64").toString("utf8");
  } catch {
    return null;
  }

  const separator = decoded.indexOf(":");
  if (separator < 0) {
    return null;
  }

  const username = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);
  return { username, password };
}

export function isAdminAuthConfigured() {
  return true;
}

export function isAdminRequestAuthorized(authorizationHeader: string | null) {
  const expected = readAdminCredentials();

  const provided = parseBasicAuthHeader(authorizationHeader);
  if (!provided) {
    return false;
  }

  return (
    safeEquals(provided.username, expected.username) && safeEquals(provided.password, expected.password)
  );
}
