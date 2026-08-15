import { useState, useRef, useEffect, useMemo } from 'react';
import { Home, PencilLine, ChevronRight, Check } from 'lucide-react';

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

// Helper to format ISO date to "14th June"
const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString + 'T00:00:00');
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const suffix = (day >= 11 && day <= 13) ? 'th' : ['st', 'nd', 'rd'][day % 10 - 1] || 'th';
  return `${day}${suffix} ${month}`;
};

export default function HomePage({ onNavigate }: { onNavigate: (examId: number) => void }) {
  const [openMenu, setOpenMenu] = useState<'view' | 'sort' | null>(null);
  const [viewSelection, setViewSelection] = useState('Regular');
  const [sortSelection, setSortSelection] = useState('Newest');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamDesc, setNewExamDesc] = useState('');
  const [newExamDueDate, setNewExamDueDate] = useState('');

  // State for exam cards
  const [examCards, setExamCards] = useState([
    { id: 1, title: 'Exam 1', desc: 'Description', dueDate: '2024-06-14', postedDate: '2024-05-27' },
    { id: 2, title: 'Exam 2', desc: 'Description', dueDate: '2024-06-07', postedDate: '2024-05-27' },
    { id: 3, title: 'Exam 3', desc: 'Description', dueDate: '2024-06-09', postedDate: '2024-05-27' },
    { id: 4, title: 'Exam 4', desc: 'Description', dueDate: '2024-06-12', postedDate: '2024-05-27' },
    { id: 5, title: 'Exam 5', desc: 'Description', dueDate: '2024-06-21', postedDate: '2024-05-27' },
    { id: 6, title: 'Exam 6', desc: 'Description', dueDate: '2024-06-24', postedDate: '2024-05-27' },
  ]);

  // Sorting Logic
  const sortedCards = useMemo(() => {
    const cards = [...examCards];
    if (sortSelection === 'Newest') {
      return cards.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
    } else if (sortSelection === 'Oldest') {
      return cards.sort((a, b) => new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime());
    } else if (sortSelection === 'Closest deadline') {
      return cards.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    } else if (sortSelection === 'Furthest deadline') {
      return cards.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    }
    return cards;
  }, [examCards, sortSelection]);

  // Ref and Effect for clicking outside or pressing ESC to close menus
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setIsModalOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleCreateExam = () => {
    if (!newExamName || !newExamDueDate) return; // Basic validation

    const today = new Date().toISOString().split('T')[0];
    const newCard = {
      id: Date.now(), // Unique ID
      title: newExamName,
      desc: newExamDesc || 'Description',
      dueDate: newExamDueDate,
      postedDate: today,
    };

    setExamCards([...examCards, newCard]);
    
    // Reset form and close modal
    setNewExamName('');
    setNewExamDesc('');
    setNewExamDueDate('');
    setIsModalOpen(false);
  };

  return (
    <div className="relative min-h-screen w-screen bg-[linear-gradient(180deg,#E9F0F3_0%,#A2A5AC_100%)] font-sans p-1 pt-16 overflow-x-hidden">
      
      {/* --- LEFT SIDEBAR --- */}
      <div className="fixed top-0 left-0 h-[calc(100vh-2rem)] my-4 ml-4 z-40 w-[100px]">
        <GlassSurface 
          width="100%" 
          height="100%" 
          radius={20} 
          opacity={0.3} 
          shadowAlpha={1} 
          className="overflow-hidden"
        >
          <div className="relative z-10 h-full w-full flex flex-col items-center overflow-hidden rounded-[20px]">
            <button className="flex-1 w-full flex items-center justify-center bg-[#1C60DF] text-white transition-colors" aria-label="Home">
              <Home size={24} strokeWidth={2} />
            </button>
            <button 
              onClick={() => onNavigate(1)} // Defaulting to 1 if they use the sidebar
              className="flex-1 w-full flex items-center justify-center text-black hover:bg-[#1C60DF] hover:text-white transition-colors border-t border-[#E6E6E6]/50" 
              aria-label="Edit"
            >
              <PencilLine size={24} strokeWidth={2} />
            </button>
          </div>
        </GlassSurface>
      </div>

      {/* --- MAIN CONTENT GROUP --- */}
      <div className="w-[1077px] mx-auto">
        
        {/* --- VIEW & SORT BUTTONS --- */}
        <div ref={menuRef} className="flex justify-start gap-12 mb-[100px] relative">
          
          {/* View Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setOpenMenu(openMenu === 'view' ? null : 'view')}
              className="flex items-center gap-2 font-['Inter',sans-serif] font-light text-[32px] text-black text-left"
            >
              View
              <ChevronRight 
                size={24} 
                className={`transition-transform duration-300 ${openMenu === 'view' ? 'rotate-90' : ''}`} 
              />
            </button>
            
            <div className={`absolute top-[50px] left-0 z-50 transition-opacity duration-200 ${openMenu === 'view' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <GlassSurface 
                width="220px" 
                height="80px" 
                radius={15} 
                opacity={1} 
                shadowAlpha={0.25} 
                blurRadius={5} 
                className="!flex-col !items-stretch !justify-start p-2 gap-1"
              >
                <button 
                  onClick={() => { setViewSelection('Regular'); setOpenMenu(null); }} 
                  className={`flex items-center justify-between px-4 py-1 text-[20px] leading-none font-['Inter',sans-serif] font-normal rounded-md transition-colors ${
                    viewSelection === 'Regular' ? 'bg-[#1C60DF] text-white' : 'text-black hover:bg-[#1C60DF] hover:text-white'
                  }`}
                >
                  Regular
                  {viewSelection === 'Regular' && <Check size={20} />}
                </button>
                <button 
                  onClick={() => { setViewSelection('Calendar'); setOpenMenu(null); }} 
                  className={`flex items-center justify-between px-4 py-1 text-[20px] leading-none font-['Inter',sans-serif] font-normal rounded-md transition-colors ${
                    viewSelection === 'Calendar' ? 'bg-[#1C60DF] text-white' : 'text-black hover:bg-[#1C60DF] hover:text-white'
                  }`}
                >
                  Calendar
                  {viewSelection === 'Calendar' && <Check size={20} />}
                </button>
              </GlassSurface>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setOpenMenu(openMenu === 'sort' ? null : 'sort')}
              className="flex items-center gap-2 font-['Inter',sans-serif] font-light text-[32px] text-black text-left"
            >
              Sort
              <ChevronRight 
                size={24} 
                className={`transition-transform duration-300 ${openMenu === 'sort' ? 'rotate-90' : ''}`} 
              />
            </button>

            <div className={`absolute top-[50px] left-0 z-50 transition-opacity duration-200 ${openMenu === 'sort' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <GlassSurface 
                width="260px" 
                height="140px" 
                radius={15} 
                opacity={1} 
                shadowAlpha={0.25} 
                blurRadius={5} 
                className="!flex-col !items-stretch !justify-start p-2 gap-1"
              >
                <button 
                  onClick={() => { setSortSelection('Newest'); setOpenMenu(null); }} 
                  className={`flex items-center justify-between px-4 py-1 text-[20px] leading-none font-['Inter',sans-serif] font-normal rounded-md transition-colors ${
                    sortSelection === 'Newest' ? 'bg-[#1C60DF] text-white' : 'text-black hover:bg-[#1C60DF] hover:text-white'
                  }`}
                >
                  Newest
                  {sortSelection === 'Newest' && <Check size={20} />}
                </button>
                <button 
                  onClick={() => { setSortSelection('Oldest'); setOpenMenu(null); }} 
                  className={`flex items-center justify-between px-4 py-1 text-[20px] leading-none font-['Inter',sans-serif] font-normal rounded-md transition-colors ${
                    sortSelection === 'Oldest' ? 'bg-[#1C60DF] text-white' : 'text-black hover:bg-[#1C60DF] hover:text-white'
                  }`}
                >
                  Oldest
                  {sortSelection === 'Oldest' && <Check size={20} />}
                </button>
                <button 
                  onClick={() => { setSortSelection('Closest deadline'); setOpenMenu(null); }} 
                  className={`flex items-center justify-between px-4 py-1 text-[20px] leading-none font-['Inter',sans-serif] font-normal rounded-md transition-colors ${
                    sortSelection === 'Closest deadline' ? 'bg-[#1C60DF] text-white' : 'text-black hover:bg-[#1C60DF] hover:text-white'
                  }`}
                >
                  Closest deadline
                  {sortSelection === 'Closest deadline' && <Check size={20} />}
                </button>
                <button 
                  onClick={() => { setSortSelection('Furthest deadline'); setOpenMenu(null); }} 
                  className={`flex items-center justify-between px-4 py-1 text-[20px] leading-none font-['Inter',sans-serif] font-normal rounded-md transition-colors ${
                    sortSelection === 'Furthest deadline' ? 'bg-[#1C60DF] text-white' : 'text-black hover:bg-[#1C60DF] hover:text-white'
                  }`}
                >
                  Furthest deadline
                  {sortSelection === 'Furthest deadline' && <Check size={20} />}
                </button>
              </GlassSurface>
            </div>
          </div>
        </div>

        {/* --- CARDS GRID --- */}
        <div className="grid grid-cols-3 gap-x-[51px] gap-y-[46px] pb-[120px]">
          {sortedCards.map((card) => (
            <div key={card.id} className="flex justify-center">
              {/* Wrapped card in a button to make it pressable */}
              <button 
                onClick={() => onNavigate(card.id)}
                className="cursor-pointer hover:scale-[1.02] transition-transform"
                aria-label={`Open ${card.title}`}
              >
                <GlassSurface 
                  width="325px" 
                  height="325px" 
                  radius={20} 
                  opacity={0.5} 
                  shadowAlpha={0.25} 
                  blurRadius={5} 
                  className="relative"
                >
                  <div className="relative z-10 h-full w-full flex flex-col items-center pt-[18px] overflow-hidden rounded-[20px]">
                    <span className="font-['Inter',sans-serif] font-light text-[48px] text-black text-center w-full">
                      {formatDate(card.dueDate)}
                    </span>
                    <div className="w-full h-[1px] mt-[14px] bg-[#E6E6E6]/50" />
                    <span className="font-['Inter',sans-serif] font-light text-[40px] text-black text-left w-full px-[24px] mt-[20px]">
                      {card.title}
                    </span>
                    <span className="font-['Inter',sans-serif] font-extralight text-[36px] text-black text-left w-full px-[24px]">
                      {card.desc}
                    </span>
                    <span className="font-['Inter',sans-serif] font-extralight text-[24px] text-black text-center w-full mt-auto pb-[24px]">
                      🕒 Posted on {formatDate(card.postedDate)}
                    </span>
                  </div>
                </GlassSurface>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* --- ADD NEW EXAM BUTTON --- */}
      <button 
        className="fixed bottom-[40px] right-[40px] z-50 cursor-pointer" 
        aria-label="Add New Exam" 
        onClick={() => setIsModalOpen(true)}
      >
        <GlassSurface width="160px" height="54px" radius={27} opacity={0.4} shadowAlpha={1} blurRadius={5}>
          <span className="text-[24px] font-extralight text-black font-['Inter',sans-serif]">Add New +</span>
        </GlassSurface>
      </button>

      {/* --- ADD NEW EXAM MODAL --- */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsModalOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="relative">
            <GlassSurface 
              width="654px" 
              height="654px" 
              radius={20} 
              opacity={1} 
              shadowAlpha={0.25} 
              blurRadius={5} 
              className="!flex-col !items-stretch !justify-start p-10"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-black/60 hover:text-black transition-colors"
                aria-label="Close modal"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </button>

              {/* Modal Form Content */}
              <h2 className="font-['Inter',sans-serif] font-extralight text-[40px] text-black mb-8">New Exam</h2>
              
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-['Inter',sans-serif] font-extralight text-[24px] text-black/100">Exam Name</label>
                  <input 
                    type="text" 
                    value={newExamName}
                    onChange={(e) => setNewExamName(e.target.value)}
                    className="bg-transparent border-b border-[#E6E6E6] py-2 text-[28px] font-['Inter',sans-serif] font-light text-black focus:outline-none focus:border-[#1C60DF] transition-colors" 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-['Inter',sans-serif] font-extralight text-[24px] text-black/100">Description</label>
                  <input 
                    type="text" 
                    value={newExamDesc}
                    onChange={(e) => setNewExamDesc(e.target.value)}
                    className="bg-transparent border-b border-[#E6E6E6] py-2 text-[28px] font-['Inter',sans-serif] font-light text-black focus:outline-none focus:border-[#1C60DF] transition-colors" 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-['Inter',sans-serif] font-extralight text-[24px] text-black/100">Due Date</label>
                  <input 
                    type="date" 
                    value={newExamDueDate}
                    onChange={(e) => setNewExamDueDate(e.target.value)}
                    className="bg-transparent border-b border-[#E6E6E6] py-2 text-[28px] font-['Inter',sans-serif] font-light text-black focus:outline-none focus:border-[#1C60DF] transition-colors" 
                  />
                </div>
              </div>

              {/* Create Button */}
              <div className="mt-auto flex justify-end">
                <button 
                  onClick={handleCreateExam}
                  className="bg-[#1C60DF] text-white px-8 py-3 rounded-full text-[24px] font-['Inter',sans-serif] font-light hover:bg-blue-700 transition-colors"
                >
                  Create Exam
                </button>
              </div>
            </GlassSurface>
          </div>
        </div>
      )}

    </div>
  );
}