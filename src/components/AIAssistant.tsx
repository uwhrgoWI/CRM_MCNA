import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, BrainCircuit, ClipboardList, BookOpen, AlertCircle, Bot, User, HelpCircle, FileText, Check, Copy } from 'lucide-react';
import { User as UserType } from '../types';

interface AIAssistantProps {
  currentUser: UserType;
  toast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export function AIAssistant({ currentUser, toast }: AIAssistantProps) {
  // Common states
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Student Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      text: `Xin chào **${currentUser.name}**! Tôi là **LMS Pro AI Study Mentor** được xây dựng trên mô hình Gemini. Bạn cần tôi trợ giúp lập kế hoạch học tập môn SWE301, ôn tập bài tập .NET hay giải thích các lý thuyết bất đồng bộ nào hôm nay?`
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Teacher Syllabus States
  const [courseNameInput, setCourseNameInput] = useState('Xây Dựng Ứng Dụng Đám Mây AWS');
  const [courseDescInput, setCourseDescInput] = useState('Khóa học trang bị kiến thức về Serverless Lambda, cơ sở dữ liệu DynamoDB và triển khai hạ tầng CI/CD.');
  const [studentLevel, setStudentLevel] = useState('Intermediate');
  const [numModules, setNumModules] = useState(4);
  const [generatedSyllabus, setGeneratedSyllabus] = useState('');

  // Manager Insight States
  const [managerInsights, setManagerInsights] = useState('');

  // Pre-configured academic prompts for students
  const STUDENT_PROMPTS = [
    { title: 'Lộ trình Java Web', prompt: 'Hãy thiết kế cho tôi lộ trình 4 tuần tự học Java Web Core từ cơ bản đạt điểm A+' },
    { title: 'Giải thích Async/Await', prompt: 'Hãy giải thích khái niệm bất đồng bộ Async/Await trong JavaScript trực quan dễ hiểu kèm ví dụ' },
    { title: 'Kỹ năng Agile/Scrum', prompt: 'Cho tôi các tóm tắt thực hành Scrum lý thuyết chính hay xuất hiện nhất trong bài thi môn Software Engineering' }
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handler for student chat submit
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputVal;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map(m => ({ role: m.role, text: m.text })),
          context: {
            name: currentUser.name,
            role: currentUser.role,
            gpa: currentUser.gpa,
            major: currentUser.major
          }
        })
      });

      const data = await response.json();
      
      const replyMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        role: 'assistant',
        text: data.text || data.fallback
      };

      setMessages(prev => [...prev, replyMsg]);
    } catch (err) {
      console.error(err);
      toast('Không kết nối được server. Đã kích hoạt bản trả lời offline cố vấn học tập.', 'warning');
      const fallbackMsg: ChatMessage = {
        id: `reply-err-${Date.now()}`,
        role: 'assistant',
        text: "Chào bạn! LMS Pro AI hiện chưa được liên kết API key thực tế, nhưng dưới đây là lời khuyên hữu ích của tôi dành cho bạn: \n\n1. Hãy tổ chức thời gian học tập khoa học, dứt điểm từng chương lý thuyết môn học.\n2. Chia nhỏ đồ án phần mềm (Software Project) ra kiểm thử liên tục.\n3. Ôn tập kỹ các câu hỏi ôn tập chuyên ngành để cải thiện điểm số GPA."
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Handler for teacher syllabus generation
  const handleGenerateSyllabus = async () => {
    setLoading(true);
    setGeneratedSyllabus('');
    try {
      const res = await fetch('/api/gemini/course-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName: courseNameInput,
          description: courseDescInput,
          studentLevel,
          numModules
        })
      });
      const data = await res.json();
      setGeneratedSyllabus(data.content || data.fallback);
      toast('Đã phóng tác thành công giáo án phân bổ!', 'success');
    } catch (err) {
      toast('Lỗi kết nối API. Hiển thị tài liệu phác họa dự phòng.', 'warning');
      setGeneratedSyllabus(`### Đề cương Khóa Học Mẫu: ${courseNameInput} (Bản dự phòng)\n\n#### Khối 1: Giới thiệu AWS & Serverless Cloud\n- Tổng quan hệ sinh thái AWS.\n- Thực hành: Thiết lập IAM User và AWS CLI.\n- Quick Quiz: Trắc nghiệm 3 câu căn bản.\n\n#### Khối 2: Xử lý Logic với Lambda & DynamoDB\n- Lý thuyết mô hình Event-driven và NoSQL.\n- Thực hành: Triển khai REST API qua API Gateway và DynamoDB.`);
    } finally {
      setLoading(false);
    }
  };

  // Handler for manager insights analytics
  const handleGenerateInsights = async () => {
    setLoading(true);
    setManagerInsights('');
    try {
      const res = await fetch('/api/gemini/manager-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats: { revenue: '92.4 Triệu VND', uptime: '99.98%' },
          currentStaff: '20 cán bộ',
          totalStudents: 500
        })
      });
      const data = await res.json();
      setManagerInsights(data.insights || data.fallback);
      toast('Bản tin phân tích vận hành trung tâm đã sẵn sàng!', 'success');
    } catch (err) {
      toast('Lỗi kết nối. Tạo dự án phân tích kế hoạch giáo vụ dự phòng.', 'warning');
      setManagerInsights(`### Bình Luận & Sáng Kiến Vận Hành Trung Tâm (Offline-Fallback)\n\n1. **Chuẩn hóa khung năng lực giáo viên:** Triển khai trợ giảng số giúp giảm 25% thời gian thủ công chấm điểm.\n2. **Tối ưu tuyển sinh số:** Đẩy mạnh truyền thông gói học thử Software Engineering ngắn hạn.\n3. **Cảnh báo bỏ học sớm:** Nhờ hệ thống gửi tin tự động khi chuyên cần học đi xuống.`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast('Đã sao chép tài liệu vào khay nhớ tạm!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 min-h-[500px] flex flex-col justify-between">
      
      {/* 1. COMPONENT TITLE */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-indigo-50/60 shrink-0">
        <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
          <Sparkles className="w-5.5 h-5.5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span>Đồng Hành AI Copilot Đào Tạo</span>
            <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold animate-bounce">Gemini AI</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Một cải tiến toàn năng ứng dụng AI hỗ trợ tự học, kiến thiết giáo án và tư vấn vận hành.</p>
        </div>
      </div>

      {/* 2. ROLE CHANGER VIEWS */}

      {/* STUDENT STUDY ASSISTANT (CHAT INTERFACE) */}
      {currentUser.role === 'student' && (
        <div className="flex-1 flex flex-col justify-between gap-4 min-h-[400px]">
          {/* Messages list contain scroll */}
          <div className="flex-1 overflow-y-auto max-h-[350px] space-y-4 pr-1 scrollbar bg-slate-50/20 rounded-2xl p-4 border border-slate-50">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex gap-3.5 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  m.role === 'user' ? 'bg-indigo-600 text-white shadow-pro-md' : 'bg-slate-100 text-slate-600 border border-slate-150'
                }`}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-100 shadow-xs rounded-tl-none'
                }`}>
                  {/* Simplistic markdown line breaks formatter */}
                  {m.text.split('\n').map((line, lIdx) => {
                    // Check bold markers **text**
                    let formattedLine = line;
                    const boldRegex = /\*\*(.*?)\*\*/g;
                    const parts = [];
                    let lastIdx = 0;
                    let match;
                    
                    while ((match = boldRegex.exec(line)) !== null) {
                      if (match.index > lastIdx) {
                        parts.push(line.substring(lastIdx, match.index));
                      }
                      parts.push(<strong key={match.index} className={m.role === 'user' ? 'font-black text-white' : 'font-extrabold text-slate-900'}>{match[1]}</strong>);
                      lastIdx = boldRegex.lastIndex;
                    }
                    if (lastIdx < line.length) {
                      parts.push(line.substring(lastIdx));
                    }

                    return (
                      <p key={lIdx} className={lIdx > 0 ? 'mt-2' : ''}>
                        {parts.length > 0 ? parts : line}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3.5 max-w-[85%] mr-auto">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 border border-slate-150 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin text-indigo-600" />
                </div>
                <div className="p-3.5 rounded-2xl text-xs bg-white text-slate-400 border border-slate-100 shadow-xs rounded-tl-none flex items-center gap-1.5 font-medium">
                  <span>AI Study Assistant đang suy nghĩ kế sách...</span>
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Spark Suggestions */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Gợi ý câu hỏi đào sâu nhanh:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {STUDENT_PROMPTS.map((sm, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sm.prompt)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-[10.5px] transition text-left cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {sm.title}
                </button>
              ))}
            </div>
          </div>

          {/* Form write input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2 sticky bottom-0 bg-white pt-2 border-t border-slate-50 shrink-0"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Hỏi AI bất kỳ kiến thức khoa học, thuật toán hay mẹo nâng điểm GPA..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-45"
            >
              <Send className="w-4 h-4" />
              <span>Gửi</span>
            </button>
          </form>
        </div>
      )}


      {/* TEACHER CURRICULUM WRITER */}
      {currentUser.role === 'teacher' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
          {/* Params configuration input panel */}
          <div className="space-y-4 text-xs font-medium">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <BrainCircuit className="w-4.5 h-4.5 text-indigo-600" />
                <span>Cơ chế tham số bài bản</span>
              </h3>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tên môn học giảng dạy</label>
                <input
                  type="text"
                  value={courseNameInput}
                  onChange={(e) => setCourseNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mục tiêu & Tóm tắt mong muốn</label>
                <textarea
                  rows={2}
                  value={courseDescInput}
                  onChange={(e) => setCourseDescInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Đối tượng sinh viên</label>
                  <select
                    value={studentLevel}
                    onChange={(e) => setStudentLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="Beginner">Mới bắt đầu (Beginner)</option>
                    <option value="Intermediate">Đại cương (Intermediate)</option>
                    <option value="Advanced">Chuyên sâu (Advanced)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Số Module Giáo Trình</label>
                  <select
                    value={numModules}
                    onChange={(e) => setNumModules(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value={2}>2 tuần học</option>
                    <option value={4}>4 tuần học (Tiêu chuẩn)</option>
                    <option value={6}>6 tuần chuyên môn</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateSyllabus}
              disabled={loading || !courseNameInput.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-4.5 h-4.5" />
              <span>Phóng tác Chương Trình (AI Draft)</span>
            </button>
          </div>

          {/* Generated output board */}
          <div className="p-4 rounded-xl border border-indigo-150/50 bg-indigo-50/20 max-h-[380px] overflow-y-auto flex flex-col justify-between relative">
            {loading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col justify-center items-center gap-2.5">
                <BrainCircuit className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-xs font-bold text-indigo-900">AI Giáo Khoa đang phối hợp soạn giáo trình chất lượng...</p>
              </div>
            )}

            {!generatedSyllabus ? (
              <div className="flex flex-col justify-center items-center text-center h-full py-16 text-slate-400 space-y-3.5">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <FileText className="w-5.5 h-5.5 text-slate-400" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-600">Trống - Hãy cấu hình tham số biểu đồ lý thuyết</p>
                  <p className="text-[10px] mt-0.5 max-w-[220px]">Nhấp vào nút phóng tác để AI tạo lập chương trình môn học trực tuyến mẫu rành mạch.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-indigo-105 pb-2">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest flex items-center gap-1">
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>Đặc tả giáo án đào tạo từ AI</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedSyllabus)}
                    className="p-1 px-2 border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>

                {/* Markdown text formatter */}
                <div className="text-xs text-slate-700 leading-relaxed font-sans space-y-3 select-text select-all">
                  {generatedSyllabus.split('\n').map((line, idx) => {
                    if (line.startsWith('###')) {
                      return <h3 key={idx} className="text-sm font-extrabold text-slate-900 mt-4 border-b border-indigo-100 pb-1 uppercase">{line.replace('###', '').trim()}</h3>;
                    }
                    if (line.startsWith('####')) {
                      return <h4 key={idx} className="text-xs font-bold text-indigo-700 mt-3">{line.replace('####', '').trim()}</h4>;
                    }
                    if (line.startsWith('-')) {
                      return <li key={idx} className="ml-2.5 list-disc">{line.replace('-', '').trim()}</li>;
                    }
                    return <p key={idx}>{line}</p>;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANAGER & ADMIN ADVISORY BOARD */}
      {(currentUser.role === 'manager' || currentUser.role === 'admin') && (
        <div className="space-y-4 text-xs font-medium">
          <div className="p-4 rounded-xl bg-indigo-50/30 border border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                <BrainCircuit className="w-4.5 h-4.5 text-indigo-600" />
                <span>Báo Cáo Dự Báo & Tư Vấn Vận Hành (Executive Insights)</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Phân tích dòng học phí, hiệu quả nhân viên đào tạo và cơ chế gamification giữ chân sinh viên.</p>
            </div>
            
            <button
              onClick={handleGenerateInsights}
              disabled={loading}
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {loading ? <BrainCircuit className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Chạy Mô Hình Đề Xuất AI</span>
            </button>
          </div>

          <div className="p-4.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 relative min-h-[220px]">
            {loading && (
              <div className="absolute inset-0 bg-white/75 backdrop-blur-xs flex flex-col justify-center items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-600 animate-bounce" />
                <p className="text-[11px] font-bold text-slate-600">Mô hình phân tích Bayes của Gemini đang chạy giả lập báo cáo...</p>
              </div>
            )}

            {!managerInsights ? (
              <div className="flex flex-col justify-center items-center text-center py-10 text-slate-400 space-y-2">
                <span className="text-2xl animate-spin">⚙️</span>
                <p className="font-bold">Hệ cơ sở sẵn sàng</p>
                <p className="text-[10px] max-w-[280px]">Nhấp nút chạy mô hình để tổng hợp doanh thu đào tạo 92.4 triệu VND cùng phân bổ 500 sinh viên tại trung tâm.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Phương sỹ - Ba sáng kiến tối ưu từ Gemini 3.5</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(managerInsights)}
                    className="p-1 px-2 border border-slate-200 hover:bg-slate-50 text-[10px] rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã sao chép' : 'Copy'}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed font-sans space-y-2 select-all select-text">
                  {managerInsights.split('\n').map((line, idx) => {
                    if (line.startsWith('###')) {
                      return <h3 key={idx} className="text-xs font-extrabold text-slate-900 border-b border-indigo-50 pb-0.5 tracking-tight uppercase">{line.replace('###', '').trim()}</h3>;
                    }
                    if (line.match(/^\d+\./)) {
                      return <p key={idx} className="font-bold text-slate-800 mt-2.5">{line}</p>;
                    }
                    return <p key={idx} className="pl-4 text-slate-500">{line}</p>;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. API NOTIFICATION ADVISORY BAR */}
      <div className="p-3 bg-slate-50 border border-slate-100/60 rounded-xl text-[10px] text-slate-400 font-medium font-sans flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
        <p className="leading-normal">
          <strong>Thông báo An ninh:</strong> LMS Pro AI được tích hợp bằng mô hình <strong>Gemini 3.5 Flash</strong> máy chủ thực tế. Hệ thống tuân thủ mô thức lazy-init và tự khóa phiên độc lập nếu API key không hoạt động. Tất cả các kết nối được lưu trú an toàn qua proxy `/api/*` phía máy chủ, bảo mật khóa hoàn toàn chống rò rỉ trình duyệt.
        </p>
      </div>

    </div>
  );
}
