import axios, { AxiosRequestConfig } from 'axios';

import { AppConfig } from '../config/env.js';
import { logger, Logger } from '../logger.js';

const PROTOCOLS: Record<string, [{ [key: string]: unknown }, string[]]> = {
  vmess: [{}, ['VMess TCP']],
  vless: [
    {
      flow: 'xtls-rprx-vision'
    },
    ['VLESS Reality Steal Oneself']
  ],
  trojan: [{}, ['Trojan Websocket TLS']],
  shadowsocks: [
    {
      method: 'chacha20-ietf-poly1305'
    },
    ['Shadowsocks TCP']
  ]
};

export interface MarzbanUser {
  username: string;
  status: string;
  expire: number | null;
  subscription_url: string;
  [key: string]: unknown;
}

interface MarzbanListResponse {
  users: MarzbanUser[];
}

export class MarzbanService {
  private token: string | null = null;
  private readonly protocolsConfig = this.buildProtocols();

  constructor(private readonly config: AppConfig, private readonly log: Logger = logger) {}

  private get panelHost(): string {
    return this.config.panel.host;
  }

  private async sendRequest<T>(config: AxiosRequestConfig): Promise<T> {
    if (!this.token) {
      await this.refreshToken();
    }

    try {
      const response = await axios.request<T>({
        baseURL: this.panelHost,
        headers: {
          Authorization: `Bearer ${this.token}`,
          ...(config.headers ?? {})
        },
        ...config
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        this.log.warn('Marzban token expired, refreshing');
        await this.refreshToken();
        const retryResponse = await axios.request<T>({
          baseURL: this.panelHost,
          headers: {
            Authorization: `Bearer ${this.token}`,
            ...(config.headers ?? {})
          },
          ...config
        });
        return retryResponse.data;
      }
      throw error;
    }
  }

  async refreshToken(): Promise<void> {
    const payload = new URLSearchParams({
      username: this.config.panel.user,
      password: this.config.panel.password
    });
    const response = await axios.post<{ access_token: string }>(`${this.panelHost}/api/admin/token`, payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    this.token = response.data.access_token;
    this.log.debug('Marzban token refreshed');
  }

  private buildProtocols(): { proxies: Record<string, unknown>; inbounds: Record<string, string[]> } {
    const proxies: Record<string, unknown> = {};
    const inbounds: Record<string, string[]> = {};

    for (const protocol of this.config.protocols) {
      const definition = PROTOCOLS[protocol];
      if (!definition) {
        continue;
      }
      proxies[protocol] = definition[0];
      inbounds[protocol] = definition[1];
    }

    return { proxies, inbounds };
  }

  async getUser(username: string): Promise<MarzbanUser> {
    return this.sendRequest<MarzbanUser>({ method: 'GET', url: `/api/user/${username}` });
  }

  async getUsers(): Promise<MarzbanUser[]> {
    const response = await this.sendRequest<MarzbanListResponse>({ method: 'GET', url: '/api/users' });
    return response.users ?? [];
  }

  async addUser(data: Record<string, unknown>): Promise<MarzbanUser> {
    return this.sendRequest<MarzbanUser>({ method: 'POST', url: '/api/user', data });
  }

  async modifyUser(username: string, data: Record<string, unknown>): Promise<MarzbanUser> {
    return this.sendRequest<MarzbanUser>({ method: 'PUT', url: `/api/user/${username}`, data });
  }

  async checkIfUserExists(username: string): Promise<boolean> {
    try {
      await this.getUser(username);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  async generateTestSubscription(username: string): Promise<MarzbanUser> {
    const exists = await this.checkIfUserExists(username);
    if (exists) {
      const user = await this.getUser(username);
      user.status = 'active';
      const now = Math.floor(Date.now() / 1000);
      const extension = this.getTestSubscriptionDuration(true);
      if (!user.expire || user.expire < now) {
        user.expire = this.getTestSubscriptionDuration();
      } else {
        user.expire += extension;
      }
      return this.modifyUser(username, user as Record<string, unknown>);
    }

    const payload = {
      username,
      proxies: this.protocolsConfig.proxies,
      inbounds: this.protocolsConfig.inbounds,
      expire: this.getTestSubscriptionDuration(),
      data_limit: 0,
      data_limit_reset_strategy: 'no_reset'
    };
    return this.addUser(payload);
  }

  async generateSubscription(username: string, months: number): Promise<MarzbanUser> {
    const exists = await this.checkIfUserExists(username);
    if (exists) {
      const user = await this.getUser(username);
      user.status = 'active';
      const now = Math.floor(Date.now() / 1000);
      const extension = this.getSubscriptionDuration(months, true);
      if (!user.expire || user.expire < now) {
        user.expire = this.getSubscriptionDuration(months);
      } else {
        user.expire += extension;
      }
      return this.modifyUser(username, user as Record<string, unknown>);
    }

    const payload = {
      username,
      proxies: this.protocolsConfig.proxies,
      inbounds: this.protocolsConfig.inbounds,
      expire: this.getSubscriptionDuration(months),
      data_limit: 0,
      data_limit_reset_strategy: 'no_reset'
    };
    return this.addUser(payload);
  }

  getSubscriptionUrlFragment(user: MarzbanUser): string {
    return `${this.config.panel.globalUrl}${user.subscription_url}`;
  }

  getTestSubscriptionDuration(additional = false): number {
    const now = Math.floor(Date.now() / 1000);
    const durationSeconds = this.config.testPeriodHours * 60 * 60;
    return (additional ? 0 : now) + durationSeconds;
  }

  getSubscriptionDuration(months: number, additional = false): number {
    const now = Math.floor(Date.now() / 1000);
    const durationSeconds = months * 30 * 24 * 60 * 60;
    return (additional ? 0 : now) + durationSeconds;
  }
}
