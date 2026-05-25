import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Resilient Lazy initialization of Gemini client to avoid crash if API key is not yet set
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environments. Please configure it in your Secrets menu.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// -------------------------------------------------------------
// AI API ENDPOINTS
// -------------------------------------------------------------

// 1. Web Mentor AI (Student-centric tutoring companion)
app.post("/api/gemini/mentor", async (req, res) => {
  try {
    const { message, history, context } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = 
      "You are 'LMS Pro AI Study Mentor', an elite academic virtual supervisor. " +
      "You guide students on software engineering, IT, and other subjects. " +
      "Respond in a very direct, academic, encouraging, and clear tone using well-structured markdown. " +
      "If applicable, structure your feedback using bullet points and brief code examples if coding related." +
      ` Student context if any: ${JSON.stringify(context || {})}.` +
      " Keep answers concise but intellectually deep. Always answer in Vietnamese unless requested otherwise.";

    // Convert history format if present, otherwise send a combined payload
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text }]
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Mentor AI error:", error);
    res.status(500).json({ 
      error: error.message || "Something went wrong",
      fallback: "Chào bạn! Tôi là LMS Pro AI Study Mentor. Hệ thống hiện chưa được ghim kết nối API Gemini thực tế, hoặc mã key trợ lý đang khởi tạo. Tuy nhiên, tôi khuyên bạn nên tập trung vào việc bố trí lịch học tối ưu, chia nhỏ mục tiêu đồ án phần mềm (Software Project) và ôn luyện cấu trúc dữ liệu cơ bản để gia tăng GPA hiệu quả!"
    });
  }
});

// 2. Curriculum AI Draft Engine (Teacher-centric assistance tool)
app.post("/api/gemini/course-generator", async (req, res) => {
  const { courseName, description, studentLevel, numModules } = req.body || {};
  try {
    const ai = getGeminiClient();

    const prompt = `Hãy thiết kế một đề cương chi tiết môn học chất lượng cao có tên: "${courseName || 'Khóa học bổ khuyết'}".
Mô tả môn học: "${description || 'Môn học cơ bản thuộc khung chương trình đào tạo chính quy'}".
Đối tượng người học: học sinh/sinh viên trình độ "${studentLevel || 'Mọi trình độ'}".
Yêu cầu thiết lập gồm đúng ${numModules || 4} khối chương trình mục tiêu (modules) hoàn chỉnh.
Với mỗi khối chương trình (module), cung cấp:
- Tên module hấp dẫn, trực quan.
- Tóm tắt 2-3 kiến thức cốt lõi.
- 01 Bài tập thực hành mẫu (Assignment) liên quan kèm hướng dẫn chấm điểm nhanh.
- Gợi ý câu hỏi kiểm tra nhanh (quiz) trắc nghiệm 3 câu hỏi kèm đáp án giải thích sơ bộ.

Hãy xuất kết quả bằng Markdown sinh động đẹp mắt, phân cấp rõ ràng bằng các tiêu đề h3, h4, ranh giới kẻ ngang. Trả lời bằng tiếng Việt.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert curriculum designer and senior university professor. You create rigorous, modern courses with clear milestones and precise instructions.",
        temperature: 0.8,
      }
    });

    res.json({ content: response.text });
  } catch (error: any) {
    console.error("Course Generator error:", error);
    res.status(500).json({ 
      error: error.message || "Something went wrong",
      fallback: `### Đọc Đề Cương Khóa Học Mẫu: ${courseName || 'AWS Cloud'} (Bản dự phòng)\n\n*Hệ thống đang chạy chế độ Offline. Dưới đây là khung quy chuẩn đề cương gợi ý:*\n\n#### Khối 1: Cơ bản và Thiết lập nền tảng\n- **Nội dung:** Tổng quan lý thuyết cốt lõi, cài đặt môi trường làm việc.\n- **Thực hành:** Cấu hình thành công bộ khung đồ án chính của môn học.\n\n#### Khối 2: Thực kỹ và Phát triển chuyên sâu\n- **Nội dung:** Đi sâu giải quyết các bài toán tuần tự, xử lý bất đồng bộ hoặc nghiệp vụ phức tạp.\n- **Thực hành:** Viết mã tối ưu hóa hiệu năng, xây dựng tài liệu API đặc tả.`
    });
  }
});

// 3. Manager Performance & Financial Advisor AI
app.post("/api/gemini/manager-insights", async (req, res) => {
  try {
    const { stats, currentStaff, totalStudents } = req.body;
    const ai = getGeminiClient();

    const prompt = `Với tư cách cố vấn chiến lược trung tâm đào tạo, phân tích nhanh bộ dữ liệu hiện trạng sau để đề xuất 3 giải pháp cải tiến hiệu suất vận hành và doanh thu tài khóa:
- Tổng số học viên/mọi người: ${totalStudents || 500} người.
- Quy mô nhân lực giáo vụ & quản lý: ${currentStaff || '20'} cán bộ.
- Doanh thu học phí ước tính (Tháng): ${stats.revenue || '92.4 Tr VNĐ'}.
- Tỉ lệ hoạt động máy chủ LMS: ${stats.uptime || '99.98%'}.
- Phân khúc môn học chính: Công nghệ phần mềm (SWE), Khoa học dữ liệu (Data Science), Thiết kế đồ họa, Marketing số.

Hãy đưa ra bình luận và 3 sáng kiến độc quyền ngắn gọn, tập trung sâu sắc vào tối ưu hóa chi phí giáo viên, đẩy mạnh tuyển sinh số và áp dụng gamification để giữ chân học sinh giảm tỷ lệ rớt môn. Xuất ra markdown rành mạch, ngôn từ thực tế, quyết đoán, bằng tiếng Việt.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert startup advisor and experienced education business development director.",
        temperature: 0.6,
      }
    });

    res.json({ insights: response.text });
  } catch (error: any) {
    console.error("Manager Insights AI error:", error);
    res.status(500).json({ 
      error: error.message || "Something went wrong",
      fallback: "### Cố vấn Quản trị - Khuyến nghị Chiến lược (Dự phòng):\n\n1. **Chuẩn hóa khung năng lực giáo viên:** Triển khai cơ chế trợ giảng số giúp giảm 25% thời gian chấm bài thủ công.\n2. **Tận dụng tối đa học thuật kéo:** Ra mắt gói học thử chuyên ngành Software Engineering ngắn hạn nhắm tới đối tượng chuyển ngành.\n3. **Cải tiến tỷ lệ giữ chân:** Thiết lập hệ thống thông báo tự động SMS cho phụ huynh và cảnh báo sớm GPA < 2.5."
    });
  }
});

// 4. API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "LMS Pro backend is live!" });
});


// -------------------------------------------------------------
// VITE OR STATIC SERVING INTEGRATION
// -------------------------------------------------------------
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted successfully.");
  } else {
    // Production client serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production assets from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LMS SERVER] Live and listening on URL: http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Critical server bootstrap failure:", err);
});
