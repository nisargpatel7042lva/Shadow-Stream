import { Connection, PublicKey } from '@solana/web3.js'

export class ShadowStreamClient {
  private connection: Connection

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed')
  }

  async getVaultBalance(vaultAddress: PublicKey): Promise<number> {
    const balance = await this.connection.getBalance(vaultAddress)
    return balance
  }
}
