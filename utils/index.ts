import BN from "bn.js";
import web3 from "web3";
const { fromWei } = web3.utils;

export function log(...params: any) {
  if (process.env.NODE_ENV !== "production") {
    console.log(...params);
  }
}

export function shortenAddress(address: any, charsLength = 4) {
  const prefixLength = 2; // "0x"
  if (!address) {
    return "";
  }
  if (address.length < charsLength * 2 + prefixLength) {
    return address;
  }
  return (
    address.slice(0, charsLength + prefixLength) +
    "…" +
    address.slice(-charsLength)
  );
}

export function floorToFive(num: any) {
  if (!num) return;
  return +(Math.floor(+(num + "e+5")) + "e-5");
}

export function minTwoDigits(n: any) {
  return (n < 10 ? "0" : "") + n;
}

export function getMinDecimalValue(decimal: any) {
  let value = "0.";
  for (let i = 1; i < decimal; i++) {
    value += "0";
  }
  value += "1";
  return value;
}

export function getUnitByDecimal(decimals: any) {
  decimals = parseInt(decimals) || 1;
  switch (decimals) {
    case 1:
      return "wei";
    case 2:
      return "kwei";
    case 3:
      return "kwei";
    case 6:
      return "picoether";
    case 9:
      return "gwei";
    case 12:
      return "micro";
    case 15:
      return "milliether";
    case 18:
      return "ether";
    case 21:
      return "grand";
    case 24:
      return "mether";
    case 27:
      return "gether";
    case 30:
      return "tether";
    default:
      return "ether";
  }
}

export function fromWeiByDecimals(
  num: string | BN,
  decimals: string = "18"
): string {
  const output = fromWei(num, getUnitByDecimal(decimals));
  return +decimals === 2 ? `${+output * 10}` : output;
}

export const addKeyField = (
  data: { address: string; contribute: number }[]
): { address: string; contribute: number; key: number }[] =>
  data.map((v, i) => ({ ...v, key: i + 1 }));
