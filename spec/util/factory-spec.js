const { normalizeRingNameHoldToCaution } = require('../../src/util/ringNormalizer')

describe('ringNormalizer (hold → Caution mapping)', function () {
  describe('normalizeRingNameHoldToCaution', function () {
    it('maps "hold" (lowercase) to "Caution"', function () {
      expect(normalizeRingNameHoldToCaution('hold')).toEqual('Caution')
    })

    it('maps "HOLD" (uppercase) to "Caution"', function () {
      expect(normalizeRingNameHoldToCaution('HOLD')).toEqual('Caution')
    })

    it('maps "Hold" (mixed case) to "Caution"', function () {
      expect(normalizeRingNameHoldToCaution('Hold')).toEqual('Caution')
    })

    it('maps " hold " (with spaces) to "Caution"', function () {
      expect(normalizeRingNameHoldToCaution(' hold ')).toEqual('Caution')
    })

    it('returns other ring names unchanged', function () {
      expect(normalizeRingNameHoldToCaution('Adopt')).toEqual('Adopt')
      expect(normalizeRingNameHoldToCaution('Trial')).toEqual('Trial')
      expect(normalizeRingNameHoldToCaution('Assess')).toEqual('Assess')
      expect(normalizeRingNameHoldToCaution('Caution')).toEqual('Caution')
    })

    it('handles null/undefined by returning as-is (no match)', function () {
      expect(normalizeRingNameHoldToCaution(null)).toEqual(null)
      expect(normalizeRingNameHoldToCaution(undefined)).toEqual(undefined)
    })
  })
})
