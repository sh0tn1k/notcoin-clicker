import { ReactNode, useRef, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import cn from 'classnames'

import './Notcoin.css'

interface NotcoinProps {
  canIClickPlease: boolean
  sleep: boolean
  funMode: boolean
  clickValue: number
  cooldown: number
  handleClick(): void
  children?: ReactNode
}

interface NumberInfo {
  id: string
  value: number
  x: number
  y: number
}

const numberAnimationDurationMs = 1000
const numberAnimationDurationSec = numberAnimationDurationMs / 1000

const notCoinAppearence = {
  initial: {
    opacity: 0,
    scale: 0,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0,
  },
  transition: {
    duration: 0.3,
    ease: [0, 0.71, 0.2, 1.01],
    scale: {
      type: 'spring',
      damping: 10,
      stiffness: 100,
      restDelta: 0.001,
    },
  },
}

const cooldownAppearence = {
  initial: {
    opacity: 0,
    scale: 0.7,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.5,
  },
  transition: {
    duration: 0.7,
  },
}

export const Notcoin = ({
  canIClickPlease,
  sleep,
  funMode,
  clickValue,
  cooldown,
  handleClick,
  children
}: NotcoinProps): JSX.Element => {
  const notCoinRef = useRef<HTMLParagraphElement>(null)
  const [buttonTransform, setButtonTransform] = useState({
    scale: 1,
    translateZ: 0,
    rotateX: 0,
    rotateY: 0,
  })
  const [numbers, setNumbers] = useState<NumberInfo[]>([])
  const [totalClicks, setTotalClicks] = useState<number>(0) // New state for total clicks
  const [rank, setRank] = useState<string>("Bronze") // Initial rank

  // Define the thresholds for each rank
  const rankThresholds = [
    { rank: "Bronze", threshold: 1000 },
    { rank: "Silver", threshold: 5000 },
    { rank: "Gold", threshold: 10000 },
    { rank: "Platinum", threshold: 50000 },
    { rank: "Diamond", threshold: 100000 }
    // Add more ranks and thresholds as needed
  ];

  useEffect(() => {
    // Determine the current rank based on totalClicks
    for (let i = rankThresholds.length - 1; i >= 0; i--) {
      if (totalClicks >= rankThresholds[i].threshold) {
        setRank(rankThresholds[i].rank);
        break;
      }
    }
  }, [totalClicks]);

  const handleTouchStart = (event: any) => {
    handleClick()

    if (notCoinRef.current) {
      const touch = event.touches[0]
      const rect = notCoinRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const offsetX = touch.clientX - centerX
      const offsetY = centerY - touch.clientY

      const rotateXValue = offsetY * 0.1
      const rotateYValue = offsetX * 0.1

      setButtonTransform({
        scale: 1,
        translateZ: -5,
        rotateX: rotateXValue,
        rotateY: rotateYValue,
      })

      const randomNumberBetweenTenAndMinusTen =
        Math.floor(Math.random() * 21) - 10

      const newNumber: NumberInfo = {
        id: `${Date.now()}`,
        value: clickValue * 5,
        x: touch.clientX + randomNumberBetweenTenAndMinusTen,
        y: touch.clientY
      }

      setNumbers((prevNumbers) => [...prevNumbers, newNumber])
      setTotalClicks(prevTotalClicks => prevTotalClicks + newNumber.value) // Update total clicks with newNumber value

      // Remove the number after the animation duration
      setTimeout(() => {
        setNumbers((prevNumbers) =>
          prevNumbers.filter((number) => number.id !== newNumber.id)
        )
      }, numberAnimationDurationMs)
    }
  }

  const handleTouchEnd = () => {
    setButtonTransform({
      scale: 1,
      translateZ: 0,
      rotateX: 0,
      rotateY: 0,
    })
  }

  // Функция для форматирования числа с разделением тысяч запятой
  const formatNumberWithCommas = (number: number): string => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return (
    <AnimatePresence mode="popLayout">
      {canIClickPlease ? (
        <motion.div className="root" key="1" {...notCoinAppearence}>
          <div className="totalClicksContainer mb-2">
            <div className="clickIcon"></div> {/* Placeholder for icon */}
            <span>{formatNumberWithCommas(totalClicks +2500)}</span> {/* Display total clicks with commas */}
          </div>
          <div className="rankContainer mb-5">
            <div className="rankIcon"></div> {/* Placeholder for icon */}
            <span>{rank}</span> {/* Display total clicks with commas */}
          </div>
          <div
            className={cn("container", {
              ["funMode"]: funMode,
              ["sleep"]: sleep,
            })}
          >
            {children}
            <div
              ref={notCoinRef}
              className={cn("notcoin", "skin-default", {
                ["sleep"]: sleep,
              })}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{
                transform: `
                scale(${buttonTransform.scale})
                translateZ(${buttonTransform.translateZ}px)
                rotateX(${buttonTransform.rotateX}deg)
                rotateY(${buttonTransform.rotateY}deg)
              `,
              }}
            ></div>
          </div>
          <div>
            <AnimatePresence>
              {numbers.map((number) => {
                return (
                  <motion.div
                    key={number.id}
                    className="clickAmount"
                    initial={{ opacity: 1, y: number.y - 50, x: number.x }}
                    animate={{ opacity: 0, y: number.y - 200 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: numberAnimationDurationSec }}
                  >
                    {number.value}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : (
        <motion.div className="root" key="2" {...cooldownAppearence}>
          <div className="cooldownContainer">
            <div className="cooldownNumber">
              {cooldown || <small>nothing</small>}
            </div>
            <svg className="cooldown">
              <circle
                className="cooldownCircle"
                r="140"
                cx="150"
                cy="150"
              ></circle>
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
