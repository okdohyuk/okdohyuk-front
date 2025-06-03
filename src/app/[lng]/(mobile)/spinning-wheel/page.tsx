'use client';

import React, { useState, useRef, useEffect } from 'react';

const parseNames = (names: string) => {
  const parsedNames: { name: string; count: number }[] = [];

  names.split(',').forEach((entry) => {
    const [name, multiplier] = entry.split('*').map((part) => part.trim());
    const count = multiplier ? parseInt(multiplier, 10) : 1;

    parsedNames.push({ name, count });
  });

  return parsedNames;
};

export default function SpinningWheelPage() {
  const [names, setNames] = useState('영수, 일남*2, 한지, 홀로');
  const [rotation, setRotation] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startAngleRef = useRef(0);
  const currentAngleRef = useRef(0);
  const angleHistoryRef = useRef<{ angle: number; timestamp: number }[]>([]);
  const maxHistoryDuration = 3000;

  const namesArray = parseNames(names);

  const totalSegments = namesArray.reduce((sum, item) => sum + item.count, 0);

  const drawWheel = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const radius = canvas.width / 2;
    const arcSize = (2 * Math.PI) / totalSegments;
    let segmentStartAngle = rotation * (Math.PI / 180);
    // console.log('=>(loginHandler.tsx:42) segmentStartAngle', segmentStartAngle);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    namesArray.forEach(({ name, count }, index) => {
      // Determine color for this name
      const hue = (index / namesArray.length) * 360;

      Array.from({ length: count }).forEach(() => {
        const startAngle = segmentStartAngle;
        const endAngle = startAngle + arcSize;

        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, startAngle, endAngle);
        ctx.fillStyle = `hsl(${hue}, 70%, 70%)`; // Use the same color for repeated names
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.translate(
          radius + Math.cos((startAngle + endAngle) / 2) * (radius * 0.6),
          radius + Math.sin((startAngle + endAngle) / 2) * (radius * 0.6),
        );
        ctx.rotate((startAngle + endAngle) / 2 + Math.PI / 2);
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.font = '16px Arial';
        ctx.fillText(name, 0, 0);
        ctx.restore();

        segmentStartAngle = endAngle;
      });
    });
  };

  const getAngle = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = x - rect.left - cx;
      const dy = y - rect.top - cy;
      return Math.atan2(dy, dx) * (180 / Math.PI);
    }
    return 0;
  };

  const startDrag = (x: number, y: number) => {
    console.log('=>(loginHandler.tsx:91) 시작 ');
    setDragging(true);
    startAngleRef.current = getAngle(x, y) - currentAngleRef.current;
    angleHistoryRef.current = [];
    setWinner(null);
  };

  const whileDrag = (x: number, y: number) => {
    if (dragging) {
      const newAngle = getAngle(x, y);
      console.log('=>(loginHandler.tsx:102) newAngle', newAngle);
      currentAngleRef.current = newAngle - startAngleRef.current;
      setRotation(currentAngleRef.current);

      angleHistoryRef.current.push({ angle: currentAngleRef.current, timestamp: Date.now() });
      const cutoff = Date.now() - maxHistoryDuration;
      angleHistoryRef.current = angleHistoryRef.current.filter(
        (entry) => entry.timestamp >= cutoff,
      );
    }
  };

  const calculateAcceleration = () => {
    const history = angleHistoryRef.current;
    if (history.length >= 2) {
      const start = history[0];
      const end = history[history.length - 1];
      const timeDelta = (end.timestamp - start.timestamp) / 1000;
      const angleDelta = end.angle - start.angle;

      return angleDelta / timeDelta;
    }
    return 0;
  };

  const endDrag = () => {
    if (!dragging) return;
    console.log('=>(loginHandler.tsx:126) 끝 ');
    setDragging(false);
    setVelocity(calculateAcceleration());
  };

  const determineWinner = () => {
    const numSegments = totalSegments;
    const degrees = (currentAngleRef.current * (180 / Math.PI) + 90) % 360;
    const arcSizeDegrees = 360 / numSegments;
    const index = Math.floor(degrees / arcSizeDegrees) % numSegments;

    let cumulativeCount = 0;
    for (const { name, count } of namesArray) {
      cumulativeCount += count;
      if (index < cumulativeCount) {
        setWinner(name);
        break;
      }
    }
  };

  const updateRotation = () => {
    if (Math.abs(velocity) > 0.01) {
      setRotation((prev) => (prev + velocity) % 360);
      setVelocity(velocity * 0.95);
    } else {
      if (!dragging && velocity !== 0) {
        determineWinner();
      }
      setVelocity(0);
    }
    currentAngleRef.current = rotation;
  };

  useEffect(() => {
    const interval = setInterval(updateRotation, 16);
    return () => clearInterval(interval);
  }, [velocity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawWheel(ctx);
      }
    }
  }, [rotation, namesArray]);

  useEffect(() => {
    // const handleMouseDown = (e: MouseEvent) => startDrag(e.clientX, e.clientY);
    const handleMouseMove = (e: MouseEvent) => whileDrag(e.clientX, e.clientY);
    const handleMouseUp = () => endDrag();

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      whileDrag(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => endDrag();

    // window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      // window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragging]);

  return (
    <>
      <h1 className="t-t-1 t-basic-1 mb-4">{'title'}</h1>
      <div className={'flex flex-col justify-center items-center content-center'}>
        <div className={'relative select-none'}>
          {/* Arrow Icon */}
          <div className="absolute left-1/2 transform -translate-x-1/2 rotate-180 z-10 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[20px] border-b-red-500" />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%) rotate(180deg)',
              zIndex: 1,
              width: '0',
              height: '0',
              borderLeft: '20px solid transparent',
              borderRight: '20px solid transparent',
              borderBottom: '20px solid red',
            }}
          />
          {/* Canvas for Wheel */}
          <canvas
            ref={canvasRef}
            onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
            width={500}
            height={500}
          />
        </div>

        <input
          className={'input-text my-10'}
          type="text"
          value={names}
          onChange={(e) => setNames(e.target.value)}
          placeholder="Enter names, separated by commas"
        />

        {winner && <div className="t-basic-0">당첨자: {winner}</div>}
      </div>
    </>
  );
}
