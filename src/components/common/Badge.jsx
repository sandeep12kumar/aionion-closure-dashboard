import { REVIEW_STYLE, STAGE_STYLE } from '../../utils/constants.js';

export function StageBadge({ stage }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${STAGE_STYLE[stage] || STAGE_STYLE['OTP Sent']}`}>
      {stage}
    </span>
  );
}

export function ReviewBadge({ review }) {
  if (!review) return null;
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${REVIEW_STYLE[review.status]}`}>
      {review.label}
    </span>
  );
}
