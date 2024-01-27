import { format, formatDistance } from 'date-fns';
import { ko } from 'date-fns/locale';

export default class DateUtils {
  static foramtDate(date: string) {
    const d = new Date(date);
    const now = Date.now();
    const diff = (now - d.getTime()) / 1000;

    if (diff < 60 * 60 * 24 * 30 * 3) {
      return formatDistance(d, now, { addSuffix: true, locale: ko });
    }

    return format(d, 'PPP', { locale: ko }); // 날짜 포맷
  }
}
