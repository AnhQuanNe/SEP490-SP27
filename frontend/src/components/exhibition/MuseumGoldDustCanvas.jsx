import { useEffect, useRef } from 'react';

/**
 * MuseumGoldDustCanvas - Canvas vẽ các hạt bụi vàng phát sáng lơ lửng
 * tạo không khí cổ kính, trang nghiêm như trong phòng trưng bày bảo tàng quốc tế.
 */
const MuseumGoldDustCanvas = ({ isActive = true }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!isActive) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animId;

        const handleResize = () => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        // Tạo danh sách 38 hạt bụi vàng ngẫu nhiên
        const particleCount = 38;
        const particles = Array.from({ length: particleCount }).map(() => ({
            x: Math.random() * (canvas.width || 600),
            y: Math.random() * (canvas.height || 500),
            radius: Math.random() * 1.8 + 0.6,
            baseAlpha: Math.random() * 0.5 + 0.2,
            speedY: Math.random() * 0.25 + 0.08,
            speedX: (Math.random() - 0.5) * 0.2,
            pulseSpeed: Math.random() * 0.02 + 0.01,
            pulseOffset: Math.random() * Math.PI * 2,
        }));

        let frame = 0;
        const render = () => {
            frame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                // Di chuyển hạt bụi bay nhẹ lên trên
                p.y -= p.speedY;
                p.x += Math.sin(frame * 0.01 + p.pulseOffset) * 0.2 + p.speedX;

                // Tái sinh hạt bụi khi bay ra khỏi màn hình
                if (p.y < -10) {
                    p.y = canvas.height + 10;
                    p.x = Math.random() * canvas.width;
                }
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;

                // Hiệu ứng nhấp nháy ánh kim (twinkle)
                const currentAlpha = p.baseAlpha + Math.sin(frame * p.pulseSpeed + p.pulseOffset) * 0.2;
                const safeAlpha = Math.max(0.05, Math.min(0.85, currentAlpha));

                // Vẽ hạt bụi sáng
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(245, 197, 66, ${safeAlpha})`;
                ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
                ctx.shadowBlur = 8;
                ctx.fill();
            });

            animId = requestAnimationFrame(render);
        };

        animId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', handleResize);
        };
    }, [isActive]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-15 w-full h-full"
            style={{ opacity: 0.85 }}
        />
    );
};

export default MuseumGoldDustCanvas;
