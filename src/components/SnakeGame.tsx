import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Skull, Ghost, Zap } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 20; // Will be scaled by canvas
const INITIAL_SPEED = 90;
const SPEED_INCREMENT = 2;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export function SnakeGame({ onScoreChange }: { onScoreChange: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Ensure food doesn't spawn on snake
      const isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setFood(generateFood([{ x: 10, y: 10 }]));
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    onScoreChange(0);
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && !isGameOver) {
        setIsPaused(p => !p);
        return;
      }

      if (isPaused || isGameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction !== 'DOWN') setNextDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction !== 'UP') setNextDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction !== 'RIGHT') setNextDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction !== 'LEFT') setNextDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isPaused, isGameOver]);

  // Game Loop
  useEffect(() => {
    if (isPaused || isGameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { ...head };

        setDirection(nextDirection);

        switch (nextDirection) {
          case 'UP': newHead.y -= 1; break;
          case 'DOWN': newHead.y += 1; break;
          case 'LEFT': newHead.x -= 1; break;
          case 'RIGHT': newHead.x += 1; break;
        }

        // Check wall collision
        if (
          newHead.x < 0 || 
          newHead.x >= GRID_SIZE || 
          newHead.y < 0 || 
          newHead.y >= GRID_SIZE
        ) {
          setIsGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          onScoreChange(newScore);
          setFood(generateFood(newSnake));
          setSpeed(prev => Math.max(50, prev - SPEED_INCREMENT));
        } else {
          newSnake.pop(); // Remove tail if no food eaten
        }

        return newSnake;
      });
    };

    const gameLoop = setInterval(moveSnake, speed);
    return () => clearInterval(gameLoop);
  }, [nextDirection, food, isPaused, isGameOver, score, speed, onScoreChange, generateFood]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#050505'; // black
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(canvas.width, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw Food (Magenta)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FF00FF';
    ctx.fillStyle = '#FF00FF';
    ctx.fillRect(food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);

    // Draw Snake (Cyan)
    snake.forEach((segment, index) => {
      const opacity = Math.max(0.15, 1 - (index / snake.length));
      
      // Head is slightly brighter/different
      if (index === 0) {
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 20;
      } else {
        ctx.fillStyle = `rgba(0, 255, 255, ${opacity})`;
        ctx.shadowColor = `rgba(0, 255, 255, ${opacity})`;
        ctx.shadowBlur = 15 * opacity;
      }
      
      // Draw sharp rects for snake body
      const x = segment.x * CELL_SIZE + 1;
      const y = segment.y * CELL_SIZE + 1;
      const size = CELL_SIZE - 2;
      
      ctx.fillRect(x, y, size, size);
    });

    // Reset shadow for text
    ctx.shadowBlur = 0;

  }, [snake, food]);

  return (
    <div className="relative flex flex-col items-center w-full">
      <div className="relative p-1 bg-black border-glitch max-w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="bg-black max-w-full h-auto block"
        />
        
        {/* Overlays */}
        {isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
            <div className="flex items-center gap-4 mb-4">
              <Skull className="w-10 h-10 text-magenta drop-shadow-[0_0_15px_rgba(255,0,255,0.8)] animate-pulse" />
              <h2 className="text-4xl md:text-5xl font-display text-magenta-glow uppercase">FATAL_EXCEPTION</h2>
              <Skull className="w-10 h-10 text-magenta drop-shadow-[0_0_15px_rgba(255,0,255,0.8)] animate-pulse" />
            </div>
            <p className="text-cyan font-pixel text-[10px] mb-8 uppercase tracking-widest">DATA_LOST: {score}</p>
            <button 
              onClick={resetGame}
              className="px-6 py-3 bg-black border-2 border-magenta text-magenta font-pixel text-[10px] uppercase hover:bg-magenta hover:text-black transition-colors"
            >
              REBOOT_SYSTEM
            </button>
          </div>
        )}

        {isPaused && !isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <h2 className="text-4xl md:text-5xl font-display text-cyan-glow uppercase glitch-text" data-text="SYSTEM_HALTED">SYSTEM_HALTED</h2>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-magenta text-[10px] font-pixel uppercase flex gap-6 tracking-widest">
        <span>INPUT: W,A,S,D</span>
        <span>INTERRUPT: SPACE</span>
      </div>
    </div>
  );
}
