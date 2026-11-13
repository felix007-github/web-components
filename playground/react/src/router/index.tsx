import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';

const lazyNamed = <TModule extends object, TExport extends keyof TModule>(
  loader: () => Promise<TModule>,
  exportName: TExport,
) =>
  lazy(async () => {
    const module = await loader();

    return {
      default: module[exportName] as ComponentType,
    };
  });

const withSuspense = (Component: ComponentType): ReactNode => (
  <Suspense fallback={null}>
    <Component />
  </Suspense>
);

const WtAvatarVs = lazyNamed(() => import('../views/wt-avatar'), 'WtAvatarVs');
const WtBadgeVs = lazyNamed(() => import('../views/wt-badge'), 'WtBadgeVs');
const WtButtonVs = lazyNamed(() => import('../views/wt-button'), 'WtButtonVs');
const WtCheckboxVs = lazyNamed(() => import('../views/wt-checkbox'), 'WtCheckboxVs');
const WtDividerVs = lazyNamed(() => import('../views/wt-divider'), 'WtDividerVs');
const WtGridLayoutVs = lazyNamed(() => import('../views/wt-grid-layout'), 'WtGridLayoutVs');
const WtHeatBarVs = lazyNamed(() => import('../views/wt-heat-bar'), 'WtHeatBarVs');
const WtIconVs = lazyNamed(() => import('../views/wt-icon'), 'WtIconVs');
const WtInputVs = lazyNamed(() => import('../views/wt-input'), 'WtInputVs');
const WtLinkVs = lazyNamed(() => import('../views/wt-link'), 'WtLinkVs');
const WtLoadingVs = lazyNamed(() => import('../views/wt-loading'), 'WtLoadingVs');
const WtLogoVs = lazyNamed(() => import('../views/wt-logo'), 'WtLogoVs');
const WtModalVs = lazyNamed(() => import('../views/wt-modal'), 'WtModalVs');
const WtNotificationVs = lazyNamed(() => import('../views/wt-notification'), 'WtNotificationVs');
const WtProgressVs = lazyNamed(() => import('../views/wt-progress'), 'WtProgressVs');
const WtRadioVs = lazyNamed(() => import('../views/wt-radio'), 'WtRadioVs');
const WtSearchVs = lazyNamed(() => import('../views/wt-search'), 'WtSearchVs');
const WtSwitchVs = lazyNamed(() => import('../views/wt-switch'), 'WtSwitchVs');
const WtTabBarVs = lazyNamed(() => import('../views/wt-tab-bar'), 'WtTabBarVs');
const WtTagVs = lazyNamed(() => import('../views/wt-tag'), 'WtTagVs');
const WtTreeVs = lazyNamed(() => import('../views/wt-tree'), 'WtTreeVs');
const WtScrollbarVs = lazyNamed(() => import('../views/wt-scrollbar'), 'WtScrollbarVs');

export const demoRoutes = [
  {
    path: '/wt-avatar',
    label: 'wt-avatar',
    element: withSuspense(WtAvatarVs),
  },
  {
    path: '/wt-badge',
    label: 'wt-badge',
    element: withSuspense(WtBadgeVs),
  },
  {
    path: '/wt-button',
    label: 'wt-button',
    element: withSuspense(WtButtonVs),
  },
  {
    path: '/wt-checkbox',
    label: 'wt-checkbox',
    element: withSuspense(WtCheckboxVs),
  },
  {
    path: '/wt-divider',
    label: 'wt-divider',
    element: withSuspense(WtDividerVs),
  },
  {
    path: '/wt-grid-layout',
    label: 'wt-grid-layout',
    element: withSuspense(WtGridLayoutVs),
  },
  {
    path: '/wt-heat-bar',
    label: 'wt-heat-bar',
    element: withSuspense(WtHeatBarVs),
  },
  {
    path: '/wt-icon',
    label: 'wt-icon',
    element: withSuspense(WtIconVs),
  },
  {
    path: '/wt-input',
    label: 'wt-input',
    element: withSuspense(WtInputVs),
  },
  {
    path: '/wt-link',
    label: 'wt-link',
    element: withSuspense(WtLinkVs),
  },
  {
    path: '/wt-loading',
    label: 'wt-loading',
    element: withSuspense(WtLoadingVs),
  },
  {
    path: '/wt-logo',
    label: 'wt-logo',
    element: withSuspense(WtLogoVs),
  },
  {
    path: '/wt-modal',
    label: 'wt-modal',
    element: withSuspense(WtModalVs),
  },
  {
    path: '/wt-notification',
    label: 'wt-notification',
    element: withSuspense(WtNotificationVs),
  },
  {
    path: '/wt-progress',
    label: 'wt-progress',
    element: withSuspense(WtProgressVs),
  },
  {
    path: '/wt-radio',
    label: 'wt-radio',
    element: withSuspense(WtRadioVs),
  },
  {
    path: '/wt-search',
    label: 'wt-search',
    element: withSuspense(WtSearchVs),
  },
  {
    path: '/wt-switch',
    label: 'wt-switch',
    element: withSuspense(WtSwitchVs),
  },
  {
    path: '/wt-tab-bar',
    label: 'wt-tab-bar',
    element: withSuspense(WtTabBarVs),
  },
  {
    path: '/wt-tag',
    label: 'wt-tag',
    element: withSuspense(WtTagVs),
  },
  {
    path: '/wt-tree',
    label: 'wt-tree',
    element: withSuspense(WtTreeVs),
  },
  {
    path: '/wt-scrollbar',
    label: 'wt-scrollbar',
    element: withSuspense(WtScrollbarVs),
  },
];

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to={demoRoutes[0].path} replace />,
      },
      ...demoRoutes.map(route => ({
        path: route.path,
        element: route.element,
      })),
    ],
  },
]);

export default router;
