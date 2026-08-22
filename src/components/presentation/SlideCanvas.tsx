'use client';

/* eslint-disable react/require-default-props */

import React from 'react';
import { cn } from '@utils/cn';
import {
  PRESENTATION_THEME_TOKENS,
  type PresentationSlide,
  type PresentationTheme,
  type PresentationThemeTokens,
} from './types';
import styles from './PresentationCanvas.module.css';

type PresentationStyle = React.CSSProperties & Record<`--${string}`, string>;

interface SlideCanvasProps {
  slide: PresentationSlide;
  theme: PresentationTheme;
  index: number;
  total: number;
  showNotes?: boolean;
  thumbnail?: boolean;
  className?: string;
}

const splitColumns = (items: string[]) => {
  const midpoint = Math.ceil(items.length / 2);
  return [items.slice(0, midpoint), items.slice(midpoint)];
};

const parseStat = (item: string) => {
  const [value, label, detail] = item.split('—').map((part) => part.trim());
  return { value: value || '00', label: label || '핵심 지표', detail: detail || '설명 또는 출처' };
};

const parseRow = (item: string) => {
  const columns = item.split('—').map((part) => part.trim());
  return [columns[0] || '항목', columns[1] || '구분', columns[2] || '설명'];
};

const parseBarValue = (item: string, index: number) => {
  const match = item.match(/(-?\d+(?:\.\d+)?)\s*%?\s*$/);
  const numeric = match ? Number(match[1]) : 36 + index * 14;
  return Math.min(100, Math.max(8, numeric));
};

const getTokens = (theme: PresentationTheme): PresentationThemeTokens =>
  PRESENTATION_THEME_TOKENS[theme.accent];

function SlideItems({ items }: { items: string[] }) {
  return (
    <ul className={styles.itemList}>
      {items.map((item, index) => (
        <li key={item} className={styles.item}>
          <span className={styles.itemIndex}>{String(index + 1).padStart(2, '0')}</span>
          <span className={styles.itemText}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SlideCanvas({
  slide,
  theme,
  index,
  total,
  showNotes = false,
  thumbnail = false,
  className,
}: SlideCanvasProps) {
  const tokens = getTokens(theme);
  const style: PresentationStyle = {
    '--ppt-point-1': tokens.point1,
    '--ppt-point-2': tokens.point2,
    '--ppt-point-3': tokens.point3,
    '--ppt-point-4': tokens.point4,
    '--ppt-canvas': tokens.canvas,
    '--ppt-surface': tokens.surface,
    '--ppt-fg-1': tokens.fg1,
    '--ppt-fg-3': tokens.fg3,
    '--ppt-fg-5': tokens.fg5,
  };
  const items = slide.items.length > 0 ? slide.items : ['내용을 입력하세요'];
  const columns = splitColumns(items);

  const renderBody = () => {
    switch (slide.layout) {
      case 'quote':
      case 'faq':
        return (
          <blockquote className={styles.quote}>
            <span className={styles.quoteMark}>“</span>
            {slide.body || items[0]}
            <cite className={styles.attribution}>{items[1] || '출처 또는 보조 설명'}</cite>
          </blockquote>
        );
      case 'stat':
      case 'heroStat':
        return (
          <div className={styles.statGrid}>
            {items.slice(0, 3).map((item) => {
              const stat = parseStat(item);
              return (
                <div key={item} className={styles.stat}>
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                  <div className={styles.statDetail}>{stat.detail}</div>
                </div>
              );
            })}
          </div>
        );
      case 'columns':
      case 'split':
      case 'perspective':
        return (
          <div className={styles.columns}>
            {columns.map((column, columnIndex) => (
              <div key={column.join('|')} className={styles.column}>
                <div className={styles.columnTitle}>
                  {columnIndex === 0 ? '관점 ① · 배경' : '관점 ② · 판단'}
                </div>
                <SlideItems items={column} />
              </div>
            ))}
          </div>
        );
      case 'table':
      case 'matrix':
      case 'risk':
        return (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>항목</th>
                  <th>구분</th>
                  <th>설명</th>
                </tr>
              </thead>
              <tbody>
                {items.slice(0, 5).map((item) => {
                  const row = parseRow(item);
                  return (
                    <tr key={item}>
                      {row.map((cell) => (
                        <td key={`${cell}-${row.join('|')}`}>{cell}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      case 'chart':
        return (
          <div className={styles.chart} role="img" aria-label={slide.title}>
            {items.slice(0, 6).map((item, itemIndex) => {
              const [label] = item.split('—').map((part) => part.trim());
              const value = parseBarValue(item, itemIndex);
              return (
                <div key={item} className={styles.barRow}>
                  <span>{label}</span>
                  <span className={styles.barTrack}>
                    <span className={styles.bar} style={{ width: `${value}%` }} />
                  </span>
                  <strong>{Math.round(value)}</strong>
                </div>
              );
            })}
          </div>
        );
      case 'media':
        if (slide.imageUrl) {
          return (
            <figure className={styles.mediaFigure}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 슬라이드 캔버스는 외부 스토리지 URL을 그대로 투사한다 */}
              <img src={slide.imageUrl} alt={slide.title} className={styles.mediaImage} />
            </figure>
          );
        }
        return <div className={styles.media}>이미지·스크린샷·영상 placeholder</div>;
      case 'cards':
      case 'glossary':
      case 'journey':
      case 'swot':
        return (
          <div className={styles.cardGrid}>
            {items.slice(0, 6).map((item, itemIndex) => {
              const [cardTitle, cardBody] = item.split('—').map((part) => part.trim());
              return (
                <div key={item} className={styles.card}>
                  <div className={styles.cardTitle}>{cardTitle || `항목 ${itemIndex + 1}`}</div>
                  <div className={styles.cardBody}>{cardBody || slide.body}</div>
                </div>
              );
            })}
          </div>
        );
      default:
        return (
          <>
            {slide.body ? <p className={styles.body}>{slide.body}</p> : null}
            <SlideItems items={items.slice(0, 7)} />
          </>
        );
    }
  };

  if (slide.layout === 'cover') {
    return (
      <div className={cn(styles.frame, thumbnail && styles.thumbnail, className)} style={style}>
        <section className={cn(styles.slide, styles.cover)} data-layout={slide.layout}>
          <div className={styles.coverBody}>
            <div className={styles.coverKicker}>{slide.eyebrow}</div>
            <h1 className={styles.coverTitle}>{slide.title}</h1>
            <div className={styles.coverSubtitle}>{slide.subtitle}</div>
          </div>
          <div className={styles.coverMeta}>
            <div className={styles.metaRow}>
              <div>
                <div className={styles.metaLabel}>Speaker</div>
                <div className={styles.metaValue}>이름을 입력하세요</div>
              </div>
              <div>
                <div className={styles.metaLabel}>Context</div>
                <div className={styles.metaValue}>발표 목적 또는 소속</div>
              </div>
            </div>
            <div className={styles.badge}>
              <span>OKDOHYUK.DEV</span>
              <span>WEB PRESENTATION</span>
            </div>
          </div>
          {showNotes && slide.speakerNotes ? (
            <div className={styles.notes}>{slide.speakerNotes}</div>
          ) : null}
        </section>
      </div>
    );
  }

  return (
    <div className={cn(styles.frame, thumbnail && styles.thumbnail, className)} style={style}>
      <section className={styles.slide} data-layout={slide.layout}>
        <div className={styles.head}>
          <div className={styles.eyebrow}>{slide.eyebrow}</div>
          <div className={styles.counter}>
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </div>
        </div>
        <h1 className={styles.title}>{slide.title}</h1>
        {slide.subtitle ? <p className={styles.subtitle}>{slide.subtitle}</p> : null}
        <div className={styles.content}>{renderBody()}</div>
        <div className={styles.footer}>
          <span className={styles.brand}>
            <span className={styles.chip} /> okdohyuk.dev · Web Presentation
          </span>
          <span>{slide.variant}</span>
        </div>
        {showNotes && slide.speakerNotes ? (
          <div className={styles.notes}>{slide.speakerNotes}</div>
        ) : null}
      </section>
    </div>
  );
}

export default SlideCanvas;
