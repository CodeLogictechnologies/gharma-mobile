import CryptoJS from "crypto-js";

const ACCESS_KEY = "LB0REg8HUSw3MTYrI1s6JTE8Kyc6JyAqJiA3MQ==";

export function generateEsewaSignature(
  fields: Record<string, string | number>,
  signedFieldNames: string,
): string {
  const message = signedFieldNames
    .split(",")
    .map((field) => `${field}=${fields[field]}`)
    .join(",");

  const hash = CryptoJS.HmacSHA256(message, ACCESS_KEY);
  return CryptoJS.enc.Base64.stringify(hash);
}
