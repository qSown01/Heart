import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music,
  Music2,
  ChevronRight,
  ChevronLeft,
  X,
  Save,
  Sparkles,
  Volume2,
  SkipForward,
  SkipBack,
} from "lucide-react";
import AnimatedBackground from "./AnimatedBackground";

// ─────────────────────────────────────────────
// TELEGRAM CONFIGURATION
// ─────────────────────────────────────────────
const TELEGRAM_BOT_TOKEN = '[8924461334:AAHzRrtj3FLGyv6e_IK5PkzKtetqwQyhPKw]';
const TELEGRAM_CHAT_ID = '[8907434467]';

// ─────────────────────────────────────────────
// DATA: 36 questions by Arthur Aron (Vietnamese)
// ─────────────────────────────────────────────
const QUESTIONS_VN = {
  1: [
    'Nếu có thể mời bất kỳ ai trên thế giới đến dùng bữa tối, bạn sẽ chọn ai?',
    'Bạn có muốn nổi tiếng không? Nổi tiếng theo hướng nào?',
    'Trước khi gọi điện, bạn có tập nói trước những gì mình muốn nói không? Tại sao?',
    'Với bạn, một ngày hoàn hảo trong mơ trông như thế nào?',
    'Lần cuối bạn hát một mình là khi nào? Và hát cho ai nghe là khi nào?',
    'Nếu bạn có thể sống đến 90 tuổi, giữ nguyên tâm trí hoặc cơ thể của năm 30 tuổi trong 60 năm còn lại, bạn chọn cái nào?',
    'Bạn có linh cảm bí mật nào về cách mình sẽ ra đi không?',
    'Hãy kể 3 điểm mà bạn và tôi có vẻ giống nhau.',
    'Điều gì trong cuộc sống khiến bạn cảm thấy biết ơn nhất?',
    'Nếu được thay đổi một điều về cách bạn được nuôi dạy, bạn sẽ thay đổi điều gì?',
    'Hãy dành 4 phút kể cho tôi nghe câu chuyện cuộc đời bạn một cách chi tiết nhất có thể.',
    'Nếu ngày mai thức dậy và có thêm một tài năng hay khả năng nào đó, bạn muốn đó là gì?',
  ],
  2: [
    'Nếu có một quả cầu pha lê có thể cho bạn biết sự thật về bản thân, cuộc đời hay tương lai, bạn sẽ muốn biết điều gì?',
    'Có điều gì bạn từ lâu đã mơ ước làm nhưng chưa làm không? Tại sao bạn chưa làm?',
    'Thành tựu lớn nhất trong cuộc đời bạn là gì?',
    'Điều gì bạn trân trọng nhất trong một tình bạn?',
    'Kỷ niệm ấm áp nhất của bạn là gì?',
    'Mối quan hệ của bạn với cha mẹ như thế nào và mối quan hệ đó giống hay khác tuổi thơ của bạn?',
    'Bạn cảm thấy thế nào về mối quan hệ của bạn với mẹ?',
    'Hãy nói 3 điều đúng về chúng ta — ví dụ: Chúng ta đang ở trong căn phòng này và cảm thấy...',
    'Nếu bạn chết tối nay mà không có cơ hội liên lạc với bất kỳ ai, điều gì bạn hối tiếc nhất vì chưa nói với ai?',
    'Ngôi nhà của bạn bị cháy và tài sản, người thân, thú cưng đã an toàn — bạn còn 1 phút để lấy 1 thứ, bạn lấy gì?',
    'Trong gia đình, cái chết của thành viên nào sẽ làm bạn đau lòng nhất? Tại sao?',
    'Hãy chia sẻ một vấn đề cá nhân và hỏi đối phương cách họ sẽ giải quyết nó. Cũng hãy yêu cầu họ phản ánh lại cảm xúc của bạn.',
  ],
  3: [
    'Hãy hoàn thành câu này: Tôi ước có người tôi có thể chia sẻ về ___',
    'Nếu bạn sắp trở thành người bạn thân thiết của tôi, điều quan trọng nào tôi cần biết về bạn?',
    'Hãy cho tôi biết bạn thích gì ở tôi. Hãy thật lòng nói những điều bạn có thể không nói với người mới quen.',
    'Điều bạn xấu hổ nhất trong cuộc sống của mình là gì?',
    'Điều tồi tệ nhất mà bạn đã làm với ai đó là gì?',
    'Khi nào lần cuối bạn khóc trước mặt người khác? Và khóc một mình?',
    'Hãy nói với đối phương điều bạn đã thích ở họ từ lúc gặp mặt.',
    'Có điều gì quá nghiêm trọng để nói vui không? Nếu có thì là gì?',
    'Nếu bạn biết mình sẽ chết ngay trong một tiếng tới, bạn sẽ hối tiếc điều gì nhất? Bạn có muốn thay đổi cuộc sống của mình không?',
    'Tình thân hay tình bạn của bạn — người nào có ý nghĩa như thế nào với bạn?',
    'Hãy chia sẻ một điều cá nhân quan trọng với đối phương.',
    'Nhìn thẳng vào mắt đối phương trong 4 phút mà không nói gì.',
  ],
};

const LEVEL_INFO = {
  1: { title: 'Khởi Đầu', subtitle: 'Làm quen & Khám phá', emoji: '🌱', color: 'from-emerald-400 to-teal-400', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  2: { title: 'Gắn Kết', subtitle: 'Cảm xúc & Trải nghiệm', emoji: '🌼', color: 'from-amber-400 to-yellow-400', light: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  3: { title: 'Thấu Hiểu Sâu', subtitle: 'Thân mật & Điểm yếu', emoji: '🌸', color: 'from-rose-400 to-pink-400', light: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
};

// ─────────────────────────────────────────────
// Telegram Notification Helper
// ─────────────────────────────────────────────
const sendTelegramAnswer = async ({ level, questionIdx, question, answer }) => {
  try {
    const token = TELEGRAM_BOT_TOKEN.replace(/[\[\]]/g, '').trim();
    const chatId = TELEGRAM_CHAT_ID.replace(/[\[\]]/g, '').trim();
    if (!token || !chatId) return;

    const escapeHtml = (str) =>
      String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const timeStr = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const levelTitle = LEVEL_INFO[level]?.title || `Mức ${level}`;
    const questionNumber = (questionIdx ?? 0) + 1;

    const text =
      `🌻 <b>CÂU TRẢ LỜI MỚI TỪ HÀ!</b> 🌻\n\n` +
      `📌 <b>Mức độ:</b> Mức ${level} — ${levelTitle}\n` +
      `❓ <b>Câu hỏi ${questionNumber}/12:</b>\n<i>${escapeHtml(question)}</i>\n\n` +
      `💬 <b>Câu trả lời:</b>\n<b>${escapeHtml(answer)}</b>\n\n` +
      `⏰ <i>Thời gian: ${timeStr}</i>`;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.error('Lỗi khi gửi thông báo Telegram:', err);
  }
};

// ─────────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────────
const STORAGE_KEY = 'aron36_v3';

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

const defaultState = () => ({
  level: 1,
  shuffleOrder: {
    1: [...Array(12).keys()],
    2: [...Array(12).keys()],
    3: [...Array(12).keys()],
  },
  flipped: { 1: {}, 2: {}, 3: {} },
  answers: { 1: {}, 2: {}, 3: {} },
  shuffled: { 1: false, 2: false, 3: false },
});

const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ─────────────────────────────────────────────
// Floating Petals & Leaves
// ─────────────────────────────────────────────

// SVG shapes for petals, leaves, sparkles
function PetalShape({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="20" rx="8" ry="18" fill={color} opacity="0.85" />
    </svg>
  );
}
function LeafShape({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 4 Q36 20 20 36 Q4 20 20 4Z" fill={color} opacity="0.8" />
    </svg>
  );
}
function StarShape({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <polygon points="20,4 24,16 38,16 27,24 31,38 20,30 9,38 13,24 2,16 16,16" fill={color} opacity="0.75" />
    </svg>
  );
}
function SunflowerPetal({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="10" rx="5" ry="10" fill={color} opacity="0.85" />
      <ellipse cx="20" cy="10" rx="5" ry="10" fill={color} opacity="0.85" transform="rotate(45 20 20)" />
      <ellipse cx="20" cy="10" rx="5" ry="10" fill={color} opacity="0.85" transform="rotate(90 20 20)" />
      <ellipse cx="20" cy="10" rx="5" ry="10" fill={color} opacity="0.85" transform="rotate(135 20 20)" />
    </svg>
  );
}

// Pre-generate random particles outside component to avoid re-renders
const PETAL_COUNT = 28;
const PETALS_DATA = Array.from({ length: PETAL_COUNT }, (_, i) => {
  const types = ['petal', 'leaf', 'star', 'sunflower', 'petal', 'petal', 'leaf'];
  const colors = ['#fbbf24', '#f59e0b', '#fde68a', '#86efac', '#4ade80', '#fca5a5', '#fdba74', '#fef08a', '#d9f99d'];
  return {
    id: i,
    type: types[i % types.length],
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 18 + 10,
    startX: Math.random() * 110 - 5,     // % across screen, can start off-edge
    startY: -10 - Math.random() * 20,    // starts above screen
    fallDur: Math.random() * 8 + 7,      // 7–15s to fall
    swayAmp: Math.random() * 120 + 40,   // how far left/right it sways
    delay: Math.random() * 12,
    rotateEnd: Math.random() * 720 - 360,
    opacity: Math.random() * 0.4 + 0.45,
  };
});

function FallingPetal({ p }) {
  const shapes = {
    petal: <PetalShape size={p.size} color={p.color} />,
    leaf: <LeafShape size={p.size} color={p.color} />,
    star: <StarShape size={p.size * 0.8} color={p.color} />,
    sunflower: <SunflowerPetal size={p.size * 1.2} color={p.color} />,
  };
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${p.startX}%`, top: `${p.startY}%`, opacity: p.opacity }}
      animate={{
        y: ['0vh', '115vh'],
        x: [0, p.swayAmp, -p.swayAmp * 0.5, p.swayAmp * 0.3, 0],
        rotate: [0, p.rotateEnd],
        opacity: [0, p.opacity, p.opacity, 0],
      }}
      transition={{
        duration: p.fallDur,
        delay: p.delay,
        repeat: Infinity,
        ease: 'linear',
        times: [0, 0.1, 0.8, 1],
      }}
    >
      {shapes[p.type]}
    </motion.div>
  );
}

function FloatingPetals() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[2]">
      {PETALS_DATA.map((p) => (
        <FallingPetal key={p.id} p={p} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Drill Love Playlist (9 Tracks)
// ─────────────────────────────────────────────
const DRILL_LOVE_PLAYLIST = [
  { id: 1, title: '1. Ngày Mình Chia Tay', src: './audio/track1.mp3' },
  { id: 2, title: '2. Sao Mình Chưa Nắm Tay Nhau', src: './audio/track2.mp3' },
  { id: 3, title: '3. Hôm Qua Tôi Đã Khóc', src: './audio/track3.mp3' },
  { id: 4, title: '4. Thành Đô', src: './audio/track4.mp3' },
  { id: 5, title: '5. Vạn Vật Thay Đổi Vật Chất Lên Ngôi', src: './audio/track5.mp3' },
  { id: 6, title: '6. Hãy Để Em Đi', src: './audio/track6.mp3' },
  { id: 7, title: '7. Cánh Hoa Héo Tàn', src: './audio/track7.mp3' },
  { id: 8, title: '8. Có Một Người Vẫn Đợi', src: './audio/track8.mp3' },
  { id: 9, title: '9. Người Tốt Nhất Trên Đời', src: './audio/track9.mp3' },
];

function MusicPlayer() {
  const audioRef = useRef(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const currentTrack = DRILL_LOVE_PLAYLIST[trackIndex];

  // Play audio safely handling browser autoplay restrictions
  const startAudio = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      startAudio();
    }
  };

  const handleNextTrack = useCallback(() => {
    setTrackIndex((prev) => (prev + 1) % DRILL_LOVE_PLAYLIST.length);
  }, []);

  const handlePrevTrack = useCallback(() => {
    setTrackIndex((prev) => (prev - 1 + DRILL_LOVE_PLAYLIST.length) % DRILL_LOVE_PLAYLIST.length);
  }, []);

  // When track changes and was playing, load and play next
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.load();
    if (playing) {
      audioRef.current.play().catch(() => {});
    }
  }, [trackIndex]);

  const handleWelcomeClick = () => {
    setShowWelcome(false);
    startAudio();
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onEnded={handleNextTrack}
        preload="auto"
      />

      {/* Welcome Autoplay Overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: 'blur(8px)', background: 'rgba(20,10,0,0.38)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative backdrop-blur-2xl rounded-[32px] shadow-2xl px-8 py-9 flex flex-col items-center gap-5 max-w-[340px] w-full"
              style={{
                background: 'rgba(255,255,255,0.85)',
                border: '1.5px solid rgba(255,255,255,0.9)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              }}
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            >
              <div
                className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full opacity-40"
                style={{ background: 'radial-gradient(circle, #fde68a, transparent)', filter: 'blur(16px)' }}
              />

              <motion.div
                animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                className="text-6xl relative z-10"
              >
                🌻
              </motion.div>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-stone-800 leading-tight">
                  Hãy chơi 1 trò chơi nhỏ nhé:))))
                </h2>
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleWelcomeClick}
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white font-semibold px-8 py-3.5 rounded-2xl shadow-lg shadow-amber-200/60 flex items-center justify-center gap-2 text-sm"
              >
                <Music size={16} /> Bắt đầu thôi!
              </motion.button>

              <button
                onClick={() => setShowWelcome(false)}
                className="text-stone-400 text-xs hover:text-stone-500 transition-colors"
              >
                Bỏ qua nhạc
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Drill Love Floating Music Player ── */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center pointer-events-auto">
        <motion.div
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/88 backdrop-blur-xl border border-white/85 shadow-xl"
          style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)' }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Previous Track Button */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrevTrack}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-500 hover:text-amber-600 hover:bg-amber-50/80 transition-colors"
            title="Bài trước"
          >
            <SkipBack size={15} />
          </motion.button>

          {/* Main Play / Mute Toggle Button with Red Diagonal Slash */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={togglePlay}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/90 border border-amber-200/60 shadow-sm flex items-center justify-center relative overflow-hidden"
            title={playing ? 'Mute / Tắt nhạc' : 'Phát nhạc'}
          >
            {playing ? (
              /* Equalizer Waveform Bars when playing */
              <div className="flex items-end gap-[2.5px] h-4">
                {[0.6, 1.2, 0.7, 1.4, 0.5].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-[2.5px] bg-gradient-to-t from-amber-500 to-yellow-400 rounded-full"
                    animate={{ scaleY: [h * 0.35, h, h * 0.35] }}
                    transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
                    style={{ height: '16px', originY: 1 }}
                  />
                ))}
              </div>
            ) : (
              /* Distinct Red Diagonal Slash Mute Icon */
              <div className="relative w-5 h-5 flex items-center justify-center">
                <Volume2 size={18} className="text-stone-400" />
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <line
                    x1="3"
                    y1="3"
                    x2="21"
                    y2="21"
                    stroke="#ef4444"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
          </motion.button>

          {/* Next Track Button */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNextTrack}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-500 hover:text-amber-600 hover:bg-amber-50/80 transition-colors"
            title="Bài tiếp theo"
          >
            <SkipForward size={15} />
          </motion.button>

          {/* Current Track Information */}
          <div className="hidden sm:flex flex-col pr-1 select-none">
            <span className="text-[11px] font-bold text-stone-700 max-w-[170px] truncate leading-tight">
              {currentTrack.title}
            </span>
            <span className="text-[9.5px] text-amber-600 font-medium">
              Playlist Drill Love • {trackIndex + 1}/{DRILL_LOVE_PLAYLIST.length}
            </span>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Level Tabs
// ─────────────────────────────────────────────
function LevelTabs({ level, onLevel }) {
  return (
    <div className="flex items-center gap-2 p-1 backdrop-blur-xl rounded-2xl border border-white/70"
      style={{ background: 'rgba(255,255,255,0.75)', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
      {[1, 2, 3].map((lv) => {
        const info = LEVEL_INFO[lv];
        const isActive = level === lv;
        return (
          <motion.button
            key={lv}
            onClick={() => onLevel(lv)}
            whileTap={{ scale: 0.97 }}
            className={[
              'relative flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex-1 justify-center',
              isActive
                ? 'bg-white shadow-md text-stone-800'
                : 'text-stone-500 hover:text-stone-700',
            ].join(' ')}
          >
            <span className="text-base">{info.emoji}</span>
            <span>Mức {lv}</span>
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-white rounded-xl"
                style={{ zIndex: -1, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Progress Dots
// ─────────────────────────────────────────────
function ProgressDots({ flipped, total = 12 }) {
  const done = Object.keys(flipped || {}).filter((k) => flipped[k]).length;
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: total }, (_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              flipped?.[i] ? 'bg-amber-400' : 'bg-stone-200'
            }`}
            animate={flipped?.[i] ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
      <span className="text-xs text-stone-400 font-medium ml-1">{done}/{total}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Question Card — cleaner, more natural look
// ─────────────────────────────────────────────
const CARD_PATTERNS = ['✦ ✧ ✦', '◈ ◉ ◈', '❋ ❊ ❋', '⊹ ✶ ⊹', '❁ ✿ ❁', '⋆ ★ ⋆', '◇ ♦ ◇', '❧ ✾ ❧', '✺ ✹ ✺', '⊛ ✷ ⊛', '✵ ✴ ✵', '❃ ✽ ❃'];

function QuestionCard({ questionIdx, cardPos, level, isFlipped, answer, onFlip }) {
  const question = QUESTIONS_VN[level][questionIdx];
  const hasAnswer = answer && answer.trim().length > 0;
  const info = LEVEL_INFO[level];
  const imageNumber = (level - 1) * 12 + questionIdx + 1;

  return (
    <motion.div
      className="relative w-full cursor-pointer select-none pointer-events-auto"
      style={{ perspective: '1200px', aspectRatio: '3/4' }}
      onClick={() => onFlip(questionIdx)}
      whileHover={!isFlipped ? { y: -4, scale: 1.02 } : { scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      layout
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* ── BACK FACE (MẶT ÚP THEO BỘ 36 ẢNH) ── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-md border border-white/60 bg-gradient-to-br from-amber-100 to-yellow-50"
          style={{
            backfaceVisibility: 'hidden',
            boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
          }}
        >
          {/* 1. Ảnh bìa mặt úp riêng biệt cho từng câu 1-36 */}
          <img
            src={`./cards/card-${imageNumber}.jpg`}
            alt={`Card ${imageNumber}`}
            className="w-full h-full object-cover select-none"
            onError={(e) => {
              if (!e.currentTarget.src.includes('card-back.jpg')) {
                e.currentTarget.src = './card-back.jpg';
              } else {
                e.currentTarget.style.display = 'none';
              }
            }}
          />

          {/* 2. Lớp phủ gradient nhẹ giúp giữ độ tương phản sang trọng */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

          {/* 3. Huy hiệu số thứ tự lá bài nhỏ xinh ở góc trên bên trái */}
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-md shadow-sm border border-white/60 flex items-center gap-1 pointer-events-none">
            <span className="text-[11px] font-bold text-amber-600">#{cardPos + 1}</span>
          </div>

          {/* 4. Dòng chữ nhỏ tinh tế ở đáy lá bài */}
          <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none">
            <span className="text-[10px] font-medium text-white/90 drop-shadow-sm tracking-wider uppercase">
              Chạm để lật ✨
            </span>
          </div>
        </div>

        {/* ── FRONT FACE ── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(150deg, #ffffff, #fffbf0)',
            border: hasAnswer ? '1.5px solid rgba(251,191,36,0.5)' : '1.5px solid rgba(214,211,209,0.4)',
            boxShadow: hasAnswer
              ? '0 4px 20px rgba(251,191,36,0.15), inset 0 1px 0 rgba(255,255,255,0.9)'
              : '0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
          }}
        >
          <div className="w-full h-full flex flex-col items-start p-3.5 gap-2">
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-stone-300 tracking-widest uppercase">
                #{cardPos + 1}
              </span>
              {hasAnswer && (
                <motion.span
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-sm"
                >
                  🌸
                </motion.span>
              )}
            </div>

            <p className="text-stone-700 text-[11px] leading-relaxed font-medium flex-1"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 6,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
              {question}
            </p>

            {hasAnswer ? (
              <div className="w-full">
                <p className="text-stone-400 text-[10px] italic bg-stone-50 rounded-lg px-2 py-1.5 border border-stone-100 leading-relaxed"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                  {answer}
                </p>
              </div>
            ) : (
              <div className="w-full text-center py-1">
                <span className="text-amber-300/70 text-[9px] tracking-widest uppercase">nhấn để trả lời</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Question Modal
// ─────────────────────────────────────────────
function QuestionModal({ questionIdx, level, answer, onSave, onClose }) {
  const [text, setText] = useState(answer || '');
  const question = QUESTIONS_VN[level][questionIdx];
  const info = LEVEL_INFO[level];

  if (questionIdx === null) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backdropFilter: 'blur(16px)', background: 'rgba(28,25,23,0.2)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-md"
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 28,
            border: '1.5px solid rgba(255,255,255,0.9)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          }}
          initial={{ scale: 0.88, y: 24 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 16, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                {info.emoji} Mức {level} — {info.title}
              </span>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors flex items-center justify-center shrink-0 -mt-1"
              >
                <X size={14} className="text-stone-500" />
              </button>
            </div>
            <p className="text-stone-800 font-semibold text-base leading-snug">
              {question}
            </p>
          </div>

          <div className="h-px bg-stone-100 mx-6" />

          {/* Body */}
          <div className="px-6 py-5">
            <label className="block text-sm font-medium text-stone-500 mb-2.5">
              Câu trả lời / kỷ niệm của hai bạn
            </label>
            <textarea
              className="w-full rounded-2xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-stone-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent placeholder-stone-300 leading-relaxed transition-all"
              rows={5}
              placeholder="Viết câu trả lời hoặc ghi lại kỷ niệm nhỏ..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2.5 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSave(text)}
                className="flex-1 bg-gradient-to-r from-amber-400 to-yellow-400 text-white font-semibold py-3 rounded-2xl shadow-md shadow-amber-200/50 flex items-center justify-center gap-2 text-sm"
              >
                <Save size={15} /> Lưu lại
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="px-5 py-3 rounded-2xl border border-stone-200 text-stone-500 font-medium text-sm hover:bg-stone-50 transition-colors"
              >
                Bỏ qua
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────
export default function App() {
  const [appState, setAppState] = useState(() => {
    const saved = load();
    return saved || defaultState();
  });
  const [openCard, setOpenCard] = useState(null);

  const { level, shuffleOrder, flipped, answers, shuffled } = appState;
  const info = LEVEL_INFO[level];

  useEffect(() => {
    saveToStorage(appState);
  }, [appState]);

  const goToLevel = useCallback((lv) => {
    setAppState((prev) => {
      const next = { ...prev, level: lv };
      if (!prev.shuffled[lv]) {
        next.shuffleOrder = {
          ...prev.shuffleOrder,
          [lv]: shuffleArray([...Array(12).keys()]),
        };
        next.shuffled = { ...prev.shuffled, [lv]: true };
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!shuffled[level]) {
      goToLevel(level);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCardClick = (questionIdx) => {
    setOpenCard(questionIdx);
  };

  const handleSave = (text) => {
    setAppState((prev) => ({
      ...prev,
      flipped: {
        ...prev.flipped,
        [level]: { ...prev.flipped[level], [openCard]: true },
      },
      answers: {
        ...prev.answers,
        [level]: { ...prev.answers[level], [openCard]: text },
      },
    }));

    if (text && text.trim().length > 0 && openCard !== null) {
      const question = QUESTIONS_VN[level]?.[openCard];
      sendTelegramAnswer({
        level,
        questionIdx: openCard,
        question,
        answer: text.trim(),
      });
    }

    setOpenCard(null);
  };

  const currentOrder = shuffleOrder[level] || [...Array(12).keys()];
  const completedAll =
    Object.keys(flipped[level] || {}).filter((k) => flipped[level][k]).length === 12;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated illustrated sunflower field with day/night transition */}
      <AnimatedBackground />

      {/* Subtle vignette overlay so text/cards stay crisp in both day and night */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 25%, transparent 45%, rgba(0,0,0,0.15) 100%)',
        }}
      />

      <FloatingPetals />
      <MusicPlayer />

      <div className="relative z-[3] max-w-2xl mx-auto px-4 pt-10 pb-20 pointer-events-none">

        {/* ── Header ── */}
        <motion.div
          className="text-center mb-8 pointer-events-auto"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{ rotate: [0, 6, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-5xl mb-4 inline-block drop-shadow-lg"
          >
            🌻
          </motion.div>
          <h1
            className="text-3xl font-bold tracking-tight leading-tight drop-shadow-md"
            style={{ color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.4)' }}
          >
            Hãy chơi 1 trò chơi nhỏ nhé:))))
          </h1>
        </motion.div>

        {/* ── Level Tabs ── */}
        <motion.div
          className="mb-6 pointer-events-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <LevelTabs level={level} onLevel={goToLevel} />
        </motion.div>

        {/* ── Level Info Bar ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={level}
            className="mb-6 rounded-2xl p-4 pointer-events-auto"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(18px)',
              border: '1.5px solid rgba(255,255,255,0.9)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                  <span>{info.emoji}</span>
                  <span>Bốc 1 lá bài đi nào</span>
                </h2>
                <p className="text-stone-400 text-sm mt-0.5">{info.subtitle}</p>
              </div>
              <div className="flex gap-2">
                {level > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => goToLevel(level - 1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-stone-200 text-stone-500 text-sm font-medium hover:bg-white transition-colors shadow-sm"
                  >
                    <ChevronLeft size={15} /> Quay lại
                  </motion.button>
                )}
                {level < 3 && (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => goToLevel(level + 1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-white text-sm font-semibold shadow-md shadow-amber-200/50"
                  >
                    Tiếp theo <ChevronRight size={15} />
                  </motion.button>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-stone-100">
              <ProgressDots flipped={flipped[level]} />
            </div>

            {completedAll && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center gap-2 text-sm text-amber-600 font-semibold"
              >
                <Sparkles size={14} className="text-yellow-500" />
                Xong mức {level} rồi! 🎉
                {level < 3 && (
                  <button
                    onClick={() => goToLevel(level + 1)}
                    className="underline text-amber-500 ml-0.5 font-bold"
                  >
                    Lên mức {level + 1}?
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Cards Grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`grid-${level}`}
            className="grid grid-cols-3 gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
          >
            {currentOrder.map((questionIdx, cardPos) => (
              <motion.div
                key={`${level}-card-${cardPos}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: cardPos * 0.035, type: 'spring', damping: 22 }}
              >
                <QuestionCard
                  questionIdx={questionIdx}
                  cardPos={cardPos}
                  level={level}
                  isFlipped={!!flipped[level]?.[questionIdx]}
                  answer={answers[level]?.[questionIdx]}
                  onFlip={handleCardClick}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ── Space for enjoying the sunflower field and day/night scroll ── */}
        <div className="h-64 sm:h-80 pointer-events-none" />
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {openCard !== null && (
          <QuestionModal
            key="modal"
            questionIdx={openCard}
            level={level}
            answer={answers[level]?.[openCard]}
            onSave={handleSave}
            onClose={() => setOpenCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
