import { ethers } from 'ethers';
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
  OrderInfo,
  TxInfo
} from '../types';
import { TX_TYPES, CONSTANTS } from '../constants';

export class TransactionBuilder {
  private signer: Signer;
  private lighterChainId: number;

  constructor(signer: Signer, lighterChainId: number) {
    this.signer = signer;
    this.lighterChainId = lighterChainId;
  }

  private validateTransactOpts(opts: TransactOpts): void {
    if (opts.fromAccountIndex === undefined) {
      throw new Error('Missing FromAccountIndex');
    }
    if (opts.apiKeyIndex === undefined) {
      throw new Error('Missing ApiKeyIndex');
    }
  }

  private async createSignedTx(
    txData: any,
    txType: number,
    opts: TransactOpts
  ): Promise<TxInfo> {
    this.validateTransactOpts(opts);
    
    const nonce = opts.nonce ?? 0;
    const expiredAt = opts.expiredAt ?? Math.floor(Date.now() / 1000) + 3600; // 1 hour default

    const tx: TxInfo = {
      ...txData,
      txType,
      accountIndex: opts.fromAccountIndex!,
      apiKeyIndex: opts.apiKeyIndex!,
      nonce,
      expiredAt,
      signature: new Uint8Array(),
      signedHash: '',
      
      getTxType: () => txType,
      getTxInfo: () => JSON.stringify(tx),
      getTxHash: () => tx.signedHash,
      validate: () => this.validateTx(tx),
      hash: (chainId: number) => this.hashTx(tx, chainId),
    };

    // Sign the transaction
    const msgHash = await tx.hash(this.lighterChainId);
    tx.signature = await this.signer.sign(msgHash);
    tx.signedHash = ethers.hexlify(msgHash);

    return tx;
  }

  private validateTx(tx: TxInfo): void {
    // Basic validation - in a real implementation, this would be more comprehensive
    if (tx.accountIndex < CONSTANTS.MIN_ACCOUNT_INDEX || tx.accountIndex > CONSTANTS.MAX_ACCOUNT_INDEX) {
      throw new Error('Invalid account index');
    }
    if (tx.apiKeyIndex < CONSTANTS.MIN_API_KEY_INDEX || tx.apiKeyIndex > CONSTANTS.MAX_API_KEY_INDEX) {
      throw new Error('Invalid API key index');
    }
    if (tx.nonce < CONSTANTS.MIN_NONCE) {
      throw new Error('Invalid nonce');
    }
  }

  private async hashTx(tx: TxInfo, chainId: number): Promise<Uint8Array> {
    // In a real implementation, this would use the specific hashing algorithm
    // For now, we'll use a simplified approach
    const txData = {
      chainId,
      txType: tx.getTxType(),
      accountIndex: tx.accountIndex,
      apiKeyIndex: tx.apiKeyIndex,
      nonce: tx.nonce,
      expiredAt: tx.expiredAt,
      ...tx,
    };
    
    const message = JSON.stringify(txData);
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    // Use a simple hash for demonstration
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
  }

  async constructAuthToken(deadline: Date, opts: TransactOpts): Promise<string> {
    this.validateTransactOpts(opts);
    
    const message = `${Math.floor(deadline.getTime() / 1000)}:${opts.fromAccountIndex}:${opts.apiKeyIndex}`;
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(message);
    
    const signature = await this.signer.sign(messageBytes);
    
    return `${message}:${ethers.hexlify(signature)}`;
  }

  async constructChangePubKeyTx(req: ChangePubKeyReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.createSignedTx(
      { publicKey: req.pubKey },
      TX_TYPES.L2_CHANGE_PUB_KEY,
      opts
    );
  }

  async constructCreateSubAccountTx(opts: TransactOpts): Promise<TxInfo> {
    return await this.createSignedTx(
      {},
      TX_TYPES.L2_CREATE_SUB_ACCOUNT,
      opts
    );
  }

  async constructTransferTx(req: TransferTxReq, opts: TransactOpts): Promise<TxInfo> {
    if (req.usdcAmount < CONSTANTS.MIN_TRANSFER_AMOUNT || req.usdcAmount > CONSTANTS.MAX_TRANSFER_AMOUNT) {
      throw new Error('Invalid transfer amount');
    }
    
    return await this.createSignedTx(
      {
        toAccountIndex: req.toAccountIndex,
        usdcAmount: req.usdcAmount,
      },
      TX_TYPES.L2_TRANSFER,
      opts
    );
  }

  async constructWithdrawTx(req: WithdrawTxReq, opts: TransactOpts): Promise<TxInfo> {
    if (req.usdcAmount < CONSTANTS.MIN_WITHDRAWAL_AMOUNT || req.usdcAmount > CONSTANTS.MAX_WITHDRAWAL_AMOUNT) {
      throw new Error('Invalid withdrawal amount');
    }
    
    return await this.createSignedTx(
      { usdcAmount: req.usdcAmount },
      TX_TYPES.L2_WITHDRAW,
      opts
    );
  }

  async constructCreateOrderTx(req: CreateOrderTxReq, opts: TransactOpts): Promise<TxInfo> {
    this.validateOrderRequest(req);
    
    return await this.createSignedTx(
      {
        marketIndex: req.marketIndex,
        clientOrderIndex: req.clientOrderIndex,
        baseAmount: req.baseAmount,
        price: req.price,
        isAsk: req.isAsk,
        type: req.type,
        timeInForce: req.timeInForce,
        reduceOnly: req.reduceOnly,
        triggerPrice: req.triggerPrice,
        orderExpiry: req.orderExpiry,
      },
      TX_TYPES.L2_CREATE_ORDER,
      opts
    );
  }

  async constructCreateGroupedOrdersTx(req: CreateGroupedOrdersTxReq, opts: TransactOpts): Promise<TxInfo> {
    if (req.orders.length > CONSTANTS.MAX_GROUPED_ORDER_COUNT) {
      throw new Error('Too many orders in group');
    }
    
    const orders: OrderInfo[] = req.orders.map(order => ({
      marketIndex: order.marketIndex,
      clientOrderIndex: order.clientOrderIndex,
      baseAmount: order.baseAmount,
      price: order.price,
      isAsk: order.isAsk,
      type: order.type,
      timeInForce: order.timeInForce,
      reduceOnly: order.reduceOnly,
      triggerPrice: order.triggerPrice,
      orderExpiry: order.orderExpiry,
    }));
    
    return await this.createSignedTx(
      {
        groupingType: req.groupingType,
        orders,
      },
      TX_TYPES.L2_CREATE_GROUPED_ORDERS,
      opts
    );
  }

  async constructCancelOrderTx(req: CancelOrderTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.createSignedTx(
      {
        marketIndex: req.marketIndex,
        index: req.index,
      },
      TX_TYPES.L2_CANCEL_ORDER,
      opts
    );
  }

  async constructModifyOrderTx(req: ModifyOrderTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.createSignedTx(
      {
        marketIndex: req.marketIndex,
        index: req.index,
        baseAmount: req.baseAmount,
        price: req.price,
        triggerPrice: req.triggerPrice,
      },
      TX_TYPES.L2_MODIFY_ORDER,
      opts
    );
  }

  async constructCancelAllOrdersTx(req: CancelAllOrdersTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.createSignedTx(
      {
        timeInForce: req.timeInForce,
        time: req.time,
      },
      TX_TYPES.L2_CANCEL_ALL_ORDERS,
      opts
    );
  }

  async constructCreatePublicPoolTx(req: CreatePublicPoolTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.createSignedTx(
      {
        operatorFee: req.operatorFee,
        initialTotalShares: req.initialTotalShares,
        minOperatorShareRate: req.minOperatorShareRate,
      },
      TX_TYPES.L2_CREATE_PUBLIC_POOL,
      opts
    );
  }

  async constructUpdatePublicPoolTx(req: UpdatePublicPoolTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.createSignedTx(
      {
        publicPoolIndex: req.publicPoolIndex,
        status: req.status,
        operatorFee: req.operatorFee,
        minOperatorShareRate: req.minOperatorShareRate,
      },
      TX_TYPES.L2_UPDATE_PUBLIC_POOL,
      opts
    );
  }

  async constructMintSharesTx(req: MintSharesTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.createSignedTx(
      {
        publicPoolIndex: req.publicPoolIndex,
        shareAmount: req.shareAmount,
      },
      TX_TYPES.L2_MINT_SHARES,
      opts
    );
  }

  async constructBurnSharesTx(req: BurnSharesTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.createSignedTx(
      {
        publicPoolIndex: req.publicPoolIndex,
        shareAmount: req.shareAmount,
      },
      TX_TYPES.L2_BURN_SHARES,
      opts
    );
  }

  async constructUpdateLeverageTx(req: UpdateLeverageTxReq, opts: TransactOpts): Promise<TxInfo> {
    return await this.createSignedTx(
      {
        marketIndex: req.marketIndex,
        initialMarginFraction: req.initialMarginFraction,
      },
      TX_TYPES.L2_UPDATE_LEVERAGE,
      opts
    );
  }

  private validateOrderRequest(req: CreateOrderTxReq): void {
    if (req.marketIndex < CONSTANTS.MIN_MARKET_INDEX || req.marketIndex > CONSTANTS.MAX_MARKET_INDEX) {
      throw new Error('Invalid market index');
    }
    if (req.clientOrderIndex < CONSTANTS.MIN_CLIENT_ORDER_INDEX || req.clientOrderIndex > CONSTANTS.MAX_CLIENT_ORDER_INDEX) {
      throw new Error('Invalid client order index');
    }
    if (req.baseAmount < CONSTANTS.MIN_ORDER_BASE_AMOUNT || req.baseAmount > CONSTANTS.MAX_ORDER_BASE_AMOUNT) {
      throw new Error('Invalid base amount');
    }
    if (req.price < CONSTANTS.MIN_ORDER_PRICE || req.price > CONSTANTS.MAX_ORDER_PRICE) {
      throw new Error('Invalid price');
    }
  }
}