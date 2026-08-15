import { useState } from 'react';
import Home from './components/Home';
import ExamPage from './components/ExamPage';

function App() {
  const [page, setPage] = useState<'home' | 'exam'>('home');
  const [activeExamId, setActiveExamId] = useState<number>(1); // Add this state

  return (
    <>
      {page === 'home' && (
        <Home onNavigate={(examId) => {
          setActiveExamId(examId); // Set the clicked exam ID
          setPage('exam');         // Navigate to exam page
        }} />
      )}
      {page === 'exam' && (
        <ExamPage 
          activeExamId={activeExamId} // Pass it to ExamPage
          onNavigate={() => setPage('home')} 
        />
      )}
    </>
  );
}

export default App;