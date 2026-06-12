import React, { useState, useEffect } from "react";

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

function ScratchGame({ balance, adjustBalance, setMessage, setAloeFace }) {
  const TICKET_COST = 1000;
  const [revealing, setRevealing] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  function buyTicket() {
    if (balance < TICKET_COST) return;
    setRevealing(true);
    setLastResult(null);
    adjustBalance(-TICKET_COST);
    setMessage("복권을 긁는 중...");
    setAloeFace("idle");

    setTimeout(() => {
      const win = Math.random() < 0.3;
      if (win) {
        const prize = Math.floor(Math.random() * 4 + 1) * 1000; // 1000~4000 step
        const reward = 2000 + Math.floor(Math.random() * 3001); // 2000~5000
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
        1장당 {TICKET_COST.toLocaleString()}원. 당첨 확률 30%, 당첨 시
        2,000원~5,000원을 랜덤으로 받아요.
      </p>

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
        disabled={revealing || balance < TICKET_COST}
        onClick={buyTicket}
      >
        {revealing
          ? "긁는 중..."
          : `복권 구매 (${TICKET_COST.toLocaleString()}원)`}
      </button>
      {balance < TICKET_COST && (
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
      <ellipse cx="32" cy="38" rx="22" ry="20" fill="#8a5a3c" />
      <ellipse cx="32" cy="46" rx="16" ry="12" fill="#c98a5e" />
      <circle cx="23" cy="32" r="4" fill="#2c2c2a" />
      <circle cx="41" cy="32" r="4" fill="#2c2c2a" />
      <circle cx="24" cy="31" r="1.2" fill="#fff" />
      <circle cx="42" cy="31" r="1.2" fill="#fff" />
      <ellipse cx="32" cy="42" rx="5" ry="3.5" fill="#4a1b0c" />
      <path
        d="M27 47 Q32 51 37 47"
        stroke="#4a1b0c"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="14" cy="22" rx="5" ry="7" fill="#8a5a3c" />
      <ellipse cx="50" cy="22" rx="5" ry="7" fill="#8a5a3c" />
    </svg>
  );
}

const MOLE_ENTRY_COST = 500;
const MOLE_GAME_SECONDS = 15;
const MOLE_REWARD_PER_HIT = 150;

function MoleGame({ balance, adjustBalance, setMessage, setAloeFace }) {
  const [phase, setPhase] = useState("idle"); // idle | playing | done
  const [holes, setHoles] = useState(Array(9).fill(false));
  const [score, setScore] = useState(0);
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
        const next = Array(9).fill(false);
        const idx = Math.floor(Math.random() * 9);
        next[idx] = true;
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
    setTimeLeft(MOLE_GAME_SECONDS);
    setHoles(Array(9).fill(false));
    setPhase("playing");
    setMessage("배민지를 빠르게 잡아보세요!");
    setAloeFace("idle");
  }

  function finishGame() {
    setPhase("done");
    setHoles(Array(9).fill(false));
    const reward = score * MOLE_REWARD_PER_HIT;
    if (reward > 0) {
      adjustBalance(reward);
    }
    const net = reward - MOLE_ENTRY_COST;
    if (net > 0) {
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
    setScore((s) => s + 1);
    setHoles((prev) => {
      const next = [...prev];
      next[idx] = false;
      return next;
    });
  }

  return (
    <div>
      <h3 style={styles.gameTitle}>🟤 배민지 잡기</h3>
      <p style={styles.gameDesc}>
        참가비 {MOLE_ENTRY_COST.toLocaleString()}원. {MOLE_GAME_SECONDS}초
        동안 튀어나오는 배민지를 빠르게 클릭하세요. 1번 잡을 때마다{" "}
        {MOLE_REWARD_PER_HIT.toLocaleString()}원!
      </p>

      <div style={styles.moleStatusRow}>
        <span style={styles.moleStat}>점수: {score}</span>
        <span style={styles.moleStat}>
          남은 시간: {phase === "playing" ? timeLeft : MOLE_GAME_SECONDS}초
        </span>
      </div>

      <div style={styles.moleGrid}>
        {holes.map((up, idx) => (
          <button
            key={idx}
            style={styles.moleHole}
            onClick={() => whack(idx)}
            disabled={phase !== "playing"}
            aria-label={up ? "배민지 잡기" : "빈 구멍"}
          >
            {up && <BaeMinji size={36} />}
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
};
