import { LighterClient } from '../src/lighter-client';

// Mock the dependencies
jest.mock('../src/client/http-client');
jest.mock('../src/utils/transaction-builder');
jest.mock('../src/signer/key-manager');

describe('LighterClient', () => {
  let client: LighterClient;
  const mockPrivateKey = new Uint8Array(40);

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    client = new LighterClient({
      baseUrl: 'https://api.test.com',
      lighterChainId: 1,
      privateKey: mockPrivateKey,
    });
  });

  describe('constructor', () => {
    it('should create a client with private key', () => {
      expect(client).toBeInstanceOf(LighterClient);
    });

    it('should throw error when neither signer nor privateKey is provided', () => {
      expect(() => {
        new LighterClient({
          baseUrl: 'https://api.test.com',
          lighterChainId: 1,
        });
      }).toThrow('Either signer or privateKey must be provided');
    });

    it('should throw error when baseUrl is not provided', () => {
      expect(() => {
        new LighterClient({
          baseUrl: '',
          lighterChainId: 1,
          privateKey: mockPrivateKey,
        });
      }).toThrow('Base URL is required');
    });
  });

  describe('convenience methods', () => {
    it('should create limit order with correct parameters', async () => {
      const mockTx = {
        getTxType: jest.fn().mockReturnValue(14),
        getTxInfo: jest.fn().mockReturnValue('{}'),
        getTxHash: jest.fn().mockReturnValue('hash'),
        validate: jest.fn(),
        hash: jest.fn().mockResolvedValue(new Uint8Array(32)),
        accountIndex: 0,
        apiKeyIndex: 0,
        nonce: 0,
        expiredAt: 0,
        signature: new Uint8Array(),
        signedHash: '',
      };

      // Mock the transaction builder
      const mockConstructCreateOrderTx = jest.fn().mockResolvedValue(mockTx);
      (client as any).transactionBuilder.constructCreateOrderTx = mockConstructCreateOrderTx;

      const result = await client.createLimitOrder(
        0, // market index
        1, // client order index
        1000000, // base amount
        50000, // price
        false, // is ask
        {
          fromAccountIndex: 0,
          apiKeyIndex: 0,
        }
      );

      expect(mockConstructCreateOrderTx).toHaveBeenCalledWith(
        expect.objectContaining({
          marketIndex: 0,
          clientOrderIndex: 1,
          baseAmount: 1000000,
          price: 50000,
          isAsk: 0,
          type: 0, // LIMIT_ORDER
          timeInForce: 1, // GOOD_TILL_TIME
          reduceOnly: 0,
          triggerPrice: 0,
          orderExpiry: 0,
        }),
        {
          fromAccountIndex: 0,
          apiKeyIndex: 0,
        }
      );

      expect(result).toBe(mockTx);
    });

    it('should create market order with correct parameters', async () => {
      const mockTx = {
        getTxType: jest.fn().mockReturnValue(14),
        getTxInfo: jest.fn().mockReturnValue('{}'),
        getTxHash: jest.fn().mockReturnValue('hash'),
        validate: jest.fn(),
        hash: jest.fn().mockResolvedValue(new Uint8Array(32)),
        accountIndex: 0,
        apiKeyIndex: 0,
        nonce: 0,
        expiredAt: 0,
        signature: new Uint8Array(),
        signedHash: '',
      };

      const mockConstructCreateOrderTx = jest.fn().mockResolvedValue(mockTx);
      (client as any).transactionBuilder.constructCreateOrderTx = mockConstructCreateOrderTx;

      const result = await client.createMarketOrder(
        0, // market index
        1, // client order index
        1000000, // base amount
        false, // is ask
        {
          fromAccountIndex: 0,
          apiKeyIndex: 0,
        }
      );

      expect(mockConstructCreateOrderTx).toHaveBeenCalledWith(
        expect.objectContaining({
          marketIndex: 0,
          clientOrderIndex: 1,
          baseAmount: 1000000,
          price: 0, // Market orders don't need price
          isAsk: 0,
          type: 1, // MARKET_ORDER
          timeInForce: 0, // IMMEDIATE_OR_CANCEL
          reduceOnly: 0,
          triggerPrice: 0,
          orderExpiry: 0,
        }),
        {
          fromAccountIndex: 0,
          apiKeyIndex: 0,
        }
      );

      expect(result).toBe(mockTx);
    });
  });
});