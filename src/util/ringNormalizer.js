function normalizeRingNameHoldToCaution(ring) {
  if ((ring || '').trim().toLowerCase() === 'hold') {
    return 'Caution'
  }
  return ring
}

module.exports = { normalizeRingNameHoldToCaution }
