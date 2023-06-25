import { Token } from '@uniswap/sdk-core'

/**
 * Known WJEWEL implementation addresses, used in our implementation of Ether#wrapped
 */
export const WJEWEL: { [chainId: number]: Token } = {
    53935: new Token(53935, '0xCCb93dABD71c8Dad03Fc4CE5559dC3D89F67a260', 18, 'WJEWEL', 'Wrapped JEWEL'),
}