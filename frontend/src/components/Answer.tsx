import { useState, useRef } from 'react';
import { User, Plus } from 'lucide-react';

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

export default function AnswerPage({ onBack }: { onBack: () => void }) {
  const [isLocked, setIsLocked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isOpen = isLocked || isHovered;
  const [activeStudent, setActiveStudent] = useState<string | null>(null);
  
  // State for expandable rows
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const exams = [
    { id: 1, name: 'Exam 1', isActive: true },
    { id: 2, name: 'Exam 2', isActive: false },
    { id: 3, name: 'Exam 3', isActive: false },
  ];

  const rows = [
    { id: 1, text: 'Upload answer', status: 'uploaded' },
    { id: 2, text: 'Upload answer', status: 'uploaded' },
    { id: 3, text: 'Upload answer', status: null },
  ];

  const students = [
    { id: 1, name: 'John White' },
    { id: 2, name: 'Sarah Ann Jenkins' },
    { id: 3, name: 'Nikki Ross' }, // Updated name per screenshot
  ];

  // Mock data for the table inside the expanded row
  const mockAnswerItems = [
    { id: 1, text: 'Saya akan melakukan CT Scan Mastoid tanpa kontras.', grade: '0/5', note: 'Missing IV contrast' },
    { id: 2, text: 'Tampak adanya massa jaringan lunak di telinga tengah.', grade: '10/10', note: 'Correct' },
    { id: 3, text: 'Terdapat erosi pada tulang-tulang pendengaran.', grade: '10/10', note: 'Correct' },
  ];

  const formatTitle = (name: string | null) => {
    if (!name) return "Answer";
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 2) return `${name}'s Answer`;
    const first = parts[0];
    const last = parts[parts.length - 1];
    const middles = parts.slice(1, -1).map(p => `${p[0]}.`).join(' ');
    return `${first} ${middles} ${last}'s Answer`;
  };

  const handleFileChange = (rowId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      console.log(`Row ${rowId} uploaded:`, event.target.files[0].name);
      // Here you would typically handle the file upload to your backend
    }
  };

  return (
    <div className="relative min-h-screen w-screen flex items-start justify-center bg-[linear-gradient(180deg,#E9F0F3_0%,#A2A5AC_100%)] font-sans p-1 pt-16 overflow-hidden">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <div className="absolute top-[16px] left-[140px] right-[200px] z-20">
        <GlassSurface width="100%" height="47px" radius={15} opacity={0.1} shadowAlpha={1} />
      </div>

      {/* --- EXAM TABS --- */}
      <div className="absolute top-[16px] left-[140px] z-30 flex gap-0">
        {exams.map(exam => (
          <div key={exam.id} className="relative">
            <GlassSurface 
              width="278px" 
              height="47px" 
              radius={15} 
              opacity={exam.isActive ? 0.5 : 0.25} 
              shadowAlpha={1}
            />
            <div className="absolute inset-0 z-10 flex h-full items-center justify-between pl-10 pr-6">
              <span className={`font-['Inter',sans-serif] font-extralight text-[30px] ${exam.isActive ? 'text-black' : 'text-black/50'}`}>
                {exam.name}
              </span>
              <button 
                aria-label={`Close ${exam.name}`} 
                className="flex items-center justify-center text-black/60 hover:text-black transition-colors"
                onClick={() => console.log(`Closing ${exam.name}`)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- "<" BACK ICON --- */}
      <div className="absolute top-[75px] left-[10px] z-30 cursor-pointer opacity-80 transition-transform hover:-translate-x-1" onClick={onBack}>
        <svg 
          width="128" 
          height="128" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.05))' }}
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </div>

      {/* --- DYNAMIC ANSWER TITLE --- */}
      <div className="absolute top-[80px] left-1/2 -translate-x-1/2 z-10 [word-break:break-word] flex flex-col font-['Inter',sans-serif] font-light justify-center leading-[0] not-italic text-[40px] text-black text-center whitespace-nowrap">
        <p className="leading-[normal]">{formatTitle(activeStudent)}</p>
      </div>

      {/* --- MAIN CONTENT COLUMN --- */}
      <div className="flex flex-col items-start w-full gap-12">
        {rows.map((row, i) => (
          <div key={row.id} className={`flex flex-col items-start w-full ml-[140px] ${i === 0 ? 'mt-20' : ''}`}>
            
            {/* 1. THE PILL (CLICKABLE TO EXPAND) */}
            <div 
              onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
              className="flex items-center gap-[35px] cursor-pointer w-full"
            >
              {/* Number Circle */}
              <GlassSurface 
                width="79px" 
                height="79px" 
                radius={39.5} 
                opacity={0.5} 
                shadowAlpha={0.25} 
                blurRadius={10} 
                className="flex-shrink-0"
              >
                <span className="font-['Inter',sans-serif] font-light text-[48px] text-black">{row.id}</span>
              </GlassSurface>

              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={(el) => { fileInputRefs.current[row.id] = el; }}
                className="hidden" 
                accept=".pdf,.png,.jpg,.jpeg,.docx,.txt,.csv"
                onChange={(e) => handleFileChange(row.id, e)}
              />

              {/* The Ellipse Pill */}
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
                  
                  {/* Upload Answer Button (Stops propagation so it doesn't expand the row) */}
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      fileInputRefs.current[row.id]?.click();
                    }} 
                    className="font-['Inter',sans-serif] font-extralight text-[48px] text-black text-left hover:underline focus:outline-none"
                  >
                    {row.text}
                  </button>
                  
                  {row.status && (
                    <span className="font-['Inter',sans-serif] font-extralight text-[48px] text-[#00bf63] text-right">{row.status}</span>
                  )}
                </div>
              </GlassSurface>
            </div>

            {/* 2. THE EXPANDING CONTAINER (CSS Grid Trick for smooth height animation) */}
            <div className={`grid transition-all duration-500 ease-in-out ml-[114px] w-[1400px] ${expandedRow === row.id ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                {/* Expanded Content */}
                <GlassSurface 
                  width="100%" 
                  height="400px" 
                  radius={20} 
                  opacity={0.5} 
                  shadowAlpha={0.25} 
                  blurRadius={5} 
                  className="!flex-col !items-stretch !justify-start p-8"
                >
                  <h3 className="font-['Inter',sans-serif] font-light text-[32px] text-black mb-6">Extracted Answer Text</h3>
                  
                  {/* Mock Table */}
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between border-b border-[#E6E6E6]/50 pb-2 font-['Inter',sans-serif] font-normal text-[24px] text-black/50">
                      <span>Student Quote</span>
                      <span>Grade / Note</span>
                    </div>
                    {mockAnswerItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center font-['Inter',sans-serif] font-light text-[28px] text-black">
                        <span className="pr-4">{item.text}</span>
                        <span className="whitespace-nowrap">{item.grade} ({item.note})</span>
                      </div>
                    ))}
                  </div>

                </GlassSurface>
              </div>
            </div>

          </div>
        ))}

        {/* --- ROW 4: ADD QUESTION (+) --- */}
        <div className="flex items-center gap-[35px] ml-[140px]">
          <button 
            aria-label="Add question" 
            onClick={() => console.log('Add question')} 
            className="w-[79px] h-[79px] flex-shrink-0 cursor-pointer"
          >
            <GlassSurface 
              width="79px" 
              height="79px" 
              radius={39.5} 
              opacity={0.5} 
              shadowAlpha={0.25} 
              blurRadius={10}
            >
              <span className="font-['Inter',sans-serif] font-light text-[64px] text-black">+</span>
            </GlassSurface>
          </button>
        </div>
      </div>

      {/* --- HIDDEN RIGHT SIDEBAR --- */}
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsLocked(prev => !prev)}
        className={`absolute top-0 right-0 h-[calc(100vh-2rem)] my-4 z-40 w-[290px] transition-transform duration-300 ease-in-out cursor-pointer ${
          isOpen ? 'translate-x-0' : 'translate-x-[180px]'
        }`}
      >
        <GlassSurface 
          width="100%" 
          height="100%" 
          radius={20} 
          opacity={0.5} 
          shadowAlpha={1} 
          className="overflow-hidden"
        >
          {/* Changed to Flexbox layout to prevent overlapping on text wrap */}
          <div className="relative z-10 h-full w-full pt-5 pl-[21px] pr-[20px] flex flex-col">
            
            {/* Students Title - Aligned to the right dynamically */}
            <div className="absolute top-5 right-[20px] font-['Inter',sans-serif] font-extralight text-[32px] text-black whitespace-nowrap">
              Students
            </div>

            {/* Student Rows - Added top margin to clear the absolute title */}
            <div className="flex flex-col gap-4 mt-[55px]">
              {students.map((student) => (
                <div
                  key={student.id}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setActiveStudent(student.name); 
                  }}
                  className={`flex items-center gap-3 -m-1 p-1 rounded-md cursor-pointer transition-colors ${
                    activeStudent === student.name ? 'bg-[#1C60DF]' : 'hover:bg-gray-100'
                  }`}
                >
                  {/* Dynamic Numbering */}
                  <span className={`font-['Inter',sans-serif] font-thin text-[28px] w-[30px] text-center flex-shrink-0 ${
                    activeStudent === student.name ? 'text-white' : 'text-black'
                  }`}>
                    {student.id}
                  </span>
                  
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-500 flex-shrink-0">
                    <User className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                  
                  <span className={`font-['Inter',sans-serif] font-thin text-[28px] break-words ${
                    activeStudent === student.name ? 'text-white' : 'text-black'
                  }`}>
                    {student.name}
                  </span>
                </div>
              ))}

              {/* Add Student Button */}
              <button
                aria-label="Add student"
                onClick={(e) => { e.stopPropagation(); console.log('Add student'); }}
                className="flex items-center gap-3 -m-1 p-1 rounded-md cursor-pointer hover:bg-gray-100"
              >
                {/* Spacer to align with numbers above */}
                <span className="w-[30px] flex-shrink-0"></span>
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-500 flex-shrink-0">
                  <Plus className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
              </button>
            </div>

          </div>
        </GlassSurface>
      </div>

    </div>
  );
}