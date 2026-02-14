'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/basic/Table';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { SERVICE_PANEL, SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const GRADE_POINTS = {
  A_PLUS: 4.5,
  A_ZERO: 4.0,
  B_PLUS: 3.5,
  B_ZERO: 3.0,
  C_PLUS: 2.5,
  C_ZERO: 2.0,
  D_PLUS: 1.5,
  D_ZERO: 1.0,
  F: 0,
} as const;

type GradeKey = keyof typeof GRADE_POINTS;

type Course = {
  id: string;
  name: string;
  credits: string;
  grade: GradeKey | '';
};

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createEmptyCourse = (): Course => ({
  id: makeId(),
  name: '',
  credits: '',
  grade: '',
});

const createInitialCourses = () => [createEmptyCourse(), createEmptyCourse(), createEmptyCourse()];

type GpaCalculatorClientProps = {
  lng: Language;
};

export default function GpaCalculatorClient({ lng }: GpaCalculatorClientProps) {
  const { t } = useTranslation(lng, 'gpa-calculator');
  const [courses, setCourses] = useState<Course[]>(createInitialCourses);
  const [copyMessage, setCopyMessage] = useState('');

  const gradeOptions = useMemo(
    () => [
      { value: 'A_PLUS', label: t('grades.A_PLUS') },
      { value: 'A_ZERO', label: t('grades.A_ZERO') },
      { value: 'B_PLUS', label: t('grades.B_PLUS') },
      { value: 'B_ZERO', label: t('grades.B_ZERO') },
      { value: 'C_PLUS', label: t('grades.C_PLUS') },
      { value: 'C_ZERO', label: t('grades.C_ZERO') },
      { value: 'D_PLUS', label: t('grades.D_PLUS') },
      { value: 'D_ZERO', label: t('grades.D_ZERO') },
      { value: 'F', label: t('grades.F') },
    ],
    [t],
  );

  const updateCourse = (id: string, key: keyof Course, value: string) => {
    setCourses((prev) =>
      prev.map((course) => (course.id === id ? { ...course, [key]: value } : course)),
    );
  };

  const addCourse = () => {
    setCourses((prev) => [...prev, createEmptyCourse()]);
  };

  const removeCourse = (id: string) => {
    setCourses((prev) => prev.filter((course) => course.id !== id));
  };

  const resetCourses = () => {
    setCourses(createInitialCourses());
    setCopyMessage('');
  };

  const fillSample = () => {
    setCourses([
      { id: makeId(), name: t('sample.course1'), credits: '3', grade: 'A_PLUS' },
      { id: makeId(), name: t('sample.course2'), credits: '2', grade: 'B_ZERO' },
      { id: makeId(), name: t('sample.course3'), credits: '3', grade: 'A_ZERO' },
    ]);
  };

  const { totalCredits, totalPoints, gpa, validCourseCount, hasInvalidCredits } = useMemo(() => {
    let creditsSum = 0;
    let pointsSum = 0;
    let count = 0;
    let invalid = false;

    courses.forEach((course) => {
      if (course.credits.trim() === '') {
        return;
      }
      const credits = Number(course.credits);
      if (Number.isNaN(credits) || credits < 0) {
        invalid = true;
        return;
      }
      if (!course.grade) {
        return;
      }
      const gradePoint = GRADE_POINTS[course.grade];
      creditsSum += credits;
      pointsSum += credits * gradePoint;
      count += 1;
    });

    const calculatedGpa = creditsSum > 0 ? pointsSum / creditsSum : 0;

    return {
      totalCredits: creditsSum,
      totalPoints: pointsSum,
      gpa: calculatedGpa,
      validCourseCount: count,
      hasInvalidCredits: invalid,
    };
  }, [courses]);

  const copyResult = async () => {
    const message = t('summary.copyFormat', {
      gpa: gpa.toFixed(2),
      totalCredits: totalCredits.toFixed(1),
    });
    try {
      await navigator.clipboard.writeText(message);
      setCopyMessage(t('summary.copied'));
      setTimeout(() => setCopyMessage(''), 1600);
    } catch (error) {
      setCopyMessage(t('summary.copyFailed'));
      setTimeout(() => setCopyMessage(''), 1600);
    }
  };

  return (
    <div className="space-y-6">
      <section className={cn(SERVICE_PANEL, 'space-y-4 p-4 md:p-5')}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Text variant="d2" className="font-semibold" color="basic-1">
              {t('table.title')}
            </Text>
            <Text variant="d3" color="basic-5">
              {t('table.subtitle')}
            </Text>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="h-9 px-3 text-sm" type="button" onClick={fillSample}>
              {t('actions.fillSample')}
            </Button>
            <Button className="h-9 px-3 text-sm" type="button" onClick={resetCourses}>
              {t('actions.reset')}
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[38%]">{t('table.course')}</TableHead>
              <TableHead className="w-[18%]">{t('table.credits')}</TableHead>
              <TableHead className="w-[22%]">{t('table.grade')}</TableHead>
              <TableHead className="w-[18%]">{t('table.points')}</TableHead>
              <TableHead className="w-[4%]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => {
              const creditsValue = Number(course.credits);
              const gradePoint = course.grade ? GRADE_POINTS[course.grade] : null;
              const rowPoints =
                !Number.isNaN(creditsValue) && creditsValue > 0 && gradePoint !== null
                  ? (creditsValue * gradePoint).toFixed(2)
                  : '-';

              return (
                <TableRow key={course.id}>
                  <TableCell>
                    <Input
                      value={course.name}
                      onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                      placeholder={t('table.coursePlaceholder')}
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={course.credits}
                      onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                      placeholder={t('table.creditsPlaceholder')}
                      className="h-9 text-right"
                      inputMode="decimal"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={course.grade}
                      onValueChange={(value) => updateCourse(course.id, 'grade', value)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={t('table.gradePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Text variant="d3" color="basic-3">
                      {rowPoints}
                    </Text>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      className="text-xs font-semibold text-rose-500 transition-colors hover:text-rose-600"
                      onClick={() => removeCourse(course.id)}
                    >
                      {t('actions.remove')}
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between">
          <Button className="h-9 px-3 text-sm" type="button" onClick={addCourse}>
            {t('actions.addRow')}
          </Button>
          <Text variant="c1" color="basic-6">
            {t('table.note')}
          </Text>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4 md:p-5')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Text variant="d2" className="font-semibold" color="basic-1">
            {t('summary.title')}
          </Text>
          <Button className="h-9 px-3 text-sm" type="button" onClick={copyResult}>
            {t('actions.copy')}
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Text variant="d3" color="basic-5">
              {t('summary.gpa')}
            </Text>
            <Text variant="t3" color="basic-1">
              {gpa.toFixed(2)}
            </Text>
          </div>
          <div className="space-y-1">
            <Text variant="d3" color="basic-5">
              {t('summary.totalCredits')}
            </Text>
            <Text variant="t3" color="basic-1">
              {totalCredits.toFixed(1)}
            </Text>
          </div>
          <div className="space-y-1">
            <Text variant="d3" color="basic-5">
              {t('summary.totalPoints')}
            </Text>
            <Text variant="t3" color="basic-1">
              {totalPoints.toFixed(2)}
            </Text>
          </div>
          <div className="space-y-1">
            <Text variant="d3" color="basic-5">
              {t('summary.courseCount')}
            </Text>
            <Text variant="t3" color="basic-1">
              {validCourseCount}
            </Text>
          </div>
        </div>
        {hasInvalidCredits ? (
          <Text variant="d3" color="basic-5" className="text-rose-500">
            {t('summary.invalid')}
          </Text>
        ) : null}
        {copyMessage ? (
          <Text variant="d3" color="basic-5" className="text-emerald-600">
            {copyMessage}
          </Text>
        ) : null}
        <Text variant="d3" color="basic-5">
          {t('summary.scaleNote')}
        </Text>
      </section>
    </div>
  );
}
