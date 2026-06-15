import React, { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "aloe_gamble_save";
const DAILY_AMOUNT = 10000;

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { balance: 0, lastClaim: null };
    return JSON.parse(raw);
  } catch {
    return { balance: 0, lastClaim: null };
  }
}

function saveSave(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const ALOE_FACES = {
  idle: "🌵",
  happy: "🌿",
  sad: "🥀",
  smug: "🌵✨",
};

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

export default function AloeGamble() {
  const [balance, setBalance] = useState(0);
  const [lastClaim, setLastClaim] = useState(null);
  const [tab, setTab] = useState("home");
  const [message, setMessage] = useState("알로애와 한 판 어때요?");
  const [aloeFace, setAloeFace] = useState("idle");

  useEffect(() => {
    const data = loadSave();
    setBalance(data.balance);
    setLastClaim(data.lastClaim);
  }, []);

  useEffect(() => {
    saveSave({ balance, lastClaim });
  }, [balance, lastClaim]);

  const canClaim = lastClaim !== getToday();

  function claimDaily() {
    if (!canClaim) return;
    setBalance((b) => b + DAILY_AMOUNT);
    setLastClaim(getToday());
    setAloeFace("happy");
    setMessage(`오늘의 ${DAILY_AMOUNT.toLocaleString()}원을 받았어요!`);
  }

  function adjustBalance(delta) {
    setBalance((b) => Math.max(0, b + delta));
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.aloe}>
          <span style={styles.aloeFace}>{ALOE_FACES[aloeFace]}</span>
          <div>
            <p style={styles.aloeName}>알로애</p>
            <p style={styles.aloeMsg}>{message}</p>
          </div>
        </div>
        <div style={styles.balanceBox}>
          <p style={styles.balanceLabel}>내 보유금</p>
          <p style={styles.balanceValue}>{balance.toLocaleString()}원</p>
        </div>
      </header>

      <div style={styles.claimRow}>
        <button
          style={{
            ...styles.button,
            ...(canClaim ? styles.primaryButton : styles.disabledButton),
            width: "100%",
          }}
          onClick={claimDaily}
          disabled={!canClaim}
        >
          {canClaim ? "오늘의 만원 받기" : "오늘은 이미 받았어요"}
        </button>
      </div>

      <nav style={styles.tabs}>
        {[
          { id: "home", label: "홈" },
          { id: "dice", label: "주사위 대결" },
          { id: "scratch", label: "즉석복권" },
          { id: "rps", label: "가위바위보" },
          { id: "mole", label: "배민지 잡기" },
          { id: "lateness", label: "김민서 지각탈출" },
          { id: "outfit", label: "반재영 옷입히기" },
        ].map((t) => (
          <button
            key={t.id}
            style={{
              ...styles.tabButton,
              ...(tab === t.id ? styles.tabButtonActive : {}),
            }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main style={styles.main}>
        {tab === "home" && (
          <HomeScreen onNavigate={setTab} balance={balance} />
        )}
        {tab === "dice" && (
          <DiceGame
            balance={balance}
            adjustBalance={adjustBalance}
            setMessage={setMessage}
            setAloeFace={setAloeFace}
          />
        )}
        {tab === "scratch" && (
          <ScratchGame
            balance={balance}
            adjustBalance={adjustBalance}
            setMessage={setMessage}
            setAloeFace={setAloeFace}
          />
        )}
        {tab === "rps" && (
          <RpsGame
            balance={balance}
            adjustBalance={adjustBalance}
            setMessage={setMessage}
            setAloeFace={setAloeFace}
          />
        )}
        {tab === "mole" && (
          <MoleGame
            balance={balance}
            adjustBalance={adjustBalance}
            setMessage={setMessage}
            setAloeFace={setAloeFace}
          />
        )}
        {tab === "lateness" && (
          <LatenessGame
            balance={balance}
            adjustBalance={adjustBalance}
            setMessage={setMessage}
            setAloeFace={setAloeFace}
          />
        )}
        {tab === "outfit" && (
          <OutfitGame
            balance={balance}
            adjustBalance={adjustBalance}
            setMessage={setMessage}
            setAloeFace={setAloeFace}
          />
        )}
      </main>
    </div>
  );
}

function HomeScreen({ onNavigate, balance }) {
  const cards = [
    {
      id: "dice",
      title: "주사위 대결",
      desc: "알로애와 1대1 주사위 대결. 이기면 배당 2배!",
      icon: "🎲",
    },
    {
      id: "scratch",
      title: "즉석복권",
      desc: "1장 1,000원. 30% 확률로 당첨!",
      icon: "🎫",
    },
    {
      id: "rps",
      title: "가위바위보",
      desc: "알로애와 한 판! 이기면 2배, 비기면 환급.",
      icon: "✊",
    },
    {
      id: "mole",
      title: "배민지 잡기",
      desc: "참가비 500원. 15초 동안 배민지를 빠르게 잡아 상금 획득!",
      icon: "🟤",
    },
    {
      id: "lateness",
      title: "김민서 지각탈출",
      desc: "참가비 1,000원! 60초 안에 도착하면 코인 획득, 장애물에 부딪히면 코인 손실.",
      icon: "🏃‍♀️",
    },
    {
      id: "outfit",
      title: "반재영 옷입히기",
      desc: "공주/거지/갸루 스타일을 믹스매치! 어떤 조합이든 코디비는 빠져나가요.",
      icon: "👗",
    },
  ];

  return (
    <div>
      {balance === 0 && (
        <p style={styles.notice}>
          게임머니가 없어요. 위에서 "오늘의 만원 받기"를 눌러보세요!
        </p>
      )}
      <div style={styles.cardGrid}>
        {cards.map((c) => (
          <div key={c.id} style={styles.card}>
            <div style={styles.cardIcon}>{c.icon}</div>
            <p style={styles.cardTitle}>{c.title}</p>
            <p style={styles.cardDesc}>{c.desc}</p>
            <button
              style={{ ...styles.button, ...styles.primaryButton, width: "100%" }}
              onClick={() => onNavigate(c.id)}
            >
              플레이
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BetInput({ value, onChange, max, disabled }) {
  return (
    <div style={styles.betRow}>
      <label style={styles.betLabel}>배팅 금액</label>
      <input
        type="number"
        min={100}
        max={max}
        step={100}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const v = Math.max(0, Math.min(max, Number(e.target.value) || 0));
          onChange(v);
        }}
        style={styles.betInput}
      />
      <button
        style={styles.smallButton}
        disabled={disabled}
        onClick={() => onChange(max)}
      >
        전액
      </button>
    </div>
  );
}

function DiceGame({ balance, adjustBalance, setMessage, setAloeFace }) {
  const [bet, setBet] = useState(Math.min(1000, balance) || 0);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setBet((b) => Math.min(b, balance));
  }, [balance]);

  function play() {
    if (bet <= 0 || bet > balance) return;
    setRolling(true);
    setResult(null);
    setAloeFace("idle");
    setMessage("두구두구두구...");

    setTimeout(() => {
      const player = rollDice();
      const aloe = rollDice();
      let outcome, delta, msg, face;

      if (player > aloe) {
        outcome = "win";
        delta = bet;
        msg = `${player} vs ${aloe} - 승리! ${(bet * 2).toLocaleString()}원 획득!`;
        face = "sad";
      } else if (player < aloe) {
        outcome = "lose";
        delta = -bet;
        msg = `${player} vs ${aloe} - 패배... 다음엔 이길 거예요`;
        face = "smug";
      } else {
        outcome = "draw";
        delta = 0;
        msg = `${player} vs ${aloe} - 동점! 배팅액 환급`;
        face = "idle";
      }

      adjustBalance(delta);
      setResult({ player, aloe, outcome });
      setMessage(msg);
      setAloeFace(face);
      setRolling(false);
    }, 700);
  }

  return (
    <div>
      <h3 style={styles.gameTitle}>🎲 주사위 대결</h3>
      <p style={styles.gameDesc}>
        알로애와 주사위를 1번씩 굴려 높은 숫자가 승리해요. 승리하면 배팅액의
        2배, 동점이면 환급, 패배하면 배팅액을 잃어요.
      </p>

      <BetInput value={bet} onChange={setBet} max={balance} disabled={rolling} />

      {result && (
        <div style={styles.diceResultRow}>
          <DiceFace value={result.player} label="나" />
          <span style={styles.vsText}>VS</span>
          <DiceFace value={result.aloe} label="알로애" />
        </div>
      )}

      <button
        style={{
          ...styles.button,
          ...styles.primaryButton,
          width: "100%",
          marginTop: "1rem",
        }}
        disabled={rolling || bet <= 0 || bet > balance || balance === 0}
        onClick={play}
      >
        {rolling ? "굴리는 중..." : "주사위 굴리기"}
      </button>
      {balance === 0 && <p style={styles.notice}>게임머니가 부족해요!</p>}
    </div>
  );
}

function DiceFace({ value, label }) {
  const faces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  return (
    <div style={styles.diceFace}>
      <span style={styles.diceGlyph}>{faces[value] || "🎲"}</span>
      <span style={styles.diceLabel}>{label}</span>
    </div>
  );
}

const SCRATCH_TICKETS = {
  lucky: {
    id: "lucky",
    label: "🍀 행운복권",
    cost: 500,
    chance: 0.45,
    min: 600,
    max: 1200,
    desc: "당첨 확률 45% · 600~1,200원",
  },
  normal: {
    id: "normal",
    label: "🎫 일반복권",
    cost: 1000,
    chance: 0.3,
    min: 2000,
    max: 5000,
    desc: "당첨 확률 30% · 2,000~5,000원",
  },
  premium: {
    id: "premium",
    label: "💎 프리미엄복권",
    cost: 3000,
    chance: 0.12,
    min: 15000,
    max: 30000,
    desc: "당첨 확률 12% · 15,000~30,000원",
  },
};

function ScratchGame({ balance, adjustBalance, setMessage, setAloeFace }) {
  const [ticketType, setTicketType] = useState("normal");
  const [revealing, setRevealing] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const ticket = SCRATCH_TICKETS[ticketType];

  function buyTicket() {
    if (balance < ticket.cost) return;
    setRevealing(true);
    setLastResult(null);
    adjustBalance(-ticket.cost);
    setMessage("복권을 긁는 중...");
    setAloeFace("idle");

    setTimeout(() => {
      const win = Math.random() < ticket.chance;
      if (win) {
        const reward =
          ticket.min + Math.floor(Math.random() * (ticket.max - ticket.min + 1));
        adjustBalance(reward);
        setLastResult({ win: true, reward });
        setMessage(`당첨! ${reward.toLocaleString()}원을 획득했어요!`);
        setAloeFace("sad");
      } else {
        setLastResult({ win: false });
        setMessage("아쉽게도 꽝이에요. 다음 기회에!");
        setAloeFace("smug");
      }
      setRevealing(false);
    }, 600);
  }

  return (
    <div>
      <h3 style={styles.gameTitle}>🎫 즉석복권</h3>
      <p style={styles.gameDesc}>
        원하는 복권 종류를 골라보세요. 가격이 높을수록 당첨 확률은 낮지만
        상금은 커져요.
      </p>

      <div style={styles.ticketTypeRow}>
        {Object.values(SCRATCH_TICKETS).map((t) => (
          <button
            key={t.id}
            style={{
              ...styles.ticketTypeButton,
              ...(ticketType === t.id ? styles.ticketTypeButtonActive : {}),
            }}
            disabled={revealing}
            onClick={() => {
              setTicketType(t.id);
              setLastResult(null);
            }}
          >
            <span style={styles.ticketTypeLabel}>{t.label}</span>
            <span style={styles.ticketTypeCost}>
              {t.cost.toLocaleString()}원
            </span>
            <span style={styles.ticketTypeDesc}>{t.desc}</span>
          </button>
        ))}
      </div>

      <div style={styles.scratchCard}>
        {revealing ? (
          <span style={styles.scratchEmoji}>🎫</span>
        ) : lastResult ? (
          lastResult.win ? (
            <div>
              <p style={styles.scratchBig}>🎉 당첨!</p>
              <p style={styles.scratchPrize}>
                +{lastResult.reward.toLocaleString()}원
              </p>
            </div>
          ) : (
            <p style={styles.scratchBig}>❌ 꽝</p>
          )
        ) : (
          <span style={styles.scratchEmoji}>🎫</span>
        )}
      </div>

      <button
        style={{
          ...styles.button,
          ...styles.primaryButton,
          width: "100%",
          marginTop: "1rem",
        }}
        disabled={revealing || balance < ticket.cost}
        onClick={buyTicket}
      >
        {revealing
          ? "긁는 중..."
          : `${ticket.label} 구매 (${ticket.cost.toLocaleString()}원)`}
      </button>
      {balance < ticket.cost && (
        <p style={styles.notice}>게임머니가 부족해요!</p>
      )}
    </div>
  );
}

const RPS_OPTIONS = [
  { id: "rock", label: "바위", emoji: "✊" },
  { id: "paper", label: "보", emoji: "✋" },
  { id: "scissors", label: "가위", emoji: "✌️" },
];

function judgeRps(player, aloe) {
  if (player === aloe) return "draw";
  const beats = { rock: "scissors", paper: "rock", scissors: "paper" };
  return beats[player] === aloe ? "win" : "lose";
}

function RpsGame({ balance, adjustBalance, setMessage, setAloeFace }) {
  const [bet, setBet] = useState(Math.min(1000, balance) || 0);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setBet((b) => Math.min(b, balance));
  }, [balance]);

  function play(choice) {
    if (bet <= 0 || bet > balance) return;
    setPlaying(true);
    setResult(null);
    setMessage("알로애가 고민 중...");
    setAloeFace("idle");

    setTimeout(() => {
      const aloeChoice =
        RPS_OPTIONS[Math.floor(Math.random() * RPS_OPTIONS.length)].id;
      const outcome = judgeRps(choice, aloeChoice);
      let delta, msg, face;

      if (outcome === "win") {
        delta = bet;
        msg = `승리! ${(bet * 2).toLocaleString()}원 획득!`;
        face = "sad";
      } else if (outcome === "lose") {
        delta = -bet;
        msg = "패배... 다음엔 이길 거예요";
        face = "smug";
      } else {
        delta = 0;
        msg = "비겼어요! 배팅액 환급";
        face = "idle";
      }

      adjustBalance(delta);
      setResult({ player: choice, aloe: aloeChoice, outcome });
      setMessage(msg);
      setAloeFace(face);
      setPlaying(false);
    }, 600);
  }

  const emojiOf = (id) => RPS_OPTIONS.find((o) => o.id === id)?.emoji;
  const labelOf = (id) => RPS_OPTIONS.find((o) => o.id === id)?.label;

  return (
    <div>
      <h3 style={styles.gameTitle}>✊ 가위바위보</h3>
      <p style={styles.gameDesc}>
        알로애와 가위바위보 한 판! 이기면 배팅액의 2배, 비기면 환급, 지면
        배팅액을 잃어요.
      </p>

      <BetInput
        value={bet}
        onChange={setBet}
        max={balance}
        disabled={playing}
      />

      {result && (
        <div style={styles.diceResultRow}>
          <DiceFace value={null} label="나" />
          <span style={styles.vsText}>VS</span>
          <DiceFace value={null} label="알로애" />
        </div>
      )}
      {result && (
        <div style={styles.rpsResultRow}>
          <div style={styles.diceFace}>
            <span style={styles.diceGlyph}>{emojiOf(result.player)}</span>
            <span style={styles.diceLabel}>{labelOf(result.player)}</span>
          </div>
          <span style={styles.vsText}>VS</span>
          <div style={styles.diceFace}>
            <span style={styles.diceGlyph}>{emojiOf(result.aloe)}</span>
            <span style={styles.diceLabel}>{labelOf(result.aloe)}</span>
          </div>
        </div>
      )}

      <div style={styles.rpsButtonRow}>
        {RPS_OPTIONS.map((o) => (
          <button
            key={o.id}
            style={{ ...styles.button, ...styles.rpsButton }}
            disabled={playing || bet <= 0 || bet > balance || balance === 0}
            onClick={() => play(o.id)}
          >
            <span style={{ fontSize: "1.5rem" }}>{o.emoji}</span>
            <span>{o.label}</span>
          </button>
        ))}
      </div>
      {balance === 0 && <p style={styles.notice}>게임머니가 부족해요!</p>}
    </div>
  );
}

function BaeMinji({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="배민지"
    >
      <ellipse cx="32" cy="36" rx="22" ry="19" fill="#f0997b" />
      <ellipse cx="22" cy="20" rx="6" ry="7" fill="#f0997b" />
      <ellipse cx="42" cy="20" rx="6" ry="7" fill="#f5c4b3" />
      <ellipse cx="32" cy="40" rx="9" ry="6" fill="#d85a30" />
      <circle cx="28" cy="40" r="1.6" fill="#993c1d" />
      <circle cx="36" cy="40" r="1.6" fill="#993c1d" />
      <circle cx="22" cy="30" r="3.5" fill="#2c2c2a" />
      <circle cx="42" cy="30" r="3.5" fill="#2c2c2a" />
      <circle cx="23" cy="29" r="1" fill="#fff" />
      <circle cx="43" cy="29" r="1" fill="#fff" />
    </svg>
  );
}

function PinkSausage({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="소시지"
    >
      <rect
        x="10"
        y="24"
        width="44"
        height="16"
        rx="8"
        fill="#f0997b"
        transform="rotate(-15 32 32)"
      />
      <rect
        x="10"
        y="24"
        width="44"
        height="6"
        rx="3"
        fill="#f5c4b3"
        transform="rotate(-15 32 32)"
      />
      <circle cx="16" cy="36" r="4" fill="#d85a30" />
      <circle cx="48" cy="20" r="4" fill="#d85a30" />
    </svg>
  );
}

const MOLE_ENTRY_COST = 500;
const MOLE_GAME_SECONDS = 15;
const MOLE_REWARD_PER_HIT = 150;
const MOLE_PENALTY_PER_MISS = 150;
const SAUSAGE_CHANCE = 0.35;

function MoleGame({ balance, adjustBalance, setMessage, setAloeFace }) {
  const [phase, setPhase] = useState("idle"); // idle | playing | done
  const [holes, setHoles] = useState(Array(9).fill(null)); // null | "pig" | "sausage"
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MOLE_GAME_SECONDS);

  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      finishGame();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  useEffect(() => {
    if (phase !== "playing") return;
    const spawnDelay = 350 + Math.random() * 350;
    const t = setTimeout(() => {
      setHoles((prev) => {
        const next = Array(9).fill(null);
        const idx = Math.floor(Math.random() * 9);
        next[idx] = Math.random() < SAUSAGE_CHANCE ? "sausage" : "pig";
        return next;
      });
    }, spawnDelay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, holes]);

  function startGame() {
    if (balance < MOLE_ENTRY_COST) return;
    adjustBalance(-MOLE_ENTRY_COST);
    setScore(0);
    setMisses(0);
    setTimeLeft(MOLE_GAME_SECONDS);
    setHoles(Array(9).fill(null));
    setPhase("playing");
    setMessage("배민지(돼지)만 잡고, 핑크 소시지는 피하세요!");
    setAloeFace("idle");
  }

  function finishGame() {
    setPhase("done");
    setHoles(Array(9).fill(null));
    const reward = score * MOLE_REWARD_PER_HIT;
    const penalty = misses * MOLE_PENALTY_PER_MISS;
    const netChange = reward - penalty;
    if (netChange !== 0) {
      adjustBalance(netChange);
    }
    const net = reward - penalty - MOLE_ENTRY_COST;
    if (misses > 0) {
      setMessage(
        `배민지 ${score}번, 소시지 ${misses}번! ${penalty.toLocaleString()}원을 잃었어요`
      );
      setAloeFace("smug");
    } else if (net > 0) {
      setMessage(`${score}번 잡았어요! ${reward.toLocaleString()}원 획득!`);
      setAloeFace("sad");
    } else if (net === 0) {
      setMessage(`${score}번 잡았어요. 참가비만큼 본전이네요!`);
      setAloeFace("idle");
    } else {
      setMessage(`${score}번 잡았어요. 좀 더 빨라져야겠어요!`);
      setAloeFace("smug");
    }
  }

  function whack(idx) {
    if (phase !== "playing" || !holes[idx]) return;
    if (holes[idx] === "pig") {
      setScore((s) => s + 1);
    } else {
      setMisses((m) => m + 1);
      adjustBalance(-MOLE_PENALTY_PER_MISS);
      setMessage(`핑크 소시지! ${MOLE_PENALTY_PER_MISS.toLocaleString()}원을 잃었어요`);
      setAloeFace("smug");
    }
    setHoles((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
  }

  return (
    <div>
      <h3 style={styles.gameTitle}>🐷 배민지 잡기</h3>
      <p style={styles.gameDesc}>
        참가비 {MOLE_ENTRY_COST.toLocaleString()}원. {MOLE_GAME_SECONDS}초
        동안 튀어나오는 배민지(돼지)만 클릭하세요. 색이 똑같은 소시지에 속지
        마세요! 1번 잡을 때마다 {MOLE_REWARD_PER_HIT.toLocaleString()}원!
        소시지를 잡으면 {MOLE_PENALTY_PER_MISS.toLocaleString()}원을 잃어요.
      </p>

      <div style={styles.moleStatusRow}>
        <span style={styles.moleStat}>배민지: {score}</span>
        <span style={styles.moleStat}>소시지: {misses}</span>
        <span style={styles.moleStat}>
          남은 시간: {phase === "playing" ? timeLeft : MOLE_GAME_SECONDS}초
        </span>
      </div>

      <div style={styles.moleGrid}>
        {holes.map((item, idx) => (
          <button
            key={idx}
            style={styles.moleHole}
            onClick={() => whack(idx)}
            disabled={phase !== "playing"}
            aria-label={
              item === "pig"
                ? "배민지 잡기"
                : item === "sausage"
                ? "소시지 (조심!)"
                : "빈 구멍"
            }
          >
            {item === "pig" && <BaeMinji size={52} />}
            {item === "sausage" && <PinkSausage size={52} />}
          </button>
        ))}
      </div>

      {phase !== "playing" ? (
        <button
          style={{
            ...styles.button,
            ...styles.primaryButton,
            width: "100%",
            marginTop: "1rem",
          }}
          disabled={balance < MOLE_ENTRY_COST}
          onClick={startGame}
        >
          {phase === "done"
            ? `다시 도전 (${MOLE_ENTRY_COST.toLocaleString()}원)`
            : `게임 시작 (${MOLE_ENTRY_COST.toLocaleString()}원)`}
        </button>
      ) : (
        <p style={styles.notice}>게임 진행 중...</p>
      )}
      {balance < MOLE_ENTRY_COST && phase !== "playing" && (
        <p style={styles.notice}>게임머니가 부족해요!</p>
      )}
    </div>
  );
}

/* ===================== 김민서 지각탈출 ===================== */

const LATE_CANVAS_W = 320;
const LATE_CANVAS_H = 160;
const LATE_GROUND_H = 28;
const LATE_GROUND_Y = LATE_CANVAS_H - LATE_GROUND_H;
const LATE_PLAYER_X = 40;
const LATE_PLAYER_W = 24;
const LATE_PLAYER_H = 32;
const LATE_GRAVITY = 1700;
const LATE_JUMP_V = -560;
const LATE_BASE_SPEED = 180;
const LATE_DISTANCE_GOAL = 9000;
const LATE_DURATION = 60;
const LATE_ENTRY_FEE = 1000;
const LATE_SUCCESS_REWARD = 2500;
const LATE_AVOID_BONUS = 50;

const LATE_OBSTACLES = {
  bed: { w: 30, h: 24, emoji: "🛏️", bg: "#cfe8ff", gauge: 25, effect: "freeze", coin: -100 },
  phone: { w: 20, h: 20, emoji: "📱", bg: "#e3d6ff", gauge: 15, effect: "time", value: 5, coin: -150 },
  food: { w: 26, h: 22, emoji: "🍔", bg: "#fff1c2", gauge: 10, effect: "slow", coin: -100 },
  game: { w: 24, h: 22, emoji: "🎮", bg: "#d6f5dd", gauge: 20, effect: "time", value: 7, coin: -200 },
  bus: { w: 46, h: 34, emoji: "🚌", bg: "#ffe0c2", gauge: 30, effect: "time", value: 10, coin: -300 },
};

const LATE_OBSTACLE_WEIGHTS = [
  ["bed", 22],
  ["phone", 24],
  ["food", 22],
  ["game", 18],
  ["bus", 14],
];

function pickObstacleType() {
  const total = LATE_OBSTACLE_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [type, w] of LATE_OBSTACLE_WEIGHTS) {
    if (r < w) return type;
    r -= w;
  }
  return LATE_OBSTACLE_WEIGHTS[0][0];
}

function createLateState() {
  return {
    player: { y: LATE_GROUND_Y - LATE_PLAYER_H, vy: 0 },
    obstacles: [],
    distance: 0,
    timeLeft: LATE_DURATION,
    gauge: 0,
    avoidCount: 0,
    coinDelta: 0,
    freezeTimer: 0,
    slowTimer: 0,
    spawnTimer: 700,
    frame: 0,
    lastTime: null,
  };
}

function applyLateObstacleEffect(st, type) {
  const def = LATE_OBSTACLES[type];
  st.gauge = Math.min(100, st.gauge + def.gauge);
  st.coinDelta += def.coin;
  if (def.effect === "freeze") {
    st.freezeTimer = 3000;
  } else if (def.effect === "time") {
    st.timeLeft = Math.max(0, st.timeLeft - def.value);
  } else if (def.effect === "slow") {
    st.slowTimer = 3000;
  }
}

function updateLateGame(st, dt) {
  st.timeLeft = Math.max(0, st.timeLeft - dt);
  if (st.freezeTimer > 0) st.freezeTimer = Math.max(0, st.freezeTimer - dt * 1000);
  if (st.slowTimer > 0) st.slowTimer = Math.max(0, st.slowTimer - dt * 1000);

  const speed = st.slowTimer > 0 ? LATE_BASE_SPEED * 0.5 : LATE_BASE_SPEED;
  st.distance += speed * dt;

  const p = st.player;
  p.vy += LATE_GRAVITY * dt;
  p.y += p.vy * dt;
  const groundTop = LATE_GROUND_Y - LATE_PLAYER_H;
  if (p.y > groundTop) {
    p.y = groundTop;
    p.vy = 0;
  }

  st.spawnTimer -= dt * 1000;
  if (st.spawnTimer <= 0) {
    const type = pickObstacleType();
    const def = LATE_OBSTACLES[type];
    st.obstacles.push({
      type,
      x: LATE_CANVAS_W + 10,
      w: def.w,
      h: def.h,
      hit: false,
      counted: false,
    });
    st.spawnTimer = 850 + Math.random() * 750;
  }

  const px = LATE_PLAYER_X;
  const pw = LATE_PLAYER_W;
  const ph = LATE_PLAYER_H;
  const py = p.y;
  const pad = 4;

  for (const ob of st.obstacles) {
    ob.x -= speed * dt;
    const oy = LATE_GROUND_Y - ob.h;
    if (!ob.hit) {
      const overlap =
        px + pad < ob.x + ob.w - pad &&
        px + pw - pad > ob.x + pad &&
        py + pad < oy + ob.h - pad &&
        py + ph - pad > oy + pad;
      if (overlap) {
        ob.hit = true;
        applyLateObstacleEffect(st, ob.type);
      } else if (!ob.counted && ob.x + ob.w < px) {
        ob.counted = true;
        st.avoidCount += 1;
      }
    }
  }
  st.obstacles = st.obstacles.filter((ob) => ob.x + ob.w > -10);

  st.frame += 1;
}

function lateRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function lateDrawCloud(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
  ctx.arc(x + r * 0.6, y + 4, r * 0.5, 0, Math.PI * 2);
  ctx.arc(x - r * 0.6, y + 4, r * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function lateDrawPlayer(ctx, st) {
  const p = st.player;
  const x = LATE_PLAYER_X;
  const y = p.y;
  const w = LATE_PLAYER_W;
  const h = LATE_PLAYER_H;
  const onGround = p.y >= LATE_GROUND_Y - LATE_PLAYER_H - 0.5;
  const shake = st.freezeTimer > 0 ? Math.sin(st.frame * 1.5) * 1.5 : 0;
  const cx = x + w / 2 + shake;

  ctx.strokeStyle = "#5a4632";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  const legSwing = onGround ? Math.sin(st.frame * 0.6) * 6 : 0;
  ctx.beginPath();
  ctx.moveTo(cx - 4, y + h - 6);
  ctx.lineTo(cx - 4 + legSwing, y + h + 6);
  ctx.moveTo(cx + 4, y + h - 6);
  ctx.lineTo(cx + 4 - legSwing, y + h + 6);
  ctx.stroke();

  ctx.fillStyle = "#ff9bb3";
  lateRoundRect(ctx, x + 2 + shake, y + 10, w - 4, h - 16, 6);
  ctx.fill();

  ctx.fillStyle = "#ffe0c2";
  ctx.beginPath();
  ctx.arc(cx, y + 8, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5a4632";
  ctx.beginPath();
  ctx.arc(cx, y + 5, 8.5, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3a2c20";
  ctx.beginPath();
  ctx.arc(cx - 3, y + 8, 1, 0, Math.PI * 2);
  ctx.arc(cx + 3, y + 8, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, y + 10, 2.5, 0, Math.PI, false);
  ctx.stroke();

  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  if (st.freezeTimer > 0) {
    ctx.fillText("💤", cx, y - 6);
  } else if (st.slowTimer > 0) {
    ctx.fillText("🍔", cx, y - 6);
  }
}

function drawLateGame(canvas, st, paused) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = LATE_CANVAS_W;
  const H = LATE_CANVAS_H;

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#bfe6ff");
  grad.addColorStop(1, "#eaf7ff");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  const cloudOffset = st.distance * 0.2;
  for (let i = 0; i < 3; i++) {
    const span = W + 200;
    let cx = i * 160 - (cloudOffset % span);
    if (cx < -60) cx += span;
    lateDrawCloud(ctx, cx - 60, 20 + (i % 2) * 14, 22);
  }

  ctx.fillStyle = "#bff0c8";
  ctx.fillRect(0, LATE_GROUND_Y, W, LATE_GROUND_H);
  ctx.strokeStyle = "#9adba8";
  ctx.lineWidth = 2;
  const stripeOffset = st.distance % 24;
  for (let x = -stripeOffset; x < W; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, LATE_GROUND_Y + 4);
    ctx.lineTo(x - 8, H);
    ctx.stroke();
  }

  for (const ob of st.obstacles) {
    const def = LATE_OBSTACLES[ob.type];
    const oy = LATE_GROUND_Y - ob.h;
    ctx.fillStyle = def.bg;
    lateRoundRect(ctx, ob.x, oy, ob.w, ob.h, 6);
    ctx.fill();
    ctx.font = `${Math.floor(ob.h * 0.8)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(def.emoji, ob.x + ob.w / 2, oy + ob.h / 2 + 1);
  }

  lateDrawPlayer(ctx, st);

  if (paused) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("일시정지", W / 2, H / 2);
  }
}

function LatenessGame({ balance, adjustBalance, setMessage, setAloeFace }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef(null);
  const [phase, setPhase] = useState("ready"); // ready | playing | success | fail
  const [paused, setPaused] = useState(false);
  const [display, setDisplay] = useState({
    timeLeft: LATE_DURATION,
    coins: balance,
    gauge: 0,
  });
  const [resultInfo, setResultInfo] = useState({ net: 0 });

  function startGame() {
    if (balance < LATE_ENTRY_FEE) return;
    adjustBalance(-LATE_ENTRY_FEE);
    stateRef.current = createLateState();
    setDisplay({
      timeLeft: LATE_DURATION,
      coins: balance - LATE_ENTRY_FEE,
      gauge: 0,
    });
    setPaused(false);
    setPhase("playing");
    setMessage(
      `참가비 ${LATE_ENTRY_FEE.toLocaleString()}원! 민서야 빨리 가야 해, 장애물을 피해봐!`
    );
    setAloeFace("idle");
  }

  function finishLateGame(result, st) {
    let net;
    if (result === "success") {
      net = LATE_SUCCESS_REWARD + st.avoidCount * LATE_AVOID_BONUS + st.coinDelta;
    } else {
      net = st.coinDelta;
    }
    if (net !== 0) adjustBalance(net);

    setResultInfo({ net });
    setDisplay({
      timeLeft: Math.max(0, Math.ceil(st.timeLeft)),
      coins: balance + net,
      gauge: Math.round(st.gauge),
    });
    setPhase(result);

    if (result === "success") {
      if (net >= 0) {
        setMessage(
          `민서가 약속 시간에 도착! +${net.toLocaleString()}원 획득!`
        );
        setAloeFace("happy");
      } else {
        setMessage(
          `도착은 했지만 사고를 너무 많이 쳐서 ${Math.abs(net).toLocaleString()}원 손해예요`
        );
        setAloeFace("smug");
      }
    } else {
      const lossText =
        net < 0
          ? `추가로 ${Math.abs(net).toLocaleString()}원을 더 잃었어요`
          : `참가비만 날렸어요`;
      setMessage(`또 늦었어요... ${lossText}`);
      setAloeFace("smug");
    }
  }

  useEffect(() => {
    if (phase !== "playing") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const loop = (now) => {
      const st = stateRef.current;
      if (!st.lastTime) st.lastTime = now;
      const dt = Math.min((now - st.lastTime) / 1000, 0.05);
      st.lastTime = now;

      if (!paused) {
        updateLateGame(st, dt);
      }
      drawLateGame(canvasRef.current, st, paused);

      if (st.frame % 3 === 0) {
        setDisplay({
          timeLeft: Math.max(0, Math.ceil(st.timeLeft)),
          coins: balance + st.coinDelta,
          gauge: Math.round(st.gauge),
        });
      }

      if (!paused) {
        if (st.gauge >= 100 || st.timeLeft <= 0) {
          finishLateGame("fail", st);
          return;
        }
        if (st.distance >= LATE_DISTANCE_GOAL) {
          finishLateGame("success", st);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, paused]);

  function handleJump() {
    const st = stateRef.current;
    if (!st || phase !== "playing" || paused) return;
    if (st.freezeTimer > 0) return;
    const groundTop = LATE_GROUND_Y - LATE_PLAYER_H;
    if (st.player.y >= groundTop - 0.5) {
      st.player.vy = LATE_JUMP_V;
    }
  }

  function togglePause() {
    if (phase !== "playing") return;
    setPaused((prev) => {
      const next = !prev;
      if (!next && stateRef.current) {
        stateRef.current.lastTime = null;
      }
      return next;
    });
  }

  return (
    <div>
      <h3 style={styles.gameTitle}>🏃‍♀️ 김민서 지각탈출</h3>
      <p style={styles.gameDesc}>
        약속에 매번 늦는 김민서! 참가비{" "}
        {LATE_ENTRY_FEE.toLocaleString()}원, 60초 안에 점프로 장애물을 피해
        약속 장소까지 도착시켜주세요. 장애물에 부딪힐 때마다 코인도 함께
        잃어요.
      </p>

      {phase === "ready" && (
        <div style={styles.lateStartBox}>
          <p style={styles.lateStartEmoji}>🏃‍♀️💨</p>
          <p style={styles.lateStartText}>
            🛏️ 침대: 3초 멈춤 & -100원 · 📱 폰: -5초 & -150원
            <br />
            🍔 배달음식: 속도 감소 & -100원 · 🎮 게임기: -7초 & -200원
            <br />
            🚌 버스: 타이밍 놓치면 -10초 & -300원
            <br />
            성공 시 {LATE_SUCCESS_REWARD.toLocaleString()}원 + 회피 보너스
            지급!
          </p>
          <button
            style={{
              ...styles.button,
              ...(balance >= LATE_ENTRY_FEE
                ? styles.primaryButton
                : styles.disabledButton),
              width: "100%",
            }}
            disabled={balance < LATE_ENTRY_FEE}
            onClick={startGame}
          >
            시작하기 (참가비 {LATE_ENTRY_FEE.toLocaleString()}원)
          </button>
          {balance < LATE_ENTRY_FEE && (
            <p style={styles.notice}>게임머니가 부족해요!</p>
          )}
        </div>
      )}

      {phase !== "ready" && (
        <>
          <div style={styles.lateTopBar}>
            <div style={styles.lateStat}>
              <span style={styles.lateStatLabel}>남은 시간</span>
              <span style={styles.lateStatValue}>{display.timeLeft}초</span>
            </div>
            <div style={{ ...styles.lateStat, flex: 1.6 }}>
              <span style={styles.lateStatLabel}>지각 게이지</span>
              <div style={styles.gaugeTrack}>
                <div
                  style={{ ...styles.gaugeFill, width: `${display.gauge}%` }}
                />
              </div>
            </div>
            <div style={styles.lateStat}>
              <span style={styles.lateStatLabel}>코인</span>
              <span style={styles.lateStatValue}>
                {display.coins.toLocaleString()}
              </span>
            </div>
          </div>

          <div style={styles.lateCanvasWrap}>
            <canvas
              ref={canvasRef}
              width={LATE_CANVAS_W}
              height={LATE_CANVAS_H}
              style={styles.lateCanvas}
            />
            {(phase === "success" || phase === "fail") && (
              <div style={styles.lateOverlay}>
                <p style={styles.lateOverlayTitle}>
                  {phase === "success"
                    ? "약속 시간에 도착! 🎉"
                    : "또 늦었다... 😭"}
                </p>
                <p style={styles.lateOverlayScore}>
                  {resultInfo.net >= 0
                    ? `+${resultInfo.net.toLocaleString()}원`
                    : `${resultInfo.net.toLocaleString()}원`}
                </p>
                <button
                  style={{
                    ...styles.button,
                    ...(balance >= LATE_ENTRY_FEE
                      ? styles.primaryButton
                      : styles.disabledButton),
                  }}
                  disabled={balance < LATE_ENTRY_FEE}
                  onClick={startGame}
                >
                  다시 도전 ({LATE_ENTRY_FEE.toLocaleString()}원)
                </button>
              </div>
            )}
          </div>

          <div style={styles.lateControls}>
            <button
              style={{
                ...styles.button,
                ...styles.primaryButton,
                ...styles.lateJumpButton,
              }}
              onClick={handleJump}
              disabled={phase !== "playing" || paused}
            >
              ⬆️ 점프
            </button>
            <button
              style={{ ...styles.button, ...styles.smallButton }}
              onClick={togglePause}
              disabled={phase !== "playing"}
            >
              {paused ? "▶️ 계속" : "⏸️ 일시정지"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ===================== 반재영 옷입히기 ===================== */

const OUTFIT_STYLING_COST = 800;

const OUTFIT_HAIR_OPTIONS = [
  { id: "princess", label: "공주 웨이브", emoji: "👑" },
  { id: "beggar", label: "덥수룩 단발", emoji: "🌀" },
  { id: "gyaru", label: "갸루 트윈테일", emoji: "🎀" },
];

const OUTFIT_TOP_OPTIONS = [
  { id: "princess", label: "코르셋 드레스", emoji: "👗" },
  { id: "beggar", label: "헌 티셔츠", emoji: "👕" },
  { id: "gyaru", label: "크롭탑", emoji: "🩱" },
];

const OUTFIT_BOTTOM_OPTIONS = [
  { id: "princess", label: "볼륨 스커트", emoji: "🌷" },
  { id: "beggar", label: "누더기 바지", emoji: "🩳" },
  { id: "gyaru", label: "체크 미니스커트", emoji: "🏁" },
];

const OUTFIT_SHOES_OPTIONS = [
  { id: "princess", label: "유리구두", emoji: "👠" },
  { id: "beggar", label: "짝짝이 슬리퍼", emoji: "🩴" },
  { id: "gyaru", label: "통굽 부츠", emoji: "👢" },
];

const OUTFIT_SET_LABELS = {
  princess: "공주",
  beggar: "거지",
  gyaru: "갸루",
};

function OutfitCharacter({ hair, top, bottom, shoes, size = 160 }) {
  return (
    <svg
      width={size}
      height={(size * 170) / 120}
      viewBox="0 0 120 170"
      role="img"
      aria-label="반재영 코디 미리보기"
    >
      {/* 기본 몸 (피부) */}
      <rect x="46" y="96" width="12" height="50" rx="4" fill="#ffe0c2" />
      <rect x="62" y="96" width="12" height="50" rx="4" fill="#ffe0c2" />
      <rect x="30" y="62" width="10" height="34" rx="5" fill="#ffe0c2" />
      <rect x="80" y="62" width="10" height="34" rx="5" fill="#ffe0c2" />
      <rect x="42" y="58" width="36" height="40" rx="10" fill="#ffe0c2" />
      <rect x="50" y="46" width="20" height="12" fill="#ffe0c2" />
      <circle cx="60" cy="32" r="20" fill="#ffe0c2" />

      {/* 얼굴 */}
      <circle cx="54" cy="30" r="1.6" fill="#3a2c20" />
      <circle cx="66" cy="30" r="1.6" fill="#3a2c20" />
      <path d="M54 38 Q60 42 66 38" stroke="#3a2c20" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* 머리 스타일 */}
      {hair === "princess" && (
        <>
          <path d="M38 20 C30 38 32 64 43 70 L47 54 C43 40 47 25 60 18 Z" fill="#f4d35e" />
          <path d="M82 20 C90 38 88 64 77 70 L73 54 C77 40 73 25 60 18 Z" fill="#f4d35e" />
          <path d="M40 13 L80 13 L70 5 L60 11 L50 5 Z" fill="#ffd86b" />
          <circle cx="60" cy="8" r="2" fill="#fff6c4" />
        </>
      )}
      {hair === "beggar" && (
        <path
          d="M38 16 Q33 7 44 5 Q50 0 60 5 Q70 0 76 5 Q87 7 82 16 Q88 25 78 21 Q70 28 60 21 Q50 28 42 21 Q32 25 38 16 Z"
          fill="#6b4f3a"
        />
      )}
      {hair === "gyaru" && (
        <>
          <ellipse cx="33" cy="40" rx="7" ry="18" fill="#c97b4a" />
          <ellipse cx="87" cy="40" rx="7" ry="18" fill="#c97b4a" />
          <path d="M40 13 Q60 3 80 13 Q78 22 60 18 Q42 22 40 13 Z" fill="#c97b4a" />
        </>
      )}

      {/* 상의 */}
      {top === "princess" && (
        <>
          <path d="M40 58 Q60 50 80 58 L80 100 Q60 108 40 100 Z" fill="#b48ce0" />
          <line x1="40" y1="64" x2="80" y2="64" stroke="#ffd86b" strokeWidth="3" />
        </>
      )}
      {top === "beggar" && (
        <>
          <rect x="40" y="58" width="40" height="40" rx="6" fill="#9c8060" />
          <rect x="44" y="70" width="10" height="10" fill="#7a6248" />
          <rect x="66" y="80" width="10" height="8" fill="#b89c7a" />
        </>
      )}
      {top === "gyaru" && (
        <>
          <rect x="42" y="58" width="36" height="26" rx="6" fill="#ff7eb6" />
          <rect x="42" y="58" width="36" height="6" rx="3" fill="#2c2c2a" />
        </>
      )}

      {/* 하의 */}
      {bottom === "princess" && (
        <>
          <path d="M38 92 Q60 86 82 92 L94 148 L26 148 Z" fill="#caa6f0" />
          <path d="M38 92 Q60 86 82 92" stroke="#fff" strokeWidth="2" fill="none" />
        </>
      )}
      {bottom === "beggar" && (
        <>
          <rect x="44" y="94" width="14" height="52" rx="3" fill="#7a6248" />
          <rect x="62" y="94" width="14" height="52" rx="3" fill="#8a7058" />
          <rect x="44" y="120" width="14" height="8" fill="#5a4632" />
        </>
      )}
      {bottom === "gyaru" && (
        <>
          <rect x="40" y="92" width="40" height="24" rx="4" fill="#2c2c2a" />
          <line x1="40" y1="100" x2="80" y2="100" stroke="#fff" strokeWidth="1.5" />
          <line x1="40" y1="108" x2="80" y2="108" stroke="#fff" strokeWidth="1.5" />
        </>
      )}

      {/* 신발 */}
      {shoes === "princess" && (
        <>
          <ellipse cx="51" cy="150" rx="9" ry="5" fill="#cdeeff" />
          <ellipse cx="69" cy="150" rx="9" ry="5" fill="#cdeeff" />
          <circle cx="51" cy="148" r="1.5" fill="#fff" />
          <circle cx="69" cy="148" r="1.5" fill="#fff" />
        </>
      )}
      {shoes === "beggar" && (
        <>
          <rect x="42" y="146" width="18" height="6" rx="2" fill="#ff7eb6" />
          <rect x="60" y="146" width="18" height="6" rx="2" fill="#9adba8" />
        </>
      )}
      {shoes === "gyaru" && (
        <>
          <rect x="42" y="128" width="18" height="22" rx="3" fill="#2c2c2a" />
          <rect x="60" y="128" width="18" height="22" rx="3" fill="#2c2c2a" />
          <rect x="42" y="142" width="18" height="8" fill="#1a1a1a" />
          <rect x="60" y="142" width="18" height="8" fill="#1a1a1a" />
        </>
      )}
    </svg>
  );
}

function OutfitOptionRow({ title, options, selected, onSelect }) {
  return (
    <div style={styles.outfitRow}>
      <p style={styles.outfitRowTitle}>{title}</p>
      <div style={styles.outfitOptionGrid}>
        {options.map((o) => (
          <button
            key={o.id}
            style={{
              ...styles.outfitOptionButton,
              ...(selected === o.id ? styles.outfitOptionButtonActive : {}),
            }}
            onClick={() => onSelect(o.id)}
          >
            <span style={styles.outfitOptionEmoji}>{o.emoji}</span>
            <span style={styles.outfitOptionLabel}>{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function OutfitGame({ balance, adjustBalance, setMessage, setAloeFace }) {
  const [hair, setHair] = useState(OUTFIT_HAIR_OPTIONS[0].id);
  const [top, setTop] = useState(OUTFIT_TOP_OPTIONS[0].id);
  const [bottom, setBottom] = useState(OUTFIT_BOTTOM_OPTIONS[0].id);
  const [shoes, setShoes] = useState(OUTFIT_SHOES_OPTIONS[0].id);
  const [result, setResult] = useState(null);

  function finishStyling() {
    if (balance < OUTFIT_STYLING_COST) return;
    adjustBalance(-OUTFIT_STYLING_COST);

    const counts = { princess: 0, beggar: 0, gyaru: 0 };
    [hair, top, bottom, shoes].forEach((v) => {
      counts[v] += 1;
    });
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

    let comment;
    if (dominant[1] === 4) {
      if (dominant[0] === "princess") {
        comment = "완벽한 공주님 반재영 등장! 그래도 코디비는 받을게요";
      } else if (dominant[0] === "beggar") {
        comment = "리얼 거지 컨셉 완성... 스타일링비조차 아까운 비주얼이네요";
      } else {
        comment = "찐 갸루 반재영 탄생! 스타일 비용은 별도예요";
      }
    } else if (dominant[1] >= 3) {
      comment = `${OUTFIT_SET_LABELS[dominant[0]]} 느낌이 강한 코디네요! 코디비는 동일하게 빠져나가요`;
    } else {
      comment = "공주·거지·갸루가 섞인 독특한 믹스매치 코디예요";
    }

    setResult({
      cost: OUTFIT_STYLING_COST,
      comment,
    });
    setMessage(`${comment} (-${OUTFIT_STYLING_COST.toLocaleString()}원)`);
    setAloeFace("smug");
  }

  return (
    <div>
      <h3 style={styles.gameTitle}>👗 반재영 옷입히기</h3>
      <p style={styles.gameDesc}>
        머리·상의·하의·신발을 공주/거지/갸루 스타일끼리 자유롭게 믹스매치해서
        반재영을 코디해보세요. 어떤 조합이든 코디비{" "}
        {OUTFIT_STYLING_COST.toLocaleString()}원은 빠져나가요.
      </p>

      <div style={styles.outfitPreviewWrap}>
        <OutfitCharacter hair={hair} top={top} bottom={bottom} shoes={shoes} />
      </div>

      <OutfitOptionRow
        title="머리 스타일"
        options={OUTFIT_HAIR_OPTIONS}
        selected={hair}
        onSelect={setHair}
      />
      <OutfitOptionRow
        title="상의"
        options={OUTFIT_TOP_OPTIONS}
        selected={top}
        onSelect={setTop}
      />
      <OutfitOptionRow
        title="하의"
        options={OUTFIT_BOTTOM_OPTIONS}
        selected={bottom}
        onSelect={setBottom}
      />
      <OutfitOptionRow
        title="신발"
        options={OUTFIT_SHOES_OPTIONS}
        selected={shoes}
        onSelect={setShoes}
      />

      {result && (
        <div style={styles.outfitResultBox}>
          <p style={styles.outfitResultComment}>{result.comment}</p>
          <p style={styles.outfitResultCost}>
            -{result.cost.toLocaleString()}원
          </p>
        </div>
      )}

      <button
        style={{
          ...styles.button,
          ...(balance >= OUTFIT_STYLING_COST
            ? styles.primaryButton
            : styles.disabledButton),
          width: "100%",
          marginTop: "1rem",
        }}
        disabled={balance < OUTFIT_STYLING_COST}
        onClick={finishStyling}
      >
        코디 완성하기 (-{OUTFIT_STYLING_COST.toLocaleString()}원)
      </button>
      {balance < OUTFIT_STYLING_COST && (
        <p style={styles.notice}>게임머니가 부족해요!</p>
      )}
    </div>
  );
}

const styles = {
  app: {
    maxWidth: 480,
    margin: "0 auto",
    fontFamily:
      "'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif",
    color: "#2c2c2a",
    padding: "1rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f4f1ea",
    borderRadius: 16,
    padding: "1rem 1.25rem",
    marginBottom: "0.75rem",
  },
  aloe: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  aloeFace: {
    fontSize: 32,
  },
  aloeName: {
    fontWeight: 600,
    fontSize: 15,
    margin: 0,
  },
  aloeMsg: {
    fontSize: 12,
    color: "#5f5e5a",
    margin: 0,
    maxWidth: 180,
  },
  balanceBox: {
    textAlign: "right",
  },
  balanceLabel: {
    fontSize: 12,
    color: "#5f5e5a",
    margin: 0,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
  },
  claimRow: {
    marginBottom: "0.75rem",
  },
  tabs: {
    display: "flex",
    gap: 6,
    marginBottom: "1rem",
    overflowX: "auto",
  },
  tabButton: {
    flex: "1 0 auto",
    padding: "8px 12px",
    fontSize: 13,
    borderRadius: 10,
    border: "1px solid #d3d1c7",
    background: "#fff",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  tabButtonActive: {
    background: "#26215c",
    color: "#fff",
    borderColor: "#26215c",
  },
  main: {
    minHeight: 200,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
  },
  card: {
    border: "1px solid #d3d1c7",
    borderRadius: 16,
    padding: "1rem",
    textAlign: "center",
    background: "#fff",
  },
  cardIcon: {
    fontSize: 32,
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: 15,
    margin: "6px 0 2px",
  },
  cardDesc: {
    fontSize: 12,
    color: "#5f5e5a",
    margin: "0 0 10px",
  },
  button: {
    border: "1px solid #d3d1c7",
    borderRadius: 10,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    background: "#fff",
  },
  primaryButton: {
    background: "#26215c",
    color: "#fff",
    borderColor: "#26215c",
  },
  disabledButton: {
    background: "#e1ddd0",
    color: "#888780",
    borderColor: "#d3d1c7",
    cursor: "not-allowed",
  },
  smallButton: {
    border: "1px solid #d3d1c7",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 12,
    background: "#fff",
    cursor: "pointer",
  },
  betRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    margin: "1rem 0",
  },
  betLabel: {
    fontSize: 13,
    color: "#5f5e5a",
    flexShrink: 0,
  },
  betInput: {
    flex: 1,
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #d3d1c7",
    fontSize: 14,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 700,
    margin: "0 0 6px",
  },
  gameDesc: {
    fontSize: 13,
    color: "#5f5e5a",
    margin: "0 0 0.5rem",
    lineHeight: 1.6,
  },
  diceResultRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    margin: "1rem 0",
  },
  rpsResultRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    margin: "0.5rem 0 1rem",
  },
  diceFace: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  diceGlyph: {
    fontSize: 40,
  },
  diceLabel: {
    fontSize: 12,
    color: "#5f5e5a",
  },
  vsText: {
    fontSize: 13,
    fontWeight: 700,
    color: "#888780",
  },
  scratchCard: {
    background: "#f4f1ea",
    border: "2px dashed #d3d1c7",
    borderRadius: 16,
    minHeight: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    marginTop: "0.5rem",
  },
  scratchEmoji: {
    fontSize: 48,
  },
  scratchBig: {
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
  },
  scratchPrize: {
    fontSize: 24,
    fontWeight: 700,
    color: "#3b6d11",
    margin: "6px 0 0",
  },
  rpsButtonRow: {
    display: "flex",
    gap: 8,
    marginTop: "1rem",
  },
  rpsButton: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "12px 8px",
  },
  notice: {
    fontSize: 13,
    color: "#993c1d",
    marginTop: 8,
  },
  moleStatusRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    fontWeight: 600,
    margin: "0.5rem 0",
  },
  moleStat: {
    color: "#5f5e5a",
  },
  moleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },
  moleHole: {
    aspectRatio: "1 / 1",
    borderRadius: "50%",
    border: "2px solid #d3d1c7",
    background: "#e1ddd0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  lateStartBox: {
    background: "#f4f1ea",
    border: "1px solid #d3d1c7",
    borderRadius: 16,
    padding: "1.25rem 1rem",
    textAlign: "center",
  },
  lateStartEmoji: {
    fontSize: 36,
    margin: "0 0 8px",
  },
  lateStartText: {
    fontSize: 12,
    color: "#5f5e5a",
    lineHeight: 1.8,
    margin: "0 0 1rem",
  },
  lateTopBar: {
    display: "flex",
    gap: 8,
    marginBottom: 8,
  },
  lateStat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    background: "#f4f1ea",
    borderRadius: 10,
    padding: "6px 10px",
  },
  lateStatLabel: {
    fontSize: 11,
    color: "#5f5e5a",
  },
  lateStatValue: {
    fontSize: 15,
    fontWeight: 700,
  },
  gaugeTrack: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    background: "#e1ddd0",
    overflow: "hidden",
  },
  gaugeFill: {
    height: "100%",
    background: "linear-gradient(90deg, #ffb86b, #ff6b6b)",
    borderRadius: 4,
    transition: "width 0.1s linear",
  },
  lateCanvasWrap: {
    position: "relative",
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #d3d1c7",
  },
  lateCanvas: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  lateOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: "rgba(20, 18, 30, 0.55)",
    color: "#fff",
    textAlign: "center",
    padding: "1rem",
  },
  lateOverlayTitle: {
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
  },
  lateOverlayScore: {
    fontSize: 13,
    margin: 0,
  },
  lateControls: {
    display: "flex",
    gap: 8,
    marginTop: 10,
  },
  lateJumpButton: {
    flex: 2,
    fontSize: 16,
    padding: "14px 16px",
  },
  ticketTypeRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    margin: "0.75rem 0",
  },
  ticketTypeButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "10px 6px",
    borderRadius: 12,
    border: "1px solid #d3d1c7",
    background: "#fff",
    cursor: "pointer",
    textAlign: "center",
  },
  ticketTypeButtonActive: {
    borderColor: "#26215c",
    background: "#f0eefc",
  },
  ticketTypeLabel: {
    fontSize: 13,
    fontWeight: 700,
  },
  ticketTypeCost: {
    fontSize: 13,
    fontWeight: 600,
    color: "#26215c",
  },
  ticketTypeDesc: {
    fontSize: 10,
    color: "#5f5e5a",
    lineHeight: 1.4,
  },
  outfitPreviewWrap: {
    display: "flex",
    justifyContent: "center",
    background: "#f4f1ea",
    borderRadius: 16,
    padding: "1rem 0",
    marginBottom: "0.75rem",
  },
  outfitRow: {
    marginBottom: "0.6rem",
  },
  outfitRowTitle: {
    fontSize: 13,
    fontWeight: 600,
    margin: "0 0 6px",
  },
  outfitOptionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },
  outfitOptionButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "8px 4px",
    borderRadius: 12,
    border: "1px solid #d3d1c7",
    background: "#fff",
    cursor: "pointer",
  },
  outfitOptionButtonActive: {
    borderColor: "#26215c",
    background: "#f0eefc",
  },
  outfitOptionEmoji: {
    fontSize: 20,
  },
  outfitOptionLabel: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 1.3,
  },
  outfitResultBox: {
    marginTop: "0.75rem",
    background: "#f4f1ea",
    borderRadius: 12,
    padding: "0.75rem 1rem",
    textAlign: "center",
  },
  outfitResultComment: {
    fontSize: 13,
    margin: "0 0 4px",
  },
  outfitResultCost: {
    fontSize: 16,
    fontWeight: 700,
    color: "#993c1d",
    margin: 0,
  },
};
