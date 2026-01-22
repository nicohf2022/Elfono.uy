import { useEffect, useRef, useState } from "react";
import "./TopBanner.css";

/**
 * props:
 * - messages: array de strings o { text, href } para linkear
 * - intervalMs: número en ms (default 5000)
 */
export const TopBanner = ({ 
  messages = [], 
  intervalMs = 5000 
}) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  // Regla clave: los hooks siempre arriba; nunca en condicionales.

  useEffect(() => {
    if (messages.length <= 1) return; // nada que rotar

    // Limpio cualquier intervalo previo (evita fugas de memoria)
    clearInterval(timerRef.current);

    if (!paused) {
      timerRef.current = setInterval(() => {
        setIndex((prev) => (prev + 1) % messages.length);
      }, intervalMs);
    }

    // Cleanup al desmontar o al cambiar dependencias
    return () => clearInterval(timerRef.current);
  }, [messages.length, intervalMs, paused]);

  // Soporte para mensajes con link opcional
  const current = messages[index];
  const text = typeof current === "string" ? current : current?.text;
  const href = typeof current === "string" ? null : current?.href;

  return (
    <div
      className="top-banner"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-live="polite"   // accesible: anuncia cambios sin interrumpir
    >
      <div className="top-banner__inner fade-in">
        {href ? (
          <a className="top-banner__link" href={href} target="_blank" rel="noreferrer">
            {text}
          </a>
        ) : (
          <span>{text}</span>
        )}
      </div>
    </div>
  );
};