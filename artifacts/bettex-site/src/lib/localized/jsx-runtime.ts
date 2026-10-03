import { jsx as reactJsx, jsxs as reactJsxs, Fragment } from 'react/jsx-runtime';
import { cloneElement, isValidElement, type ReactElement } from 'react';
import { t, localizedUrl, getLocale, type Locale } from '../i18n';
export { Fragment };
const originals = new WeakMap<object, { props: Record<string, unknown>; locale: Locale }>();
function children(value: unknown): unknown {
  if (typeof value === 'string') return t(value);
  if (Array.isArray(value)) return value.map(children);
  if (isValidElement(value) && (typeof value.type === 'string' || value.type === Fragment)) {
    const original = originals.get(value);
    // React.Children.toArray clones elements and does not preserve WeakMap
    // entries. Re-localize their existing props instead of leaking the PT
    // module-level documentation tree into later SSR languages.
    if ((original && original.locale !== getLocale()) || (!original && getLocale() !== 'pt')) {
      const sourceProps = original?.props ?? value.props as Record<string, unknown>;
      const localized = cloneElement(value as ReactElement<Record<string, unknown>>, localizeProps(sourceProps, value.type) ?? {});
      const store = (localized as unknown as { _store?: { validated: number } })._store;
      if (store) store.validated = 1;
      originals.set(localized, { props: sourceProps, locale: getLocale() });
      return localized;
    }
  }
  return value;
}
export function localizeProps(input: unknown, type?: unknown) {
  const props = input as Record<string, unknown> | null;
  if (!props) return props;
  if (type === 'style' || type === 'script' || ['translated', 'raw'].includes(props['data-i18n'] as string)) return props;
  const result = { ...props };
  if ('children' in result) result.children = children(result.children);
  for (const name of ['aria-label', 'title', 'alt', 'placeholder']) if (typeof result[name] === 'string') result[name] = t(result[name] as string);
  if (typeof result.href === 'string') result.href = localizedUrl(result.href);
  return result;
}
export function componentProps(type: unknown, input: unknown) {
  const props = input as Record<string, unknown> | null;
  if (!props) return props;
  const result = { ...props };
  if (typeof result.href === 'string') result.href = localizedUrl(result.href);
  for (const name of ['aria-label', 'title', 'alt', 'placeholder', 'label']) if (typeof result[name] === 'string') result[name] = t(result[name] as string);
  if (['Area', 'Line', 'Bar', 'Scatter'].includes((type as { displayName?: string })?.displayName ?? '') && typeof result.name === 'string') result.name = t(result.name);
  for (const name of ['formatter', 'labelFormatter', 'tickFormatter']) {
    const formatter = result[name];
    if (typeof formatter === 'function') result[name] = (...args: unknown[]) => children(formatter(...args));
  }
  return result;
}
export function remember(element: ReactElement, input: unknown) {
  const props = input as Record<string, unknown> | null;
  if (props) originals.set(element, { props, locale: getLocale() });
  return element;
}
export const jsx: typeof reactJsx = (type, props, key) => remember(reactJsx(type, typeof type === 'string' || type === Fragment ? localizeProps(props, type) : componentProps(type, props), key), props);
export const jsxs: typeof reactJsxs = (type, props, key) => remember(reactJsxs(type, typeof type === 'string' || type === Fragment ? localizeProps(props, type) : componentProps(type, props), key), props);