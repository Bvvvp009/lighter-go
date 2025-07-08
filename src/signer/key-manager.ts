import { ethers } from 'ethers';
import { KeyManager } from '../types';

export class LighterKeyManager implements KeyManager {
  private privateKey: Uint8Array;
  private publicKey: Uint8Array;

  constructor(privateKeyBytes: Uint8Array) {
    if (privateKeyBytes.length !== 40) {
      throw new Error(`Invalid private key length. Expected: 40, got: ${privateKeyBytes.length}`);
    }
    
    this.privateKey = privateKeyBytes;
    this.publicKey = this.derivePublicKey();
  }

  static fromPrivateKey(privateKeyBytes: Uint8Array): LighterKeyManager {
    return new LighterKeyManager(privateKeyBytes);
  }

  static fromHexString(hexString: string): LighterKeyManager {
    const privateKeyBytes = ethers.getBytes(hexString);
    return new LighterKeyManager(privateKeyBytes);
  }

  private derivePublicKey(): Uint8Array {
    // In a real implementation, this would use the specific elliptic curve
    // For now, we'll use a simplified approach with ethers.js
    const wallet = new ethers.Wallet(this.privateKey);
    const publicKey = wallet.publicKey;
    return ethers.getBytes(publicKey);
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    try {
      // In a real implementation, this would use the specific signature scheme
      // For now, we'll use a simplified approach with ethers.js
      const wallet = new ethers.Wallet(this.privateKey);
      const signature = await wallet.signMessage(message);
      return ethers.getBytes(signature);
    } catch (error) {
      throw new Error(`Failed to sign message: ${error}`);
    }
  }

  getPublicKey(): Uint8Array {
    return this.publicKey;
  }

  getPublicKeyBytes(): Uint8Array {
    return this.publicKey;
  }

  getPrivateKeyBytes(): Uint8Array {
    return this.privateKey;
  }

  pubKey(): Uint8Array {
    return this.publicKey;
  }

  pubKeyBytes(): Uint8Array {
    return this.publicKey;
  }

  prvKeyBytes(): Uint8Array {
    return this.privateKey;
  }
}