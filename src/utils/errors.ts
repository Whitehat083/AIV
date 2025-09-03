// A custom error to be thrown when a user exceeds their AI usage limit.
export class UsageLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UsageLimitError';
  }
}
