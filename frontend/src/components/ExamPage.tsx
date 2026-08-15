import { useState, useRef } from 'react';
import { Home, PencilLine } from 'lucide-react';
import AnswerPage from './Answer';

// --- REUSABLE GLASS SURFACE COMPONENT ---
function GlassSurface({ 
  width, 
  height, 
  radius, 
  opacity = 0.5, 
  shadowAlpha = 1, 
  blurRadius = 5, 
  className = "", 
  children 
}: {
  width: string;
  height: string;
  radius: number;
  opacity?: number;
  shadowAlpha?: number;
  blurRadius?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{
        width,
        height,
        background: `rgba(255, 255, 255, ${opacity})`,
        border: `1px solid rgba(230, 230, 230, ${opacity})`,
        borderRadius: `${radius}px`,
        boxShadow: `0px 3px ${blurRadius}px rgba(0, 0, 0, ${opacity * shadowAlpha})`,
      }}
    >
      {children}
    </div>
  );
}

// --- LEFT SIDEBAR COMPONENT ---
function LeftSidebar({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="fixed top-4 left-4 h-[calc(100vh-2rem)] z-40 w-[100px]">
      <GlassSurface 
        width="100%" 
        height="100%" 
        radius={20} 
        opacity={0.3} 
        shadowAlpha={1} 
        className="overflow-hidden"
      >
        <div className="relative z-10 h-full w-full flex flex-col items-center overflow-hidden rounded-[20px]">
          <button 
            onClick={onNavigate} 
            className="flex-1 w-full flex items-center justify-center text-black hover:bg-[#1C60DF] hover:text-white transition-colors"
            aria-label="Home"
          >
            <Home size={24} strokeWidth={2} />
          </button>
          <button 
            className="flex-1 w-full flex items-center justify-center bg-[#1C60DF] text-white transition-colors border-t border-[#E6E6E6]/50"
            aria-label="Edit"
          >
            <PencilLine size={24} strokeWidth={2} />
          </button>
        </div>
      </GlassSurface>
    </div>
  );
}

// --- REUSABLE DYNAMIC TABLE COMPONENT ---
function RubricTable({ data }: { data: { headers: string[], rows: Record<string, string>[] } }) {
  if (!data || !data.headers || !data.rows) return null;

  return (
    <div className="w-full flex flex-col">
      {/* Table Headers */}
      <div className="flex items-center justify-between gap-12 border-b-2 border-[#E6E6E6] pb-4 mb-4">
        {data.headers.map((header, index) => (
          <span 
            key={header} 
            className={`font-['Inter',sans-serif] font-light text-[32px] text-black/70 ${index === 0 ? 'flex-1 text-left' : 'w-[200px] flex-shrink-0 text-right'}`}
          >
            {header}
          </span>
        ))}
      </div>

      {/* Table Rows with Lines */}
      <div className="flex flex-col">
        {data.rows.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className="flex items-center justify-between gap-12 border-b border-[#E6E6E6]/50 py-4 last:border-b-0"
          >
            {data.headers.map((header, colIndex) => (
              <span 
                key={header} 
                className={`font-['Inter',sans-serif] font-extralight text-[24px] text-black ${colIndex === 0 ? 'flex-1 text-left' : 'w-[200px] flex-shrink-0 text-right'}`}
              >
                {row[header]}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- RUBRIC PANEL ---
function RubricPanel({ onNavigate, onGoToAnswer, activeExamId }: { onNavigate: () => void, onGoToAnswer: () => void, activeExamId: number }) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [exams, setExams] = useState([
    { id: 1, name: 'Exam 1' },
    { id: 2, name: 'Exam 2' },
    { id: 3, name: 'Exam 3' },
  ]);
  const [activeId, setActiveId] = useState(activeExamId);
  
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const TAB_WIDTH = 278;

  const [dragState, setDragState] = useState<{ id: number | null; xOffset: number; startX: number }>({
    id: null,
    xOffset: 0,
    startX: 0,
  });

  const handleCloseTab = (id: number) => {
    const newExams = exams.filter(e => e.id !== id);
    setExams(newExams);
    if (activeId === id && newExams.length > 0) {
      setActiveId(newExams[0].id);
    }
  };

  const handleDragStart = (e: React.DragEvent, examId: number) => {
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
    setDragState({ id: examId, xOffset: 0, startX: e.clientX });
  };

  const handleDrag = (e: React.DragEvent) => {
    if (e.clientX === 0) return;
    const container = tabsContainerRef.current;
    if (!container || dragState.id === null) return;
    
    const mouseXRelative = e.clientX - container.getBoundingClientRect().left;
    let hoveredIndex = Math.floor(mouseXRelative / TAB_WIDTH);
    if (hoveredIndex < 0) hoveredIndex = 0;
    if (hoveredIndex >= exams.length) hoveredIndex = exams.length - 1;
    
    const draggedIndex = exams.findIndex(ex => ex.id === dragState.id);
    
    if (hoveredIndex !== draggedIndex && draggedIndex !== -1) {
      const newExams = [...exams];
      const draggedItem = newExams[draggedIndex];
      newExams.splice(draggedIndex, 1);
      newExams.splice(hoveredIndex, 0, draggedItem);
      setExams(newExams);

      const newStartX = dragState.startX + (hoveredIndex - draggedIndex) * TAB_WIDTH;
      setDragState(prev => ({ ...prev, startX: newStartX, xOffset: e.clientX - newStartX }));
    } else {
      setDragState(prev => ({ ...prev, xOffset: e.clientX - prev.startX }));
    }
  };

  const handleDragEnd = () => {
    setDragState({ id: null, xOffset: 0, startX: 0 });
  };

  const rows = [
    { id: 1, text: 'Upload rubric', status: 'uploaded' },
    { id: 2, text: 'Upload rubric', status: 'uploaded' },
    { id: 3, text: 'Upload rubric', status: null },
  ];

  // Updated mock data to match the image exactly
  const mockRubricData = {
    headers: ["Description", "Grade"],
    rows: [
      { Description: "CT Mastoid dengan kontras vena", Grade: "5" },
      { Description: "CT Mastoid dengan kontras vena", Grade: "5" },
      { Description: "CT Mastoid dengan kontras vena", Grade: "5" },
      { Description: "CT Mastoid dengan kontras vena", Grade: "5" },
      { Description: "CT Mastoid dengan kontras vena", Grade: "5" }
    ]
  };

  const handleFileChange = (rowId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      console.log(`Row ${rowId} uploaded:`, event.target.files[0].name);
    }
  };

  return (
    <div className="relative min-h-screen w-screen flex items-start justify-center bg-[linear-gradient(180deg,#E9F0F3_0%,#A2A5AC_100%)] font-sans p-1 pt-16 overflow-hidden">
      
      <div className="absolute top-[16px] left-[140px] right-[200px] z-20">
        <GlassSurface width="100%" height="47px" radius={15} opacity={0.1} shadowAlpha={1} />
      </div>

      <div 
        ref={tabsContainerRef}
        className="absolute top-[16px] left-[140px] z-30 flex gap-0"
        style={{ height: 47 }}
        onDragOver={(e) => e.preventDefault()}
      >
        {exams.map((exam, index) => (
          <div 
            key={exam.id} 
            className="relative cursor-grab active:cursor-grabbing"
            style={{
              width: TAB_WIDTH,
              height: '100%',
              transform: dragState.id === exam.id ? `translateX(${dragState.xOffset}px)` : 'none',
              transition: dragState.id === exam.id ? 'none' : 'transform 0.2s ease-in-out',
              zIndex: dragState.id === exam.id ? 20 : 10,
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, exam.id)}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onMouseDown={() => setActiveId(exam.id)}
          >
            <GlassSurface width="100%" height="47px" radius={15} opacity={activeId === exam.id ? 0.5 : 0.25} shadowAlpha={1} />
            <div className="absolute inset-0 z-10 flex h-full items-center justify-between pl-10 pr-6 pointer-events-none">
              <span className={`font-['Inter',sans-serif] font-extralight text-[30px] ${activeId === exam.id ? 'text-black' : 'text-black/50'}`}>
                {exam.name}
              </span>
              <button 
                draggable={false}
                aria-label={`Close ${exam.name}`} 
                className="flex items-center justify-center text-black/60 hover:text-black transition-colors pointer-events-auto p-1"
                onClick={(e) => { e.stopPropagation(); handleCloseTab(exam.id); }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute top-[75px] right-[10px] z-30 cursor-pointer opacity-80 transition-transform hover:translate-x-1" onClick={onGoToAnswer}>
        <svg width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.05))' }}>
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>

      <div className="absolute top-[80px] left-1/2 -translate-x-1/2 z-10 [word-break:break-word] flex flex-col font-['Inter',sans-serif] font-light justify-center leading-[0] not-italic text-[40px] text-black text-center whitespace-nowrap">
        <p className="leading-[normal]">Rubric</p>
      </div>

      <div className="flex flex-col items-start w-full gap-12">
        {rows.map((row, i) => (
          <div key={row.id} className={`flex flex-col items-start w-full ml-[140px] ${i === 0 ? 'mt-20' : ''}`}>
            
            <div 
              onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
              className="flex items-center gap-[35px] cursor-pointer w-full"
            >
              <GlassSurface width="79px" height="79px" radius={39.5} opacity={0.5} shadowAlpha={0.25} blurRadius={10} className="flex-shrink-0">
                <span className="font-['Inter',sans-serif] font-light text-[48px] text-black">{row.id}</span>
              </GlassSurface>

              <input type="file" ref={(el) => { fileInputRefs.current[row.id] = el; }} className="hidden" accept=".pdf,.png,.jpg,.jpeg,.docx,.txt,.csv" onChange={(e) => handleFileChange(row.id, e)} />

              <GlassSurface 
                width="1400px" 
                height="79px" 
                radius={39.5} 
                opacity={0.5} 
                shadowAlpha={0.25} 
                blurRadius={5}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
              >
                <div className="flex items-center justify-between w-full px-[40px]">
                  <button 
                    onClick={(e) => { e.stopPropagation(); fileInputRefs.current[row.id]?.click(); }} 
                    className="font-['Inter',sans-serif] font-extralight text-[48px] text-black text-left hover:underline focus:outline-none"
                  >
                    {row.text}
                  </button>
                  {row.status && <span className="font-['Inter',sans-serif] font-extralight text-[48px] text-[#00bf63] text-right">{row.status}</span>}
                </div>
              </GlassSurface>
            </div>

            <div className={`grid transition-all duration-500 ease-in-out ml-[114px] w-[1400px] ${expandedRow === row.id ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <GlassSurface 
                  width="100%" 
                  height="400px" 
                  radius={20} 
                  opacity={0.5} 
                  shadowAlpha={0.25} 
                  blurRadius={5} 
                  className="!flex-col !items-stretch !justify-start p-8"
                >
                  <RubricTable data={mockRubricData} />
                </GlassSurface>
              </div>
            </div>

          </div>
        ))}

        <div className="flex items-center gap-[35px] ml-[140px]">
          <button aria-label="Add question" onClick={() => console.log('Add question')} className="w-[79px] h-[79px] flex-shrink-0 cursor-pointer">
            <GlassSurface width="79px" height="79px" radius={39.5} opacity={0.5} shadowAlpha={0.25} blurRadius={10}>
              <span className="font-['Inter',sans-serif] font-light text-[64px] text-black">+</span>
            </GlassSurface>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN EXAM PAGE ---
export default function ExamPage({ onNavigate, activeExamId }: { onNavigate: () => void, activeExamId: number }) {
  const [view, setView] = useState<'exam' | 'answer'>('exam');

  return (
    <div className="relative w-screen min-h-screen bg-[linear-gradient(180deg,#E9F0F3_0%,#A2A5AC_100%)] font-sans overflow-x-hidden">
      {view === 'exam' && <LeftSidebar onNavigate={onNavigate} />}
      <div className="flex w-screen min-h-screen overflow-hidden">
        <div className={`w-screen min-h-screen flex-shrink-0 transition-transform duration-500 ease-in-out ${view === 'answer' ? '-translate-x-full' : 'translate-x-0'}`}>
          <RubricPanel activeExamId={activeExamId} onNavigate={onNavigate} onGoToAnswer={() => setView('answer')} />
        </div>
        <div className={`w-screen min-h-screen flex-shrink-0 transition-transform duration-500 ease-in-out ${view === 'answer' ? '-translate-x-full' : 'translate-x-0'}`}>
          <AnswerPage onBack={() => setView('exam')} />
        </div>
      </div>
    </div>
  );
}