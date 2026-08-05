export const BODY_PARTS = [
  'neck', 'shoulder_left', 'shoulder_right', 'chest', 'waist', 'hips',
  'thigh_left', 'thigh_right', 'calf_left', 'calf_right',
  'bicep_left', 'bicep_right', 'forearm_left', 'forearm_right',
];

export function formatBodyPartLabel(id) {
  return id
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
