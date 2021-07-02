import * as EthCrypto from 'eth-crypto';
import * as protobuf from 'protobufjs/light';

export interface PublicKeyMessagePayload {
  ethDmPublicKey: Uint8Array;
  ethAddress: Uint8Array;
  signature: Uint8Array;
}

const Root = protobuf.Root,
  Type = protobuf.Type,
  Field = protobuf.Field;

/**
 * Message used to communicate the Eth-Dm public key linked to a given Ethereum account
 */
export class PublicKeyMessage {
  private static Type = new Type('PublicKeyMessage')
    .add(new Field('PublicKeyMessage', 1, 'bytes'))
    .add(new Field('ethAddress', 2, 'bytes'))
    .add(new Field('signature', 3, 'bytes'));
  private static Root = new Root()
    .define('messages')
    .add(PublicKeyMessage.Type);

  constructor(public payload: PublicKeyMessagePayload) {}

  public encode(): Uint8Array {
    const message = PublicKeyMessage.Type.create(this.payload);
    return PublicKeyMessage.Type.encode(message).finish();
  }

  public static decode(
    bytes: Uint8Array | Buffer
  ): PublicKeyMessage | undefined {
    const payload = PublicKeyMessage.Type.decode(
      bytes
    ) as unknown as PublicKeyMessagePayload;
    if (!payload.signature || !payload.ethDmPublicKey || !payload.ethAddress) {
      console.log('Field missing on decoded Public Key Message', payload);
      return;
    }
    return new PublicKeyMessage(payload);
  }

  get ethDmPublicKey(): Uint8Array {
    return this.payload.ethDmPublicKey;
  }

  get ethAddress(): Uint8Array {
    return this.payload.ethAddress;
  }

  get signature(): Uint8Array {
    return this.payload.signature;
  }
}

export function bytesToHexStr(bytes: Uint8Array): string {
  const buf = new Buffer(bytes);
  return buf.toString('hex');
}

/**
 * Direct Encrypted Message used for private communication over the Waku network.
 */
export interface DirectMessage {
  toAddress: string;
  encMessage: EthCrypto.Encrypted;
}

export function encode<T>(msg: T): Buffer {
  const jsonStr = JSON.stringify(msg);
  return Buffer.from(jsonStr, 'utf-8');
}

export function decode<T>(bytes: Uint8Array): T {
  const buf = Buffer.from(bytes);
  const str = buf.toString('utf-8');
  return JSON.parse(str);
}
