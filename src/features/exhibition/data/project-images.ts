const imageIds = [
  '1461151753365-8d4d7d15a7be',
  '1500534623283-312aade485b7',
  '1497250681960-ef046c4e94d2',
  '1535378917042-10a22c3a2f9c',
  '1529139574466-a303027c1d8b',
];

export const projectImageUrls = [
  'https://images.unsplash.com/photo-1528901166007-3784c7dd3653?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1529465230221-a0d10e46fcbb?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1508830524289-0adcbe822b40?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1759884247381-d7222dd72dec?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1758873268745-dd2cf0d677b5?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1748345952129-3bdd7d39f155?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1770777843445-2a1621b1201d?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1748256622734-92241ae7b43f?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1506399558188-acca6f8cbf41?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1573867639040-6dd25fa5f597?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1573495628363-04667cedc587?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1763568258445-70fecf4e78af?auto=format&fit=crop&w=1600&q=80',
];

export const projectImageForCode = (code: string) => {
  const number = Number(code.replace(/^PC/i, ''));
  return projectImageUrls[number - 1] || projectFallbackImage(code);
};

const hash = (value: string) => [...value].reduce((total, character) => total + character.charCodeAt(0), 0);

export const projectFallbackImage = (seed = String(Date.now())) => {
  const imageId = imageIds[hash(seed) % imageIds.length];
  return `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=1200&q=80&sig=${hash(seed)}`;
};
