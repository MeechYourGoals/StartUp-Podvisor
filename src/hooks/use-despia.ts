
export function useDespia() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isDespia = userAgent.includes('despia');
  const isDespiaIOS = isDespia && (userAgent.includes('iphone') || userAgent.includes('ipad'));
  const isDespiaAndroid = isDespia && userAgent.includes('android');
  return { isDespia, isDespiaIOS, isDespiaAndroid };
}
