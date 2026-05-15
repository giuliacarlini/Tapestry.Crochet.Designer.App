export function cx(...args: (string | false | undefined | null)[]): string {
  return args.filter(Boolean).join(' ')
}
