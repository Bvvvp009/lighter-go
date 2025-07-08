# Lighter TypeScript SDK

A TypeScript SDK for interacting with the Lighter perp trading platform contracts. This SDK provides easy-to-use methods for trading, managing orders, and interacting with the Lighter protocol.

## Features

- **Complete Trading Operations**: Create, modify, and cancel orders
- **Account Management**: Transfer USDC, withdraw funds, manage sub-accounts
- **Pool Operations**: Create and manage public pools, mint/burn shares
- **Leverage Management**: Update leverage settings for markets
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Easy Integration**: Simple API design for quick integration

## Installation

```bash
npm install lighter-ts
```

## Quick Start

```typescript
import { LighterClient, LighterKeyManager } from 'lighter-ts';

// Initialize the client
const privateKey = new Uint8Array(40); // Your 40-byte private key
const client = new LighterClient({
  baseUrl: 'https://api.lighter.xyz',
  lighterChainId: 1,
  privateKey,
});

// Create a limit order
const order = await client.createLimitOrder(
  0, // market index
  1, // client order index
  1000000, // base amount (1.0 in smallest unit)
  50000, // price (0.05 in smallest unit)
  true, // is ask (sell order)
  {
    fromAccountIndex: 0,
    apiKeyIndex: 0,
  }
);

// Send the transaction
const txHash = await client.sendTransaction(order);
console.log('Transaction hash:', txHash);
```

## API Reference

### Client Initialization

```typescript
import { LighterClient, LighterKeyManager } from 'lighter-ts';

// Option 1: Using private key
const client = new LighterClient({
  baseUrl: 'https://api.lighter.xyz',
  lighterChainId: 1,
  privateKey: new Uint8Array(40), // Your private key
});

// Option 2: Using custom signer
const keyManager = new LighterKeyManager(privateKeyBytes);
const client = new LighterClient({
  baseUrl: 'https://api.lighter.xyz',
  lighterChainId: 1,
  signer: keyManager,
});
```

### Trading Operations

#### Create Limit Order

```typescript
const order = await client.createLimitOrder(
  marketIndex,    // Market index (0-254)
  clientOrderIndex, // Unique client order index
  baseAmount,     // Base asset amount
  price,          // Price in smallest unit
  isAsk,          // true for sell, false for buy
  {
    fromAccountIndex: 0,
    apiKeyIndex: 0,
  }
);
```

#### Create Market Order

```typescript
const order = await client.createMarketOrder(
  marketIndex,    // Market index
  clientOrderIndex, // Unique client order index
  baseAmount,     // Base asset amount
  isAsk,          // true for sell, false for buy
  {
    fromAccountIndex: 0,
    apiKeyIndex: 0,
  }
);
```

#### Cancel Order

```typescript
const cancelTx = await client.constructCancelOrderTx(
  {
    marketIndex: 0,
    index: 12345, // Order index to cancel
  },
  {
    fromAccountIndex: 0,
    apiKeyIndex: 0,
  }
);
```

#### Modify Order

```typescript
const modifyTx = await client.constructModifyOrderTx(
  {
    marketIndex: 0,
    index: 12345, // Order index to modify
    baseAmount: 2000000, // New base amount
    price: 55000, // New price
    triggerPrice: 0, // New trigger price
  },
  {
    fromAccountIndex: 0,
    apiKeyIndex: 0,
  }
);
```

### Account Operations

#### Transfer USDC

```typescript
const transferTx = await client.transferUSDC(
  toAccountIndex, // Destination account index
  usdcAmount,     // Amount in smallest USDC unit
  {
    fromAccountIndex: 0,
    apiKeyIndex: 0,
  }
);
```

#### Withdraw USDC

```typescript
const withdrawTx = await client.withdrawUSDC(
  usdcAmount, // Amount to withdraw
  {
    fromAccountIndex: 0,
    apiKeyIndex: 0,
  }
);
```

### Pool Operations

#### Create Public Pool

```typescript
const poolTx = await client.constructCreatePublicPoolTx(
  {
    operatorFee: 1000, // Operator fee in basis points
    initialTotalShares: 1000000, // Initial shares
    minOperatorShareRate: 100, // Minimum operator share rate
  },
  {
    fromAccountIndex: 0,
    apiKeyIndex: 0,
  }
);
```

#### Mint Shares

```typescript
const mintTx = await client.constructMintSharesTx(
  {
    publicPoolIndex: 0,
    shareAmount: 100000, // Amount of shares to mint
  },
  {
    fromAccountIndex: 0,
    apiKeyIndex: 0,
  }
);
```

### Advanced Operations

#### Create Grouped Orders

```typescript
const groupedTx = await client.constructCreateGroupedOrdersTx(
  {
    groupingType: 1, // Grouping type (0-3)
    orders: [
      {
        marketIndex: 0,
        clientOrderIndex: 1,
        baseAmount: 1000000,
        price: 50000,
        isAsk: 1,
        type: 0, // Limit order
        timeInForce: 1, // Good till time
        reduceOnly: 0,
        triggerPrice: 0,
        orderExpiry: 0,
      },
      // ... more orders
    ],
  },
  {
    fromAccountIndex: 0,
    apiKeyIndex: 0,
  }
);
```

#### Update Leverage

```typescript
const leverageTx = await client.constructUpdateLeverageTx(
  {
    marketIndex: 0,
    initialMarginFraction: 1000, // Margin fraction in basis points
  },
  {
    fromAccountIndex: 0,
    apiKeyIndex: 0,
  }
);
```

### Transaction Management

#### Get Next Nonce

```typescript
const nonce = await client.getNextNonce(accountIndex, apiKeyIndex);
```

#### Send Transaction

```typescript
const txHash = await client.sendTransaction(transaction);
```

#### Construct Auth Token

```typescript
const deadline = new Date(Date.now() + 3600000); // 1 hour from now
const authToken = await client.constructAuthToken(deadline, {
  fromAccountIndex: 0,
  apiKeyIndex: 0,
});
```

## Constants

The SDK provides various constants for order types, time-in-force options, and limits:

```typescript
import { ORDER_TYPES, TIME_IN_FORCE, CONSTANTS } from 'lighter-ts';

// Order types
ORDER_TYPES.LIMIT_ORDER
ORDER_TYPES.MARKET_ORDER
ORDER_TYPES.STOP_LOSS_ORDER
// ... etc

// Time in force
TIME_IN_FORCE.IMMEDIATE_OR_CANCEL
TIME_IN_FORCE.GOOD_TILL_TIME
TIME_IN_FORCE.POST_ONLY

// Constants
CONSTANTS.ONE_USDC // 1 USDC in smallest unit
CONSTANTS.MAX_ORDER_BASE_AMOUNT
CONSTANTS.MIN_ORDER_PRICE
// ... etc
```

## Error Handling

The SDK throws descriptive errors for various scenarios:

```typescript
try {
  const order = await client.createLimitOrder(/* ... */);
} catch (error) {
  if (error.message.includes('Invalid market index')) {
    // Handle invalid market index
  } else if (error.message.includes('Invalid price')) {
    // Handle invalid price
  }
  // Handle other errors
}
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.