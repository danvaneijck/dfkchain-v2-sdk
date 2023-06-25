import { Token } from '@uniswap/sdk-core'

/**
 * Known WKLAY implementation addresses, used in our implementation of Ether#wrapped
 */
export const WKLAY: { [chainId: number]: Token } = {
    8217: new Token(8217, '0x19Aac5f612f524B754CA7e7c41cbFa2E981A4432', 18, 'WKLAY', 'Wrapped Klay'),
}