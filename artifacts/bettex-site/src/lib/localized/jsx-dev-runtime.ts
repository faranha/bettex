import { jsxDEV as reactJsxDEV } from 'react/jsx-dev-runtime';
import { Fragment } from 'react/jsx-runtime';
import { localizeProps, componentProps, remember } from './jsx-runtime';
export { Fragment } from 'react/jsx-runtime';
export const jsxDEV: typeof reactJsxDEV = (type, props, key, staticChildren, source, self) =>
  remember(reactJsxDEV(type, typeof type === 'string' || type === Fragment ? localizeProps(props, type) : componentProps(type, props), key, staticChildren, source, self), props);