import { LighterClient, LighterKeyManager, ORDER_TYPES, TIME_IN_FORCE } from '../src';

async function basicUsageExample() {
  // Initialize the client
  // Note: In a real application, you would load your private key securely
  const privateKey = new Uint8Array(40); // Replace with your actual private key
  
  const client = new LighterClient({
    baseUrl: 'https://api.lighter.xyz', // Replace with actual API endpoint
    lighterChainId: 1,
    privateKey,
  });

  try {
    // Get the next nonce for your account
    const nonce = await client.getNextNonce(0, 0);
    console.log('Next nonce:', nonce);

    // Create a limit buy order
    const buyOrder = await client.createLimitOrder(
      0, // market index (BTC/USDC)
      1, // client order index
      1000000, // base amount (1.0 BTC in smallest unit)
      50000, // price (0.05 USDC in smallest unit)
      false, // is ask (false = buy order)
      {
        fromAccountIndex: 0,
        apiKeyIndex: 0,
        nonce,
      }
    );

    console.log('Buy order created:', buyOrder.getTxHash());

    // Send the transaction
    const txHash = await client.sendTransaction(buyOrder);
    console.log('Transaction sent:', txHash);

    // Create a limit sell order
    const sellOrder = await client.createLimitOrder(
      0, // market index
      2, // client order index
      500000, // base amount (0.5 BTC)
      55000, // price (0.055 USDC)
      true, // is ask (true = sell order)
      {
        fromAccountIndex: 0,
        apiKeyIndex: 0,
        nonce: nonce + 1,
      }
    );

    console.log('Sell order created:', sellOrder.getTxHash());

    // Send the sell order
    const sellTxHash = await client.sendTransaction(sellOrder);
    console.log('Sell transaction sent:', sellTxHash);

    // Create a market order
    const marketOrder = await client.createMarketOrder(
      0, // market index
      3, // client order index
      200000, // base amount (0.2 BTC)
      false, // is ask (false = buy order)
      {
        fromAccountIndex: 0,
        apiKeyIndex: 0,
        nonce: nonce + 2,
      }
    );

    console.log('Market order created:', marketOrder.getTxHash());

    // Transfer USDC to another account
    const transferTx = await client.transferUSDC(
      1, // to account index
      1000000, // 1 USDC in smallest unit
      {
        fromAccountIndex: 0,
        apiKeyIndex: 0,
        nonce: nonce + 3,
      }
    );

    console.log('Transfer transaction created:', transferTx.getTxHash());

    // Cancel an order
    const cancelTx = await client.constructCancelOrderTx(
      {
        marketIndex: 0,
        index: 12345, // Replace with actual order index
      },
      {
        fromAccountIndex: 0,
        apiKeyIndex: 0,
        nonce: nonce + 4,
      }
    );

    console.log('Cancel transaction created:', cancelTx.getTxHash());

    // Modify an order
    const modifyTx = await client.constructModifyOrderTx(
      {
        marketIndex: 0,
        index: 12345, // Replace with actual order index
        baseAmount: 1500000, // New base amount (1.5 BTC)
        price: 52000, // New price (0.052 USDC)
        triggerPrice: 0, // No trigger price
      },
      {
        fromAccountIndex: 0,
        apiKeyIndex: 0,
        nonce: nonce + 5,
      }
    );

    console.log('Modify transaction created:', modifyTx.getTxHash());

    // Create grouped orders (OCO - One Cancels Other)
    const groupedTx = await client.constructCreateGroupedOrdersTx(
      {
        groupingType: 2, // One cancels the other
        orders: [
          {
            marketIndex: 0,
            clientOrderIndex: 4,
            baseAmount: 1000000,
            price: 48000, // Stop loss price
            isAsk: 1,
            type: ORDER_TYPES.STOP_LOSS_ORDER,
            timeInForce: TIME_IN_FORCE.GOOD_TILL_TIME,
            reduceOnly: 1, // Reduce only
            triggerPrice: 48000,
            orderExpiry: 0,
          },
          {
            marketIndex: 0,
            clientOrderIndex: 5,
            baseAmount: 1000000,
            price: 60000, // Take profit price
            isAsk: 1,
            type: ORDER_TYPES.TAKE_PROFIT_ORDER,
            timeInForce: TIME_IN_FORCE.GOOD_TILL_TIME,
            reduceOnly: 1, // Reduce only
            triggerPrice: 60000,
            orderExpiry: 0,
          },
        ],
      },
      {
        fromAccountIndex: 0,
        apiKeyIndex: 0,
        nonce: nonce + 6,
      }
    );

    console.log('Grouped orders created:', groupedTx.getTxHash());

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the example
basicUsageExample().catch(console.error);