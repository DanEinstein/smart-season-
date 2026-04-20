export function computeStatus(field, lastUpdateDate) {
  if (field.current_stage === 'harvested') return 'completed';

  const daysSincePlanting = Math.floor(
    (Date.now() - new Date(field.planting_date)) / (1000 * 60 * 60 * 24)
  );
  const daysSinceUpdate = lastUpdateDate
    ? Math.floor((Date.now() - new Date(lastUpdateDate)) / (1000 * 60 * 60 * 24))
    : daysSincePlanting;

  if (daysSincePlanting > 90 && daysSinceUpdate > 14) return 'at-risk';
  if (field.current_stage === 'growing' && daysSinceUpdate > 21) return 'at-risk';

  return 'active';
}
