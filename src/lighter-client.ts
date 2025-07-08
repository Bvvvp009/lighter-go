import { HTTPClient } from './client/http-client';
import { TransactionBuilder } from './utils/transaction-builder';
import { LighterKeyManager } from './signer/key-manager';
import {
  Signer,
  TransactOpts,
  ChangePubKeyReq,
  TransferTxReq,
  WithdrawTxReq,
  CreateOrderTxReq,
  CreateGroupedOrdersTxReq,
  ModifyOrderTxReq,
  CancelOrderTxReq,
  CancelAllOrdersTxReq,
  CreatePublicPoolTxReq,
  UpdatePublicPoolTxReq,
  MintSharesTxReq,
  BurnSharesTxReq,
  UpdateLeverageTxReq,
  TxInfo,
  HTTPClientConfig,
} from './types';
import { ORDER_TYPES, TIME_IN_FORCE } from './constants';

export interface LighterClientConfig extends HTTPClientConfig {
  lighterChainId: number;
  signer?: Signer;
  privateKey?: Uint8Array;
}

export class LighterClient {
  private httpClient: HTTPClient;
  private transactionBuilder: TransactionBuilder;
  private signer: Signer;

  constructor(config: LighterClientConfig) {
    this.httpClient = new HTTPClient(config);
    
    if (config.signer) {
      this.signer = config.signer;
    } else if (config.privateKey) {
      this.signer = new LighterKeyManager(config.privateKey);
    } else {
      throw new Error('Either signer or privateKey must be provided');
    }
    
    this.transactionBuilder = new TransactionBuilder(this.signer, config.lighterChainId);
  }

  // HTTP Client methods
  async getNextNonce(accountIndex: number, apiKeyIndex: number): Promise<number> {
    return await this.httpClient.getNextNonce(accountIndex, apiKeyIndex);
  }

  async getApiKey(accountIndex: number, apiKeyIndex: number) {
    return await this.httpClient.getApiKey(accountIndex, apiKeyIndex);
  }

  async sendTransaction(tx: TxInfo): Promise<string> {
    return await this.httpClient.sendRawTx(tx);
  }

  // Transaction construction methods
  async constructAuthToken(deadline: Date, opts: TransactOpts): Promise<string> {
    return await this.transactionBuilder.constructAuthToken(deadline, opts);
  }

  async constructChangePubKeyTx(req: ChangePubKeyReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.transactionBuilder.constructChangePubKeyTx(req, opts);
  }

  async constructCreateSubAccountTx(opts: TransactOpts): Promise<TxInfo> {
    return await this.transactionBuilder.constructCreateSubAccountTx(opts);
  }

  async constructTransferTx(req: TransferTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.transactionBuilder.constructTransferTx(req, opts);
  }

  async constructWithdrawTx(req: WithdrawTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.transactionBuilder.constructWithdrawTx(req, opts);
  }

  async constructCreateOrderTx(req: CreateOrderTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.transactionBuilder.constructCreateOrderTx(req, opts);
  }

  async constructCreateGroupedOrdersTx(req: CreateGroupedOrdersTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.transactionBuilder.constructCreateGroupedOrdersTx(req, opts);
  }

  async constructCancelOrderTx(req: CancelOrderTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.transactionBuilder.constructCancelOrderTx(req, opts);
  }

  async constructModifyOrderTx(req: ModifyOrderTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.transactionBuilder.constructModifyOrderTx(req, opts);
  }

  async constructCancelAllOrdersTx(req: CancelAllOrdersTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.transactionBuilder.constructCancelAllOrdersTx(req, opts);
  }

  async constructCreatePublicPoolTx(req: CreatePublicPoolTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.transactionBuilder.constructCreatePublicPoolTx(req, opts);
  }

  async constructUpdatePublicPoolTx(req: UpdatePublicPoolTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.transactionBuilder.constructUpdatePublicPoolTx(req, opts);
  }

  async constructMintSharesTx(req: MintSharesTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.transactionBuilder.constructMintSharesTx(req, opts);
  }

  async constructBurnSharesTx(req: BurnSharesTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.transactionBuilder.constructBurnSharesTx(req, opts);
  }

  async constructUpdateLeverageTx(req: UpdateLeverageTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.transactionBuilder.constructUpdateLeverageTx(req, opts);
  }

  // Convenience methods for common operations
  async createLimitOrder(
    marketIndex: number,
    clientOrderIndex: number,
    baseAmount: number,
    price: number,
    isAsk: boolean,
    opts: TransactOpts
  ): Promise<TxInfo> {
    const req: CreateOrderTxReq = {
      marketIndex,
      clientOrderIndex,
      baseAmount,
      price,
      isAsk: isAsk ? 1 : 0,
      type: ORDER_TYPES.LIMIT_ORDER,
      timeInForce: TIME_IN_FORCE.GOOD_TILL_TIME,
      reduceOnly: 0,
      triggerPrice: 0,
      orderExpiry: 0,
    };
    
    return await this.constructCreateOrderTx(req, opts);
  }

  async createMarketOrder(
    marketIndex: number,
    clientOrderIndex: number,
    baseAmount: number,
    isAsk: boolean,
    opts: TransactOpts
  ): Promise<TxInfo> {
    const req: CreateOrderTxReq = {
      marketIndex,
      clientOrderIndex,
      baseAmount,
      price: 0, // Market orders don't need price
      isAsk: isAsk ? 1 : 0,
      type: ORDER_TYPES.MARKET_ORDER,
      timeInForce: TIME_IN_FORCE.IMMEDIATE_OR_CANCEL,
      reduceOnly: 0,
      triggerPrice: 0,
      orderExpiry: 0,
    };
    
    return await this.constructCreateOrderTx(req, opts);
  }

  async transferUSDC(
    toAccountIndex: number,
    usdcAmount: number,
    opts: TransactOpts
  ): Promise<TxInfo> {
    const req: TransferTxReq = {
      toAccountIndex,
      usdcAmount,
    };
    
    return await this.constructTransferTx(req, opts);
  }

  async withdrawUSDC(
    usdcAmount: number,
    opts: TransactOpts
  ): Promise<TxInfo> {
    const req: WithdrawTxReq = {
      usdcAmount,
    };
    
    return await this.constructWithdrawTx(req, opts);
  }

  // Helper methods
  setFatFingerProtection(enabled: boolean): void {
    this.httpClient.setFatFingerProtection(enabled);
  }

  getSigner(): Signer {
    return this.signer;
  }
}