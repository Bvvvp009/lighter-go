import { TX_TYPES } from '../constants';

// Base transaction interface
export interface TxInfo {
  getTxType(): number;
  getTxInfo(): string;
  getTxHash(): string;
  validate(): void;
  hash(lighterChainId: number, extra?: any[]): Uint8Array;
  // Common properties for all transactions
  accountIndex: number;
  apiKeyIndex: number;
  nonce: number;
  expiredAt: number;
  signature: Uint8Array;
  signedHash: string;
}

// Transaction options
export interface TransactOpts {
  fromAccountIndex?: number;
  apiKeyIndex?: number;
  expiredAt?: number;
  nonce?: number;
  dryRun?: boolean;
}

// Order information
export interface OrderInfo {
  marketIndex: number;
  clientOrderIndex: number;
  baseAmount: number;
  price: number;
  isAsk: number;
  type: number;
  timeInForce: number;
  reduceOnly: number;
  triggerPrice: number;
  orderExpiry: number;
}

// Request types
export interface ChangePubKeyReq {
  pubKey: Uint8Array;
}

export interface TransferTxReq {
  toAccountIndex: number;
  usdcAmount: number;
}

export interface WithdrawTxReq {
  usdcAmount: number;
}

export interface CreateOrderTxReq {
  marketIndex: number;
  clientOrderIndex: number;
  baseAmount: number;
  price: number;
  isAsk: number;
  type: number;
  timeInForce: number;
  reduceOnly: number;
  triggerPrice: number;
  orderExpiry: number;
}

export interface CreateGroupedOrdersTxReq {
  groupingType: number;
  orders: CreateOrderTxReq[];
}

export interface ModifyOrderTxReq {
  marketIndex: number;
  index: number;
  baseAmount: number;
  price: number;
  triggerPrice: number;
}

export interface CancelOrderTxReq {
  marketIndex: number;
  index: number;
}

export interface CancelAllOrdersTxReq {
  timeInForce: number;
  time: number;
}

export interface CreatePublicPoolTxReq {
  operatorFee: number;
  initialTotalShares: number;
  minOperatorShareRate: number;
}

export interface UpdatePublicPoolTxReq {
  publicPoolIndex: number;
  status: number;
  operatorFee: number;
  minOperatorShareRate: number;
}

export interface MintSharesTxReq {
  publicPoolIndex: number;
  shareAmount: number;
}

export interface BurnSharesTxReq {
  publicPoolIndex: number;
  shareAmount: number;
}

export interface UpdateLeverageTxReq {
  marketIndex: number;
  initialMarginFraction: number;
}

// HTTP response types
export interface ResultCode {
  code: number;
  message: string;
}

export interface NextNonce {
  nonce: number;
}

export interface AccountApiKeys {
  accountIndex: number;
  apiKeyIndex: number;
  publicKey: string;
  permissions: string[];
}

export interface TxHash {
  txHash: string;
}

// HTTP client types
export interface HTTPClientConfig {
  baseUrl: string;
  channelName?: string;
  fatFingerProtection?: boolean;
  timeout?: number;
}

// Signer interface
export interface Signer {
  sign(message: Uint8Array): Promise<Uint8Array>;
  getPublicKey(): Uint8Array;
  getPublicKeyBytes(): Uint8Array;
  getPrivateKeyBytes(): Uint8Array;
}

// Key manager interface
export interface KeyManager extends Signer {
  pubKey(): Uint8Array;
  pubKeyBytes(): Uint8Array;
  prvKeyBytes(): Uint8Array;
}

// Transaction types
export interface L2ChangePubKeyTxInfo extends TxInfo {
  txType: typeof TX_TYPES.L2_CHANGE_PUB_KEY;
  accountIndex: number;
  apiKeyIndex: number;
  publicKey: Uint8Array;
  nonce: number;
  expiredAt: number;
  signature: Uint8Array;
  signedHash: string;
}

export interface L2CreateSubAccountTxInfo extends TxInfo {
  txType: typeof TX_TYPES.L2_CREATE_SUB_ACCOUNT;
  accountIndex: number;
  apiKeyIndex: number;
  nonce: number;
  expiredAt: number;
  signature: Uint8Array;
  signedHash: string;
}

export interface L2TransferTxInfo extends TxInfo {
  txType: typeof TX_TYPES.L2_TRANSFER;
  accountIndex: number;
  apiKeyIndex: number;
  toAccountIndex: number;
  usdcAmount: number;
  nonce: number;
  expiredAt: number;
  signature: Buffer;
  signedHash: string;
}

export interface L2WithdrawTxInfo extends TxInfo {
  txType: typeof TX_TYPES.L2_WITHDRAW;
  accountIndex: number;
  apiKeyIndex: number;
  usdcAmount: number;
  nonce: number;
  expiredAt: number;
  signature: Uint8Array;
  signedHash: string;
}

export interface L2CreateOrderTxInfo extends TxInfo {
  txType: typeof TX_TYPES.L2_CREATE_ORDER;
  accountIndex: number;
  apiKeyIndex: number;
  marketIndex: number;
  clientOrderIndex: number;
  baseAmount: number;
  price: number;
  isAsk: number;
  type: number;
  timeInForce: number;
  reduceOnly: number;
  triggerPrice: number;
  orderExpiry: number;
  nonce: number;
  expiredAt: number;
  signature: Uint8Array;
  signedHash: string;
}

export interface L2CreateGroupedOrdersTxInfo extends TxInfo {
  txType: typeof TX_TYPES.L2_CREATE_GROUPED_ORDERS;
  accountIndex: number;
  apiKeyIndex: number;
  groupingType: number;
  orders: OrderInfo[];
  nonce: number;
  expiredAt: number;
  signature: Buffer;
  signedHash: string;
}

export interface L2CancelOrderTxInfo extends TxInfo {
  txType: typeof TX_TYPES.L2_CANCEL_ORDER;
  accountIndex: number;
  apiKeyIndex: number;
  marketIndex: number;
  index: number;
  nonce: number;
  expiredAt: number;
  signature: Uint8Array;
  signedHash: string;
}

export interface L2ModifyOrderTxInfo extends TxInfo {
  txType: typeof TX_TYPES.L2_MODIFY_ORDER;
  accountIndex: number;
  apiKeyIndex: number;
  marketIndex: number;
  index: number;
  baseAmount: number;
  price: number;
  triggerPrice: number;
  nonce: number;
  expiredAt: number;
  signature: Buffer;
  signedHash: string;
}

export interface L2CancelAllOrdersTxInfo extends TxInfo {
  txType: typeof TX_TYPES.L2_CANCEL_ALL_ORDERS;
  accountIndex: number;
  apiKeyIndex: number;
  timeInForce: number;
  time: number;
  nonce: number;
  expiredAt: number;
  signature: Uint8Array;
  signedHash: string;
}

export interface L2CreatePublicPoolTxInfo extends TxInfo {
  txType: typeof TX_TYPES.L2_CREATE_PUBLIC_POOL;
  accountIndex: number;
  apiKeyIndex: number;
  operatorFee: number;
  initialTotalShares: number;
  minOperatorShareRate: number;
  nonce: number;
  expiredAt: number;
  signature: Buffer;
  signedHash: string;
}

export interface L2UpdatePublicPoolTxInfo extends TxInfo {
  txType: typeof TX_TYPES.L2_UPDATE_PUBLIC_POOL;
  accountIndex: number;
  apiKeyIndex: number;
  publicPoolIndex: number;
  status: number;
  operatorFee: number;
  minOperatorShareRate: number;
  nonce: number;
  expiredAt: number;
  signature: Uint8Array;
  signedHash: string;
}

export interface L2MintSharesTxInfo extends TxInfo {
  txType: typeof TX_TYPES.L2_MINT_SHARES;
  accountIndex: number;
  apiKeyIndex: number;
  publicPoolIndex: number;
  shareAmount: number;
  nonce: number;
  expiredAt: number;
  signature: Buffer;
  signedHash: string;
}

export interface L2BurnSharesTxInfo extends TxInfo {
  txType: typeof TX_TYPES.L2_BURN_SHARES;
  accountIndex: number;
  apiKeyIndex: number;
  publicPoolIndex: number;
  shareAmount: number;
  nonce: number;
  expiredAt: number;
  signature: Uint8Array;
  signedHash: string;
}

export interface L2UpdateLeverageTxInfo extends TxInfo {
  txType: typeof TX_TYPES.L2_UPDATE_LEVERAGE;
  accountIndex: number;
  apiKeyIndex: number;
  marketIndex: number;
  initialMarginFraction: number;
  nonce: number;
  expiredAt: number;
  signature: Buffer;
  signedHash: string;
}