/**
 * SomaCare Defensive Security & Data Protection Guard
 * Protects PII, prevents Prompt Injection attacks, ensures idempotency, and limits traffic load.
 */

export class SecurityGuard {
  // Idempotency cache to stop duplicate orders within 10 seconds
  private static idempotencySet = new Set<string>();

  // Token bucket for rate limiting: 60 calls per minute
  private static requestTimestamps: number[] = [];
  private static readonly RATE_LIMIT_MAX = 60;
  private static readonly RATE_LIMIT_WINDOW_MS = 60000;

  /**
   * Sanitizes user input against prompt injection, jailbreaking, and script tags
   */
  static sanitizeVoiceInput(rawInput: string): { cleanInput: string; isBlocked: boolean; threatReason?: string } {
    if (!rawInput || typeof rawInput !== 'string') {
      return { cleanInput: '', isBlocked: false };
    }

    const lower = rawInput.toLowerCase();

    // 1. Jailbreak & Prompt Injection patterns
    const injectionPatterns = [
      'ignore previous instructions',
      'system prompt',
      'override safety',
      'order 100',
      'order 1000',
      'drop table',
      'select * from',
      '<script',
      'javascript:',
      'morphine',
      'fentanyl',
      'kill',
      'die'
    ];

    for (const pattern of injectionPatterns) {
      if (lower.includes(pattern)) {
        return {
          cleanInput: 'Sanitized input [Hazard Intercepted]',
          isBlocked: true,
          threatReason: `Adversarial Injection Detected: Matched blocked pattern "${pattern}"`
        };
      }
    }

    // Strip HTML/XSS tags and trim
    const sanitized = rawInput.replace(/<[^>]*>?/gm, '').trim();
    return { cleanInput: sanitized, isBlocked: false };
  }

  /**
   * Mask sensitive PII (credit cards, phone numbers) from logs and outputs
   */
  static maskPII(text: string): string {
    if (!text) return '';
    // Mask 16-digit credit cards: 1234-5678-9012-3456 -> •••• •••• •••• 3456
    let masked = text.replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?(\d{4})\b/g, '•••• •••• •••• $1');
    // Mask 10-digit Indian phone numbers: +91 98450 12345 -> +91 98••• ••345
    masked = masked.replace(/(\+91[\s-]?)?(\d{2})\d{6}(\d{2})/g, '$1$2••••••$3');
    return masked;
  }

  /**
   * Enforces Idempotency to prevent duplicate orders from race conditions or double-taps
   */
  static checkAndLockIdempotency(key: string): boolean {
    if (this.idempotencySet.has(key)) {
      return false; // Already locked / duplicate request
    }
    this.idempotencySet.add(key);
    setTimeout(() => {
      this.idempotencySet.delete(key);
    }, 10000); // 10 second debounce window
    return true;
  }

  /**
   * Traffic & Rate Limiter: prevents runaway IoT streaming loops or API spam
   */
  static checkRateLimit(): boolean {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(t => now - t < this.RATE_LIMIT_WINDOW_MS);
    if (this.requestTimestamps.length >= this.RATE_LIMIT_MAX) {
      return false; // Rate limit exceeded (429)
    }
    this.requestTimestamps.push(now);
    return true;
  }

  /**
   * Clear state (useful for tests)
   */
  static reset() {
    this.idempotencySet.clear();
    this.requestTimestamps = [];
  }
}
