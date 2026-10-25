/**
 * Phase 11: AR Capability Diagnostic Service
 * 
 * Provides rigorous, non-presumptive WebXR capability detection:
 * - Differentiates between browser capability, implementation readiness, and physical validation
 * - Enforces HTTPS secure context verification (mandatory for production WebXR)
 * - Queries genuine navigator.xr.isSessionSupported('immersive-ar')
 * - Never marks a device as physically validated merely because WebXR APIs are present
 */

export interface ARCapabilityReport {
  navigatorXRAvailable: boolean;
  immersiveARSupported: boolean;
  hitTestSupported: boolean;
  domOverlaySupported: boolean;
  secureContext: boolean;
  browserName?: string;
  browserVersion?: string;
  platform?: string;
  userAgent?: string;
  physicalARValidated: boolean; // Must remain false unless verified on an actual physical mobile device
  validationState: 'CAPABILITY_ONLY' | 'IMPLEMENTATION_VERIFIED' | 'PHYSICALLY_VALIDATED';
  notes: string[];
}

export class ARCapabilityDiagnostic {
  /**
   * Evaluates the current runtime environment for WebXR Augmented Reality support.
   */
  public static async evaluateEnvironment(): Promise<ARCapabilityReport> {
    const isClient = typeof window !== 'undefined';
    const isSecure = isClient ? window.isSecureContext : false;
    const hasNavigator = typeof navigator !== 'undefined';
    const hasXR = hasNavigator && Boolean((navigator as any).xr);
    const userAgent = hasNavigator ? navigator.userAgent : 'Unknown';

    const { browserName, browserVersion, platform } = this.parseUserAgent(userAgent);

    let immersiveARSupported = false;
    const notes: string[] = [];

    if (!isSecure) {
      notes.push('Insecure context: WebXR requires secure HTTPS in production deployment.');
    }

    if (!hasXR) {
      notes.push('WebXR Device API (navigator.xr) is not available in this browser.');
    } else {
      try {
        immersiveARSupported = await (navigator as any).xr.isSessionSupported('immersive-ar');
        if (immersiveARSupported) {
          notes.push('WebXR immersive-ar session is supported by the runtime.');
        } else {
          notes.push('WebXR is present, but immersive-ar session type is not supported on this device/display.');
        }
      } catch (err: any) {
        notes.push(`isSessionSupported('immersive-ar') check failed: ${err.message || err}`);
        immersiveARSupported = false;
      }
    }

    // In this framework, hit-test and dom-overlay require immersive-ar capability
    const hitTestSupported = immersiveARSupported;
    const domOverlaySupported = immersiveARSupported;

    // Determine formal validation state:
    // Physical validation is NEVER set automatically by software detection.
    // It requires explicit physical hardware confirmation.
    let validationState: 'CAPABILITY_ONLY' | 'IMPLEMENTATION_VERIFIED' | 'PHYSICALLY_VALIDATED' = 'CAPABILITY_ONLY';
    if (immersiveARSupported) {
      validationState = 'IMPLEMENTATION_VERIFIED';
    }

    return {
      navigatorXRAvailable: hasXR,
      immersiveARSupported,
      hitTestSupported,
      domOverlaySupported,
      secureContext: isSecure,
      browserName,
      browserVersion,
      platform,
      userAgent,
      physicalARValidated: false, // Critical invariant: software check never sets physical validation to true
      validationState,
      notes
    };
  }

  /**
   * Helper to parse browser name, version, and platform safely without external dependencies.
   */
  public static parseUserAgent(ua: string): { browserName: string; browserVersion: string; platform: string } {
    let browserName = 'Unknown Browser';
    let browserVersion = 'Unknown Version';
    let platform = 'Unknown Platform';

    if (ua.includes('Android')) {
      platform = 'Android';
    } else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iOS')) {
      platform = 'iOS';
    } else if (ua.includes('Windows')) {
      platform = 'Windows';
    } else if (ua.includes('Macintosh')) {
      platform = 'macOS';
    } else if (ua.includes('Linux')) {
      platform = 'Linux';
    }

    const chromeMatch = ua.match(/Chrome\/([0-9.]+)/);
    const safariMatch = ua.match(/Version\/([0-9.]+).*Safari/);
    const firefoxMatch = ua.match(/Firefox\/([0-9.]+)/);
    const edgeMatch = ua.match(/Edg\/([0-9.]+)/);

    if (edgeMatch) {
      browserName = 'Microsoft Edge';
      browserVersion = edgeMatch[1];
    } else if (chromeMatch) {
      browserName = 'Google Chrome';
      browserVersion = chromeMatch[1];
    } else if (safariMatch) {
      browserName = 'Apple Safari';
      browserVersion = safariMatch[1];
    } else if (firefoxMatch) {
      browserName = 'Mozilla Firefox';
      browserVersion = firefoxMatch[1];
    }

    return { browserName, browserVersion, platform };
  }
}
