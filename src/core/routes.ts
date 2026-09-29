// Payment Routes & Route Selector — pure TypeScript
// Aligns with ARCHITECTURE.md 6.3 & PRD 7.3

import type { RouteId } from './valueTypes';
import type { PaymentSession } from './session';

export type Availability =
  | { status: 'AVAILABLE'; reason?: string }
  | { status: 'UNAVAILABLE'; reason: string; fixAction?: string };

export interface RouteContext {
  isOnline: boolean;
  hasDialer: boolean;
  selectedBank?: string | null;
}

export interface RouteEvent {
  type: 'INITIALIZED' | 'DIALER_OPENED' | 'SMS_RECEIVED' | 'CONFIRMED' | 'FAILED';
  timestamp: number;
  payload?: string;
}

export interface PaymentRoute {
  readonly id: RouteId;
  readonly displayName: string;
  readonly description: string;
  availability(ctx: RouteContext): Promise<Availability>;
  generateActionUri(session: PaymentSession): string;
}

export class OnlineUpiRoute implements PaymentRoute {
  readonly id: RouteId = 'ONLINE_UPI';
  readonly displayName = 'Online UPI App';
  readonly description = 'Pay via installed UPI apps (GPay, PhonePe, Paytm, BHIM) when internet is available.';

  async availability(ctx: RouteContext): Promise<Availability> {
    if (!ctx.isOnline) {
      return {
        status: 'UNAVAILABLE',
        reason: 'No active internet connection detected on this device.',
        fixAction: 'Connect to Wi-Fi/Mobile Data, or use the Offline USSD Guided route.',
      };
    }
    return { status: 'AVAILABLE', reason: 'High-speed internet detected.' };
  }

  generateActionUri(session: PaymentSession): string {
    const params = new URLSearchParams();
    params.set('pa', session.payeeVpa);
    if (session.payeeName) params.set('pn', session.payeeName);
    if (session.amount) params.set('am', session.amount);
    if (session.note) params.set('tn', session.note);
    params.set('cu', 'INR');
    return `upi://pay?${params.toString()}`;
  }
}

export class GuidedManualRoute implements PaymentRoute {
  readonly id: RouteId = 'USSD_GUIDED';
  readonly displayName = 'Offline • USSD Guided (*99#)';
  readonly description = 'Pay offline via NPCI NUUP GSM cellular protocol. No mobile data or internet needed.';

  async availability(_ctx: RouteContext): Promise<Availability> {
    // USSD is always available on phone hardware as long as GSM cellular SIM is present
    return {
      status: 'AVAILABLE',
      reason: 'Works offline on any phone with cellular voice/GSM signal.',
    };
  }

  generateActionUri(_session: PaymentSession): string {
    // # encoded as %23 for tel: links
    return 'tel:*99%23';
  }
}

export interface RouteSelectionResult {
  route: PaymentRoute;
  reason: string;
  isFallback: boolean;
}

export class RouteSelector {
  private routes: PaymentRoute[];

  constructor(routes: PaymentRoute[] = [new OnlineUpiRoute(), new GuidedManualRoute()]) {
    this.routes = routes;
  }

  async selectRoute(ctx: RouteContext, excludedRouteIds: RouteId[] = []): Promise<RouteSelectionResult> {
    const availableRoutes = this.routes.filter((r) => !excludedRouteIds.includes(r.id));

    // Priority 1: Online UPI if available
    const onlineRoute = availableRoutes.find((r) => r.id === 'ONLINE_UPI');
    if (onlineRoute) {
      const avail = await onlineRoute.availability(ctx);
      if (avail.status === 'AVAILABLE') {
        return {
          route: onlineRoute,
          reason: 'Online internet connection is active. Direct UPI app link enabled.',
          isFallback: false,
        };
      }
    }

    // Priority 2: Guided Manual USSD
    const guidedRoute = availableRoutes.find((r) => r.id === 'USSD_GUIDED');
    if (guidedRoute) {
      const avail = await guidedRoute.availability(ctx);
      if (avail.status === 'AVAILABLE') {
        const isOffline = !ctx.isOnline;
        return {
          route: guidedRoute,
          reason: isOffline
            ? 'No internet connection detected. Routed to Offline USSD (*99#).'
            : 'Using standard offline GSM protocol.',
          isFallback: isOffline,
        };
      }
    }

    // Default fallback to guided route
    const fallback = this.routes.find((r) => r.id === 'USSD_GUIDED') || this.routes[0];
    return {
      route: fallback,
      reason: 'Standard fallback to USSD Guided mode.',
      isFallback: true,
    };
  }
}

export const defaultRouteSelector = new RouteSelector();
