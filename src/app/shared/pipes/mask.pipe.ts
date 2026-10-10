import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'mask', standalone: true, pure: true })
export class MaskPipe implements PipeTransform {
  transform(value: string | null | undefined, reveal = false, visibleChars = 4): string {
    if (!value) return '—';
    if (reveal) return value;
    const str = String(value);
    if (str.length <= visibleChars) return '●'.repeat(str.length);
    return '●'.repeat(str.length - visibleChars) + str.slice(-visibleChars);
  }
}
