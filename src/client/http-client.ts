import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { 
  HTTPClientConfig, 
  ResultCode, 
  NextNonce, 
  AccountApiKeys, 
  TxHash,
  TxInfo 
} from '../types';

export class HTTPClient {
  private endpoint: string;
  private channelName: string;
  private fatFingerProtection: boolean;
  private client: AxiosInstance;

  constructor(config: HTTPClientConfig) {
    if (!config.baseUrl) {
      throw new Error('Base URL is required');
    }

    this.endpoint = config.baseUrl;
    this.channelName = config.channelName || '';
    this.fatFingerProtection = config.fatFingerProtection !== false;
    
    this.client = axios.create({
      baseURL: this.endpoint,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  setFatFingerProtection(enabled: boolean): void {
    this.fatFingerProtection = enabled;
  }

  private async parseResultStatus(responseData: any): Promise<void> {
    const resultStatus = responseData as ResultCode;
    if (resultStatus.code !== 0) { // Assuming 0 is OK
      throw new Error(resultStatus.message || 'Unknown error');
    }
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST',
    path: string,
    params?: Record<string, any>,
    data?: any
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      method,
      url: path,
      params: method === 'GET' ? params : undefined,
      data: method === 'POST' ? data : undefined,
      headers: {},
    };

    if (this.channelName) {
      config.headers!['Channel-Name'] = this.channelName;
    }

    try {
      const response = await this.client.request(config);
      await this.parseResultStatus(response.data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`HTTP ${error.response.status}: ${error.response.data}`);
      }
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  async getNextNonce(accountIndex: number, apiKeyIndex: number): Promise<number> {
    const result = await this.makeRequest<NextNonce>('GET', 'api/v1/nextNonce', {
      account_index: accountIndex,
      api_key_index: apiKeyIndex,
    });
    return result.nonce;
  }

  async getApiKey(accountIndex: number, apiKeyIndex: number): Promise<AccountApiKeys> {
    return await this.makeRequest<AccountApiKeys>('GET', 'api/v1/apikeys', {
      account_index: accountIndex,
      api_key_index: apiKeyIndex,
    });
  }

  async sendRawTx(tx: TxInfo): Promise<string> {
    const txType = tx.getTxType();
    const txInfo = tx.getTxInfo();

    const formData = {
      tx_type: txType.toString(),
      tx_info: txInfo,
      ...(this.fatFingerProtection ? {} : { price_protection: 'false' }),
    };

    const result = await this.makeRequest<TxHash>('POST', 'api/v1/sendTx', undefined, formData);
    return result.txHash;
  }
}