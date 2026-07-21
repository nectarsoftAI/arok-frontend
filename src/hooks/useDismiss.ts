import { useRef, useEffect } from 'react';

/**
 * 팝오버/드롭다운 패널에 붙이는 ref 를 돌려준다.
 * 패널 바깥을 클릭하거나 Esc 를 누르면 onClose 가 호출된다.
 *
 * onClose 는 effect 의존성이라, 호출부에서 매 렌더 새로 만드는 인라인 함수를 넘기면
 * 리스너가 매번 재등록된다. 동작에는 문제없지만 잦은 리렌더가 있으면 useCallback 을 쓰는 편이 낫다.
 */
export function useDismiss<T extends HTMLElement = HTMLDivElement>(onClose: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return ref;
}
