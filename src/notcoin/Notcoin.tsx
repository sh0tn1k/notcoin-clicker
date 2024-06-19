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
  const tg = window.Telegram.WebApp;
  const [plusLimitValue, setSpeedLimit] = useState<number>(() => {
    const savedPlusLimitValue = localStorage.getItem('plusLimitValue');
    return savedPlusLimitValue ? parseInt(savedPlusLimitValue, 10) : 5;
  });
  const [multitap, setMultitap] = useState<number>(() => {
    const savedMultitap = localStorage.getItem('multitap');
    return savedMultitap ? parseInt(savedMultitap, 10) : 500;
  });
  const [numbers, setNumbers] = useState<NumberInfo[]>([])
  const [totalClicks, setTotalClicks] = useState<number>(() => {
    const savedTotalClicks = localStorage.getItem('totalClicks');
    return savedTotalClicks ? parseInt(savedTotalClicks, 10) : 0;
  })
  const [rank, setRank] = useState<string>(() => {
    const savedRank = localStorage.getItem('rank');
    return savedRank || "Bronze";
  })
  const [clickLimit, setClickLimit] = useState<number>(() => {
    const savedClickLimit = localStorage.getItem('clickLimit');
    return savedClickLimit ? parseInt(savedClickLimit, 10) : 1000000;
  });

  const [maxClicks, setMaxClicks] = useState<number>(() => {
    const savedMaxClicks = localStorage.getItem('maxClicks');
    return savedMaxClicks ? parseInt(savedMaxClicks, 10) : 1000000;
  }); // Max clicks allowed

  const [multitapLevel, setMultitapLevel] = useState<number>(() => {
    const savedMultitapLevel = localStorage.getItem('multitapLevel');
    return savedMultitapLevel ? parseInt(savedMultitapLevel, 10) : 1;
  });

  const [enegryLevel, setEnegryLevel] = useState<number>(() => {
    const savedEnegryLevel = localStorage.getItem('enegryLevel');
    return savedEnegryLevel ? parseInt(savedEnegryLevel, 10) : 1;
  });

  const [speedLevel, setSpeedLevel] = useState<number>(() => {
    const savedSpeedLevel = localStorage.getItem('speedLevel');
    return savedSpeedLevel ? parseInt(savedSpeedLevel, 10) : 1;
  });

  // Define the thresholds for each rank
  const rankThresholds = [
    { rank: "Bronze", threshold: 1000, reward: 0},
    { rank: "Silver", threshold: 5000, reward: 125000},
    { rank: "Gold", threshold: 200000, reward: 250000 },
    { rank: "Platinum", threshold: 2000000, reward: 500000},
    { rank: "Diamond", threshold: 10000000, reward: 1000000}
    // Add more ranks and thresholds as needed
  ];

  const isgiveRef = useRef(rankThresholds.map(() => false));

  // Interval to automatically replenish clickLimit
  useEffect(() => {
    const replenishInterval = setInterval(() => {
      if (clickLimit < maxClicks) {
        setClickLimit(prevLimit => {
          const newLimit = prevLimit + plusLimitValue;
          return newLimit > maxClicks ? maxClicks : newLimit;
        });
      }
    }, 1000); // 1000ms = 1 second

    return () => clearInterval(replenishInterval);
  }, [clickLimit]);

  useEffect(() => {
    // Determine the current rank based on totalClicks
    for (let i = rankThresholds.length - 1; i >= 0; i--) {
      if (totalClicks >= rankThresholds[i].threshold && !isgiveRef.current[i]) {
        setRank(rankThresholds[i].rank);
        setTotalClicks(prevTotalClicks => prevTotalClicks + rankThresholds[i].reward);
        isgiveRef.current[i] = true;
        break;
      }
    }
    // Save totalClicks to localStorage
    localStorage.setItem('totalClicks', totalClicks.toString());
  }, [totalClicks]);

  useEffect(() => {
    // Save rank to localStorage
    localStorage.setItem('rank', rank);
  }, [rank]);

  useEffect(() => {
    // Save multitap to localStorage
    localStorage.setItem('multitap', multitap.toString());
  }, [multitap]);

  useEffect(() => {
    // Save click limit to localStorage
    localStorage.setItem('clickLimit', clickLimit.toString());
  }, [clickLimit]);

  useEffect(() => {
    // Save click limit to localStorage
    localStorage.setItem('maxClicks', maxClicks.toString());
  }, [maxClicks]);

  useEffect(() => {
    // Save click limit to localStorage
    localStorage.setItem('plusLimitValue', plusLimitValue.toString());
  }, [plusLimitValue]);

  useEffect(() => {
    // Save click limit to localStorage
    localStorage.setItem('multitapLevel', multitapLevel.toString());
  }, [multitapLevel]);

  useEffect(() => {
    // Save click limit to localStorage
    localStorage.setItem('enegryLevel', enegryLevel.toString());
  }, [enegryLevel]);

  useEffect(() => {
    // Save click limit to localStorage
    localStorage.setItem('speedLevel', speedLevel.toString());
  }, [speedLevel]);

  const handleTouchStart = (event: any) => {
    if (clickLimit >= 0 && clickLimit < multitap) return; // Prevent clicking if limit is reached

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
        value: clickValue * multitap,
        x: touch.clientX + randomNumberBetweenTenAndMinusTen,
        y: touch.clientY
      }

      setNumbers((prevNumbers) => [...prevNumbers, newNumber])
      setTotalClicks(prevTotalClicks => prevTotalClicks + newNumber.value)
      setClickLimit(prevClickLimit => prevClickLimit - newNumber.value)

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

  // Функция для увеличения уровня и изменения цены
  const handleMultitapIncrease = () => {
    // Здесь можно задать структуру уровней и цен
    const maxLevel = 10
    const levelData = [
      { level: 1, price: 100, upcount: 1 },
      { level: 2, price: 1000, upcount: 2 },
      { level: 3, price: 5000, upcount: 3 },
      { level: 4, price: 10000, upcount: 4 },
      { level: 5, price: 15000, upcount: 5 },
      { level: 6, price: 30000, upcount: 6 },
      { level: 7, price: 100000, upcount: 7 },
      { level: 8, price: 200000, upcount: 8 },
      { level: 9, price: 500000, upcount: 9 },
      { level: 10, price: 1000000, upcount: 10 },
      // Добавьте другие уровни и цены по мере необходимости
    ];

    // Находим текущий уровень в массиве данных
    const currentLevel = levelData.find((data) => data.level === multitapLevel);

    if (currentLevel && multitapLevel < maxLevel) {
      // Увеличиваем уровень на 1
      setMultitapLevel((prevLevel) => prevLevel + 1);
      
      // Вычитаем цену из общего количества кликов
      setTotalClicks((prevClicks) => prevClicks - currentLevel.price);

      setMultitap((prevMultitap) => prevMultitap + currentLevel.upcount);
    }
  };

  const handleEnegryIncrease = () => {
    // Здесь можно задать структуру уровней и цен
    const maxLevel = 10
    const levelData = [
      { level: 1, price: 100, upcount: 500 },
      { level: 2, price: 500, upcount: 500 },
      { level: 3, price: 1000, upcount: 500 },
      { level: 4, price: 5000, upcount: 500 },
      { level: 5, price: 10000, upcount: 1000 },
      { level: 6, price: 20000, upcount: 1000 },
      { level: 7, price: 80000, upcount: 1000 },
      { level: 8, price: 100000, upcount: 5000 },
      { level: 9, price: 200000, upcount: 5000 },
      { level: 10, price: 300000, upcount: 5000 },
      // Добавьте другие уровни и цены по мере необходимости
    ];

    // Находим текущий уровень в массиве данных
    const currentLevel = levelData.find((data) => data.level === enegryLevel);

    if (currentLevel && enegryLevel < maxLevel) {
      // Увеличиваем уровень на 1
      setEnegryLevel((prevLevel) => prevLevel + 1);
      
      // Вычитаем цену из общего количества кликов
      setTotalClicks((prevClicks) => prevClicks - currentLevel.price);

      setMaxClicks((prevMaxClicks) => prevMaxClicks + currentLevel.upcount);
    }
  };

  const handleSpeedIncrease = () => {
    // Здесь можно задать структуру уровней и цен
    const maxLevel = 10
    const levelData = [
      { level: 1, price: 100, upcount: 5 },
      { level: 2, price: 200, upcount: 6 },
      { level: 3, price: 500, upcount: 7 },
      { level: 4, price: 800, upcount: 8 },
      { level: 5, price: 1200, upcount: 9 },
      { level: 6, price: 2500, upcount: 10 },
      { level: 7, price: 5000, upcount: 11 },
      { level: 8, price: 10000, upcount: 12 },
      { level: 9, price: 15000, upcount: 13 },
      { level: 10, price: 30000, upcount: 14 },
      // Добавьте другие уровни и цены по мере необходимости
    ];

    // Находим текущий уровень в массиве данных
    const currentLevel = levelData.find((data) => data.level === speedLevel);

    if (currentLevel && speedLevel < maxLevel) {
      // Увеличиваем уровень на 1
      setSpeedLevel((prevLevel) => prevLevel + 1);
      
      // Вычитаем цену из общего количества кликов
      setTotalClicks((prevClicks) => prevClicks - currentLevel.price);

      setSpeedLimit((prevSpeedLimit) => prevSpeedLimit + currentLevel.upcount);
    }
  };

  // Функция для форматирования числа с разделением тысяч запятой
  const formatNumberWithCommas = (number: number): string => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return (
    <AnimatePresence mode="popLayout">
      {canIClickPlease ? (
        <motion.div className="root" key="1" {...notCoinAppearence}>
          <div className="container">
            <div className="row">
              <div className="col-12 mb-2">
                <div className="totalClicksContainer">
                  <div className="clickIcon"></div> {/* Placeholder for icon */}
                  <span>{formatNumberWithCommas(totalClicks)}</span> {/* Display total clicks with commas */}
                </div>
              </div>
              <div className="col-12">
                <div className="rankContainer">
                  <span>@{tg.initDataUnsafe.user?.username || 'Unknown User'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-dot mx-2" viewBox="0 0 16 16">
                    <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                  </svg>
                  <div className="rankIcon"></div> {/* Placeholder for icon */}
                  <span>{rank}</span> {/* Display total clicks with commas */}
                </div>
              </div>
              <div className="col-12 my-5">
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
              </div>
              <div className="col-12">
                <div className="clickLimitContainer">
                  <span>{formatNumberWithCommas(clickLimit)} / {formatNumberWithCommas(maxClicks)}</span> {/* Display total clicks with commas */}
                </div>
              </div>
              <div className='col-3 text-center'><button className="transparent-blur-button" onClick={handleMultitapIncrease}>Multitap</button><div>{multitap}</div><div>{multitapLevel} lvl</div></div>
              <div className='col-3 text-center'><button className="transparent-blur-button" onClick={handleEnegryIncrease}>Energy</button><div>{maxClicks}</div><div>{enegryLevel} lvl</div></div>
              <div className='col-6 text-center'><button className="transparent-blur-button" onClick={handleSpeedIncrease}>Recharging</button><div>{plusLimitValue}</div><div>{speedLevel} lvl</div></div>
            </div>
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
