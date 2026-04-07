'use client';

import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import gsap from 'gsap';
import styles from './BIQStorySwap.module.css';

type SwapCardProps = React.HTMLAttributes<HTMLDivElement> & {
  customClass?: string;
};

type CardSwapProps = {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number | null;
  pauseOnHover?: boolean;
  onCardClick?: (index: number) => void;
  onActiveIndexChange?: (index: number) => void;
  skewAmount?: number;
  easing?: 'elastic' | 'smooth';
  children: React.ReactNode;
};

const layerCards = [
  {
    step: '01',
    title: 'Data Foundation',
    label: 'Raw inputs, made usable',
    body:
      'BIQ starts by organizing NBA player data into a cleaner structure so comparisons are more stable, readable, and actually useful.',
    bullets: [
      'Normalizes scattered stats into one analytical base',
      'Supports dashboards, rankings, and comparison views',
      'Creates cleaner inputs for the BIQ model',
    ],
    tone: 'neutral',
    detailTitle: 'What this layer is doing',
    detailIntro:
      'Before the BIQ score can mean anything, the data has to be shaped into something consistent and comparable. NBA stats live across many categories, and players operate in very different roles, tempos, and usage environments. This layer is about building a foundation that the rest of the product can trust.',
    detailPoints: [
      {
        title: 'It reduces noise before scoring starts',
        text:
          'Not every raw stat deserves equal weight on its own. This layer helps organize production into a more stable structure so the later BIQ model is not reacting to messy, isolated, or misleading values.',
      },
      {
        title: 'It creates a common frame for comparison',
        text:
          'A high-usage initiator, a secondary creator, and an efficient finisher should not be read exactly the same way. The data layer helps group and present player information so comparison is fairer and more interpretable.',
      },
      {
        title: 'It supports the entire product, not just the score',
        text:
          'This same structure powers rankings, player pages, and comparison tools. That matters because BIQ is meant to be more than a number — it is a system for exploring why value shows up the way it does.',
      },
    ],
    takeaway:
      'This layer turns raw NBA information into something structured enough to support real evaluation instead of stat grazing.',
  },
  {
    step: '02',
    title: 'BIQ Model',
    label: 'Custom scoring logic',
    body:
      'The core score combines burden, creation, efficiency, and impact into one framework meant to reflect usefulness more clearly than raw totals.',
    bullets: [
      'Balances volume with efficiency',
      'Rewards creation and offensive pressure',
      'Keeps the final score interpretable',
    ],
    tone: 'gold',
    detailTitle: 'Why the model exists',
    detailIntro:
      'Traditional stat reading often over-rewards raw totals or under-explains difficult offensive responsibility. The BIQ model was built to better capture how much meaningful work a player is doing and how well that work translates into useful offense.',
    detailPoints: [
      {
        title: 'It values burden, not just output',
        text:
          'Some players create offense in easy contexts, while others carry possessions, bend defensive shape, and absorb far more pressure. BIQ tries to recognize that difficult offensive labor instead of flattening everyone into the same scoring column.',
      },
      {
        title: 'It keeps efficiency tied to responsibility',
        text:
          'Efficiency matters, but it should not be read in a vacuum. A player maintaining strong efficiency under heavy usage and creation demands is doing something very different from someone finishing lower-difficulty possessions.',
      },
      {
        title: 'It stays multi-dimensional on purpose',
        text:
          'BIQ outputs one headline score, but that score is built from several ideas working together. The model is designed so users can move from the summary number into the underlying signals instead of treating the rank as a black box.',
      },
    ],
    takeaway:
      'The BIQ model is trying to measure useful offensive responsibility, not just box score accumulation.',
  },
  {
    step: '03',
    title: 'Insight Layer',
    label: 'Rankings with reasoning',
    body:
      'The goal is not just to output a number, but to explain why a player lands where they do through supporting metrics and context.',
    bullets: [
      'Shows the signals behind the BIQ score',
      'Makes comparisons easier to understand',
      'Turns ranking into explanation',
    ],
    tone: 'teal',
    detailTitle: 'Why interpretation matters',
    detailIntro:
      'A score alone is not enough. The insight layer exists so BIQ can explain itself. Instead of presenting rankings as an answer that users are expected to accept blindly, this layer frames the ranking as the start of an investigation.',
    detailPoints: [
      {
        title: 'It makes the model inspectable',
        text:
          'Users should be able to see which qualities are pulling a player upward and which are holding them back. That creates a much stronger analytical experience than simply placing someone on a leaderboard.',
      },
      {
        title: 'It supports real comparison',
        text:
          'Comparing two players is more interesting when you can identify where they differ in burden, creation, efficiency, or impact. The insight layer gives the score enough context to make those differences meaningful.',
      },
      {
        title: 'It builds trust through explanation',
        text:
          'If BIQ is meant to feel thoughtful, then the product needs to show its reasoning. This layer is where the system becomes more persuasive because it is no longer just asserting value — it is showing the path to that value.',
      },
    ],
    takeaway:
      'This layer transforms BIQ from a rank list into an explainable evaluation tool.',
  },
  {
    step: '04',
    title: 'Experience Design',
    label: 'Analytics UX that stays readable',
    body:
      'The interface is designed to feel sharp and analytical without becoming dense, cluttered, or spreadsheet-heavy.',
    bullets: [
      'Editorial hierarchy over dashboard overload',
      'Readable structure and visual grouping',
      'Product thinking applied to sports analytics',
    ],
    tone: 'gold',
    detailTitle: 'How the interface supports the model',
    detailIntro:
      'A major part of BIQ is presentation. Sports analytics tools can become visually dense very quickly, especially when they try to show too many metrics with too little hierarchy. This layer is about making the system legible without making it feel shallow.',
    detailPoints: [
      {
        title: 'It emphasizes hierarchy first',
        text:
          'The most important ideas need to surface immediately: who the player is, how strong the BIQ score is, and what signals are driving it. Secondary detail can still exist, but it should not compete with the main read.',
      },
      {
        title: 'It aims for an editorial feel',
        text:
          'Rather than leaning fully into spreadsheet aesthetics, BIQ uses stronger sections, contrast, spacing, and framing so the interface feels like guided analysis. That makes the product more approachable without diluting the seriousness of the data.',
      },
      {
        title: 'It treats readability as a feature',
        text:
          'Clear grouping, restrained motion, and strong visual rhythm are not decoration here. They are part of how the product helps users move from headline judgment into deeper explanation without losing the thread.',
      },
    ],
    takeaway:
      'The interface is built to make analytics feel readable, structured, and persuasive.',
  },
  {
    step: '05',
    title: 'Outcome',
    label: 'Sharper reads on player value',
    body:
      'BIQ becomes more than a stat page: it is a system for reading player value through burden, impact, and offensive usefulness.',
    bullets: [
      'Better bridge between numbers and interpretation',
      'More thoughtful player evaluation flow',
      'Model and interface reinforce each other',
    ],
    tone: 'neutral',
    detailTitle: 'What the finished product delivers',
    detailIntro:
      'When the layers work together, BIQ becomes a clearer way to think about player usefulness. The final product is not just a dashboard or a ranking table. It is a structured reading experience built around a point of view on offensive value.',
    detailPoints: [
      {
        title: 'It gives users a more layered evaluation flow',
        text:
          'Users can start with a headline score, move into supporting signals, compare players, and understand where value is coming from. That journey is much stronger than a flat list of totals.',
      },
      {
        title: 'It aligns product design with analytics thinking',
        text:
          'The score, the explanation layer, and the interface are all trying to do the same thing: make player value easier to inspect. That coherence is one of the most important outcomes of the project.',
      },
      {
        title: 'It expresses a basketball point of view',
        text:
          'BIQ reflects a belief that hard offensive responsibility, efficient creation, and real impact deserve a more thoughtful read than raw box score habits usually provide. The product exists to make that read visible.',
      },
    ],
    takeaway:
      'BIQ is strongest when the model and the interface work together to explain player value instead of merely listing it.',
  },
] as const;

export const Card = forwardRef<HTMLDivElement, SwapCardProps>(
  ({ customClass, ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      className={`${styles.swapCard} ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
    />
  )
);
Card.displayName = 'Card';

const makeSlot = (i: number, distX: number, distY: number, total: number) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
});

const placeNow = (
  el: HTMLDivElement,
  slot: { x: number; y: number; z: number; zIndex: number },
  skew: number
) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true,
  });

function CardSwap({
  width = '100%',
  height = 760,
  cardDistance = 82,
  verticalDistance = 84,
     delay = null,

  pauseOnHover = true,
  onCardClick,
  onActiveIndexChange,
  skewAmount = 4,
  easing = 'elastic',
  children,
}: CardSwapProps) {
  const config =
    easing === 'elastic'
      ? {
          ease: 'elastic.out(0.62,0.9)',
          durDrop: 1.55,
          durMove: 1.3,
          durReturn: 1.2,
          promoteOverlap: 0.78,
          returnDelay: 0.05,
        }
      : {
          ease: 'power2.inOut',
          durDrop: 0.7,
          durMove: 0.7,
          durReturn: 0.7,
          promoteOverlap: 0.4,
          returnDelay: 0.12,
        };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArr.map(() => React.createRef<HTMLDivElement>()),
    [childArr.length]
  );

  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<number | null>(null);
  const container = useRef<HTMLDivElement | null>(null);
  const isAnimatingRef = useRef(false);

  const clearAuto = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const syncActive = useCallback(() => {
    onActiveIndexChange?.(order.current[0] ?? 0);
  }, [onActiveIndexChange]);

  const runSwap = useCallback(
    (direction: 'next' | 'prev') => {
      if (isAnimatingRef.current || order.current.length < 2) return;

      isAnimatingRef.current = true;

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimatingRef.current = false;
          syncActive();
        },
      });

      tlRef.current = tl;

      if (direction === 'next') {
        const [front, ...rest] = order.current;
        const elFront = refs[front].current;
        if (!elFront) {
          isAnimatingRef.current = false;
          return;
        }

        tl.to(elFront, {
          y: '+=560',
          rotationZ: -4,
          duration: config.durDrop,
          ease: config.ease,
        });

        tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);

        rest.forEach((idx, i) => {
          const el = refs[idx].current;
          if (!el) return;

          const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
          tl.set(el, { zIndex: slot.zIndex }, 'promote');
          tl.to(
            el,
            {
              x: slot.x,
              y: slot.y,
              z: slot.z,
              rotationZ: 0,
              duration: config.durMove,
              ease: config.ease,
            },
            `promote+=${i * 0.08}`
          );
        });

        const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);

        tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
        tl.call(() => {
          gsap.set(elFront, { zIndex: backSlot.zIndex });
        });

        tl.to(
          elFront,
          {
            x: backSlot.x,
            y: backSlot.y,
            z: backSlot.z,
            rotationZ: 0,
            duration: config.durReturn,
            ease: config.ease,
          },
          'return'
        );

        tl.call(() => {
          order.current = [...rest, front];
        });
      } else {
        const prevOrder = [...order.current];
        const back = prevOrder[prevOrder.length - 1];
        const remaining = prevOrder.slice(0, -1);
        const elBack = refs[back].current;

        if (!elBack) {
          isAnimatingRef.current = false;
          return;
        }

        const frontSlot = makeSlot(0, cardDistance, verticalDistance, refs.length);
        const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);

        tl.set(elBack, {
          zIndex: refs.length + 2,
          x: backSlot.x,
          y: backSlot.y - 36,
          z: backSlot.z,
          rotationZ: 2,
        });

        remaining.forEach((idx, i) => {
          const el = refs[idx].current;
          if (!el) return;

          const slot = makeSlot(i + 1, cardDistance, verticalDistance, refs.length);
          tl.to(
            el,
            {
              x: slot.x,
              y: slot.y,
              z: slot.z,
              duration: config.durMove,
              ease: config.ease,
            },
            0
          );
        });

        tl.to(
          elBack,
          {
            x: frontSlot.x,
            y: frontSlot.y,
            z: frontSlot.z,
            rotationZ: 0,
            duration: config.durReturn,
            ease: config.ease,
          },
          0.08
        );

        tl.call(() => {
          order.current = [back, ...remaining];
          refs.forEach((_, i) => {
            const idx = order.current[i];
            const node = refs[idx].current;
            if (!node) return;
            gsap.set(node, { zIndex: refs.length - i });
          });
        });
      }
    },
    [cardDistance, verticalDistance, refs, config, syncActive]
  );

 const startAuto = useCallback(() => {
  clearAuto();
  if (!delay) return;

  intervalRef.current = window.setInterval(() => {
    runSwap('next');
  }, delay);
}, [clearAuto, delay, runSwap]);

  useEffect(() => {
    const total = refs.length;
    refs.forEach((r, i) => {
      if (r.current) {
        placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
      }
    });
    syncActive();
    startAuto();

    if (pauseOnHover && container.current) {
      const node = container.current;

      const pause = () => {
        tlRef.current?.pause();
        clearAuto();
      };

      const resume = () => {
        tlRef.current?.play();
        startAuto();
      };

      node.addEventListener('mouseenter', pause);
      node.addEventListener('mouseleave', resume);

      return () => {
        node.removeEventListener('mouseenter', pause);
        node.removeEventListener('mouseleave', resume);
        clearAuto();
      };
    }

    return () => {
      clearAuto();
    };
  }, [
    cardDistance,
    verticalDistance,
    skewAmount,
    pauseOnHover,
    refs,
    clearAuto,
    startAuto,
    syncActive,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();

      if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        clearAuto();
        runSwap('prev');
        startAuto();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        clearAuto();
        runSwap('next');
        startAuto();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearAuto, runSwap, startAuto]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child as React.ReactElement<any>, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: (e: React.MouseEvent<HTMLDivElement>) => {
            child.props.onClick?.(e);
            onCardClick?.(i);
          },
        })
      : child
  );

  return (
    <div className={styles.swapShell}>
      <div ref={container} className={styles.swapContainer} style={{ width, height }}>
        {rendered}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.controlBtn}
          aria-label="Show previous card"
          onClick={() => {
            clearAuto();
            runSwap('prev');
            startAuto();
          }}
        >
          <span aria-hidden="true">←</span>
        </button>

        <button
          type="button"
          className={styles.controlBtn}
          aria-label="Show next card"
          onClick={() => {
            clearAuto();
            runSwap('next');
            startAuto();
          }}
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

export function BIQStorySwap() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCard = layerCards[activeIndex];

  return (
    <section className={styles.storyFull}>
      <div className={styles.storyCopy}>
        <p className="eyebrow" style={{ marginBottom: '1rem' }}>
          Interactive Model Walkthrough
        </p>

        <h2
          className="display"
          style={{
            fontSize: 'clamp(3.4rem, 7vw, 6.8rem)',
            lineHeight: 0.9,
            color: 'var(--text)',
            marginBottom: '1rem',
            maxWidth: '8ch',
          }}
        >
          THE BIQ
          <br />
          STACK IN
          <br />
          MOTION.
        </h2>

        <p
          className="serif-italic"
          style={{
            fontSize: '1rem',
            lineHeight: 1.9,
            color: 'var(--text-2)',
            maxWidth: 520,
            marginBottom: '1.5rem',
          }}
        >
          Each card represents one layer of BIQ, from the data foundation to the scoring
          model, interpretation, and final experience.
        </p>

        <div className={styles.copyNote}>
          <div className="leader-rank" style={{ marginBottom: '0.45rem' }}>
            Manual Control
          </div>
          <p>
            Use the on-screen arrows or your keyboard left and right arrow keys to move
            through the stack.
          </p>
        </div>
      </div>

      <div className={styles.stageWrap}>
        <CardSwap
          width="100%"
          height={820}
          cardDistance={86}
          verticalDistance={88}
          pauseOnHover={true}
          skewAmount={4}
          easing="elastic"
          onActiveIndexChange={setActiveIndex}
        >
          {layerCards.map((layer) => (
            <Card key={layer.step} customClass={styles[`tone${capitalize(layer.tone)}`]}>
              <div className={styles.cardInner}>
                <div className={styles.cardTopline}>
                  <span className="leader-rank" style={{ marginBottom: 0 }}>
                    Layer {layer.step}
                  </span>

                  <span
                    className={`badge ${
                      layer.tone === 'gold'
                        ? 'badge-gold'
                        : layer.tone === 'teal'
                        ? 'badge-teal'
                        : 'badge-neutral'
                    }`}
                  >
                    {layer.label}
                  </span>
                </div>

                <div className={styles.cardMain}>
                  <h3 className={`display ${styles.cardTitle}`}>{layer.title}</h3>
                  <p className={`serif-italic ${styles.cardBody}`}>{layer.body}</p>

                  <div className={styles.cardList}>
                    {layer.bullets.map((item, index) => (
                      <div key={item} className={styles.cardListRow}>
                        <span className={`display ${styles.cardListNum}`}>0{index + 1}</span>
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </CardSwap>

        <section className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <div>
              <div className="leader-rank" style={{ marginBottom: '0.4rem' }}>
                Active Layer {activeCard.step}
              </div>
              <h3 className={`display ${styles.detailTitle}`}>{activeCard.title}</h3>
            </div>

            <span
              className={`badge ${
                activeCard.tone === 'gold'
                  ? 'badge-gold'
                  : activeCard.tone === 'teal'
                  ? 'badge-teal'
                  : 'badge-neutral'
              }`}
            >
              {activeCard.label}
            </span>
          </div>

          <div className={styles.detailBody}>
            <div className={styles.detailIntroBlock}>
              <div className="leader-rank" style={{ marginBottom: '0.5rem', color: 'var(--gold)' }}>
                {activeCard.detailTitle}
              </div>
              <p className={styles.detailIntro}>{activeCard.detailIntro}</p>
            </div>

            <div className={styles.detailGrid}>
              {activeCard.detailPoints.map((point, index) => (
                <article key={point.title} className={styles.detailCard}>
                  <div className={styles.detailCardTop}>
                    <span className={`display ${styles.detailNum}`}>0{index + 1}</span>
                    <h4 className={styles.detailCardTitle}>{point.title}</h4>
                  </div>
                  <p className={styles.detailCardText}>{point.text}</p>
                </article>
              ))}
            </div>

            <div className={styles.takeaway}>
              <div className="leader-rank" style={{ marginBottom: '0.45rem' }}>
                Key Takeaway
              </div>
              <p>{activeCard.takeaway}</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}