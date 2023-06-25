import { Token, Price, CurrencyAmount } from '@uniswap/sdk-core'
import { InsufficientInputAmountError } from '../errors'
import { computePairAddress, Pair } from './pair'
import { WKLAY } from './wklay'
import { INIT_CODE_HASH, FACTORY_ADDRESS } from '../constants'

const CHAIN_ID = 8217

describe('computePairAddress', () => {
  it('should correctly compute the pool address', () => {
    const tokenA = new Token(
      CHAIN_ID,
      '0x30C103f8f5A3A732DFe2dCE1Cc9446f545527b43',
      18,
      'JEWEL',
      'JEWEL'
    )
    const tokenB = new Token(
      CHAIN_ID,
      '0x19Aac5f612f524B754CA7e7c41cbFa2E981A4432',
      18,
      'WKLAY',
      'Wrapped Klay'
    )

    const result = computePairAddress({
      tokenA,
      tokenB,
      factoryAddress: FACTORY_ADDRESS,
      initHashCode: INIT_CODE_HASH
    })

    expect(result).toEqual('0x0d9d200720021F9de5C8413244f81087ecB4AdcC')
  })

  it('should give same result regardless of token order', () => {
    const JEWEL = new Token(CHAIN_ID, '0x30C103f8f5A3A732DFe2dCE1Cc9446f545527b43', 18, 'JEWEL', 'JEWEL')
    const JADE = new Token(CHAIN_ID, '0xB3F5867E277798b50ba7A71C0b24FDcA03045eDF', 18, 'JADE', 'Jade')

    let tokenA = JEWEL
    let tokenB = JADE
    const resultA = computePairAddress({
      tokenA,
      tokenB,
      factoryAddress: FACTORY_ADDRESS,
      initHashCode: INIT_CODE_HASH
    })

    tokenA = JADE
    tokenB = JEWEL
    const resultB = computePairAddress({
      tokenA,
      tokenB,
      factoryAddress: FACTORY_ADDRESS,
      initHashCode: INIT_CODE_HASH
    })

    expect(resultA).toEqual(resultB)
  })
})

describe('Pair', () => {
  const oETH = new Token(CHAIN_ID, '0x34d21b1e550D73cee41151c77F3c73359527a396', 18, 'oETH', 'Orbit Bridge Klaytn Ethereum')
  const JEWEL = new Token(CHAIN_ID, '0x30C103f8f5A3A732DFe2dCE1Cc9446f545527b43', 18, 'JEWEL', 'JEWEL')

  describe('#getAddress', () => {
    it('returns the correct address', () => {
      expect(Pair.getAddress(oETH, JEWEL)).toEqual('0xd3e2Fd9dB41Acea03f0E0c22d85D3076186f4f24')
    })
  })

  describe('#token0', () => {
    it('always is the token that sorts before', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(oETH, '100'), CurrencyAmount.fromRawAmount(JEWEL, '100')).token0
      ).toEqual(JEWEL)
      expect(
        new Pair(CurrencyAmount.fromRawAmount(JEWEL, '100'), CurrencyAmount.fromRawAmount(oETH, '100')).token0
      ).toEqual(JEWEL)
    })
  })

  describe('#token1', () => {
    it('always is the token that sorts after', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(oETH, '100'), CurrencyAmount.fromRawAmount(JEWEL, '100')).token1
      ).toEqual(oETH)
      expect(
        new Pair(CurrencyAmount.fromRawAmount(JEWEL, '100'), CurrencyAmount.fromRawAmount(oETH, '100')).token1
      ).toEqual(oETH)
    })
  })
  describe('#reserve0', () => {
    it('always comes from the token that sorts before', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(oETH, '100'), CurrencyAmount.fromRawAmount(JEWEL, '101')).reserve0
      ).toEqual(CurrencyAmount.fromRawAmount(JEWEL, '101'))
      expect(
        new Pair(CurrencyAmount.fromRawAmount(JEWEL, '101'), CurrencyAmount.fromRawAmount(oETH, '100')).reserve0
      ).toEqual(CurrencyAmount.fromRawAmount(JEWEL, '101'))
    })
  })
  describe('#reserve1', () => {
    it('always comes from the token that sorts after', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(oETH, '100'), CurrencyAmount.fromRawAmount(JEWEL, '101')).reserve1
      ).toEqual(CurrencyAmount.fromRawAmount(oETH, '100'))
      expect(
        new Pair(CurrencyAmount.fromRawAmount(JEWEL, '101'), CurrencyAmount.fromRawAmount(oETH, '100')).reserve1
      ).toEqual(CurrencyAmount.fromRawAmount(oETH, '100'))
    })
  })

  describe('#token0Price', () => {
    it('returns price of token0 in terms of token1', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(oETH, '101'), CurrencyAmount.fromRawAmount(JEWEL, '100')).token0Price
      ).toEqual(new Price(JEWEL, oETH, '100', '101'))
      expect(
        new Pair(CurrencyAmount.fromRawAmount(JEWEL, '100'), CurrencyAmount.fromRawAmount(oETH, '101')).token0Price
      ).toEqual(new Price(JEWEL, oETH, '100', '101'))
    })
  })

  describe('#token1Price', () => {
    it('returns price of token1 in terms of token0', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(oETH, '101'), CurrencyAmount.fromRawAmount(JEWEL, '100')).token1Price
      ).toEqual(new Price(oETH, JEWEL, '101', '100'))
      expect(
        new Pair(CurrencyAmount.fromRawAmount(JEWEL, '100'), CurrencyAmount.fromRawAmount(oETH, '101')).token1Price
      ).toEqual(new Price(oETH, JEWEL, '101', '100'))
    })
  })

  describe('#priceOf', () => {
    const pair = new Pair(CurrencyAmount.fromRawAmount(oETH, '101'), CurrencyAmount.fromRawAmount(JEWEL, '100'))
    it('returns price of token in terms of other token', () => {
      expect(pair.priceOf(JEWEL)).toEqual(pair.token0Price)
      expect(pair.priceOf(oETH)).toEqual(pair.token1Price)
    })

    it('throws if invalid token', () => {
      expect(() => pair.priceOf(WKLAY[CHAIN_ID])).toThrow('TOKEN')
    })
  })

  describe('#reserveOf', () => {
    it('returns reserves of the given token', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(oETH, '100'), CurrencyAmount.fromRawAmount(JEWEL, '101')).reserveOf(oETH)
      ).toEqual(CurrencyAmount.fromRawAmount(oETH, '100'))
      expect(
        new Pair(CurrencyAmount.fromRawAmount(JEWEL, '101'), CurrencyAmount.fromRawAmount(oETH, '100')).reserveOf(oETH)
      ).toEqual(CurrencyAmount.fromRawAmount(oETH, '100'))
    })

    it('throws if not in the pair', () => {
      expect(() =>
        new Pair(CurrencyAmount.fromRawAmount(JEWEL, '101'), CurrencyAmount.fromRawAmount(oETH, '100')).reserveOf(
          WKLAY[CHAIN_ID]
        )
      ).toThrow('TOKEN')
    })
  })

  describe('#chainId', () => {
    it('returns the token0 chainId', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(oETH, '100'), CurrencyAmount.fromRawAmount(JEWEL, '100')).chainId
      ).toEqual(CHAIN_ID)
      expect(
        new Pair(CurrencyAmount.fromRawAmount(JEWEL, '100'), CurrencyAmount.fromRawAmount(oETH, '100')).chainId
      ).toEqual(CHAIN_ID)
    })
  })
  describe('#involvesToken', () => {
    expect(
      new Pair(CurrencyAmount.fromRawAmount(oETH, '100'), CurrencyAmount.fromRawAmount(JEWEL, '100')).involvesToken(oETH)
    ).toEqual(true)
    expect(
      new Pair(CurrencyAmount.fromRawAmount(oETH, '100'), CurrencyAmount.fromRawAmount(JEWEL, '100')).involvesToken(JEWEL)
    ).toEqual(true)
    expect(
      new Pair(CurrencyAmount.fromRawAmount(oETH, '100'), CurrencyAmount.fromRawAmount(JEWEL, '100')).involvesToken(
        WKLAY[CHAIN_ID]
      )
    ).toEqual(false)
  })
  describe('miscellaneous', () => {
    it('getLiquidityMinted:0', async () => {
      const tokenA = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000001', 18)
      const tokenB = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000002', 18)
      const pair = new Pair(CurrencyAmount.fromRawAmount(tokenA, '0'), CurrencyAmount.fromRawAmount(tokenB, '0'))

      expect(() => {
        pair.getLiquidityMinted(
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '0'),
          CurrencyAmount.fromRawAmount(tokenA, '1000'),
          CurrencyAmount.fromRawAmount(tokenB, '1000')
        )
      }).toThrow(InsufficientInputAmountError)

      expect(() => {
        pair.getLiquidityMinted(
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '0'),
          CurrencyAmount.fromRawAmount(tokenA, '1000000'),
          CurrencyAmount.fromRawAmount(tokenB, '1')
        )
      }).toThrow(InsufficientInputAmountError)

      const liquidity = pair.getLiquidityMinted(
        CurrencyAmount.fromRawAmount(pair.liquidityToken, '0'),
        CurrencyAmount.fromRawAmount(tokenA, '1001'),
        CurrencyAmount.fromRawAmount(tokenB, '1001')
      )

      expect(liquidity.quotient.toString()).toEqual('1')
    })

    it('getLiquidityMinted:!0', async () => {
      const tokenA = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000001', 18)
      const tokenB = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000002', 18)
      const pair = new Pair(
        CurrencyAmount.fromRawAmount(tokenA, '10000'),
        CurrencyAmount.fromRawAmount(tokenB, '10000')
      )

      expect(
        pair
          .getLiquidityMinted(
            CurrencyAmount.fromRawAmount(pair.liquidityToken, '10000'),
            CurrencyAmount.fromRawAmount(tokenA, '2000'),
            CurrencyAmount.fromRawAmount(tokenB, '2000')
          )
          .quotient.toString()
      ).toEqual('2000')
    })

    it('getLiquidityValue:!feeOn', async () => {
      const tokenA = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000001', 18)
      const tokenB = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000002', 18)
      const pair = new Pair(CurrencyAmount.fromRawAmount(tokenA, '1000'), CurrencyAmount.fromRawAmount(tokenB, '1000'))

      {
        const liquidityValue = pair.getLiquidityValue(
          tokenA,
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          false
        )
        expect(liquidityValue.currency.equals(tokenA)).toBe(true)
        expect(liquidityValue.quotient.toString()).toBe('1000')
      }

      // 500
      {
        const liquidityValue = pair.getLiquidityValue(
          tokenA,
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '500'),
          false
        )
        expect(liquidityValue.currency.equals(tokenA)).toBe(true)
        expect(liquidityValue.quotient.toString()).toBe('500')
      }

      // tokenB
      {
        const liquidityValue = pair.getLiquidityValue(
          tokenB,
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          false
        )
        expect(liquidityValue.currency.equals(tokenB)).toBe(true)
        expect(liquidityValue.quotient.toString()).toBe('1000')
      }
    })

    it('getLiquidityValue:feeOn', async () => {
      const tokenA = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000001', 18)
      const tokenB = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000002', 18)
      const pair = new Pair(CurrencyAmount.fromRawAmount(tokenA, '1000'), CurrencyAmount.fromRawAmount(tokenB, '1000'))

      const liquidityValue = pair.getLiquidityValue(
        tokenA,
        CurrencyAmount.fromRawAmount(pair.liquidityToken, '500'),
        CurrencyAmount.fromRawAmount(pair.liquidityToken, '500'),
        true,
        '250000' // 500 ** 2
      )
      expect(liquidityValue.currency.equals(tokenA)).toBe(true)
      expect(liquidityValue.quotient.toString()).toBe('917') // ceiling(1000 - (500 * (1 / 6)))
    })
  })
})
