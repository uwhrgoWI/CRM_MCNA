import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Create resilient client Gemini API
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
// CRM AI API ENDPOINTS
// -------------------------------------------------------------

// 1. CRM Sales Assistant AI (Email writing, script suggestions, objection handling)
app.post("/api/gemini/sales-assistant", async (req, res) => {
  try {
    const { message, history, context } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = 
      "You are 'MCNA CRM Sales Assistant', an elite B2B and B2C sales consultant. " +
      "You guide sales representatives on client communication, objection handling, follow-up strategies, and pitch structuring. " +
      "Respond in a professional, persuasive, commercial, and clear tone using well-structured markdown. " +
      "If applicable, structure your feedback using bullet points and brief text templates for communication." +
      ` Client context if any: ${JSON.stringify(context || {})}.` +
      " Keep answers concise but commercially deep. Always answer in Vietnamese unless requested otherwise.";

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
    console.error("Sales Assistant AI error:", error);
    res.status(500).json({ 
      error: error.message || "Something went wrong",
      fallback: "Chào bạn! Tôi là MCNA CRM Sales Assistant. Hệ thống hiện chưa kết nối API Gemini thực tế. Tuy nhiên, tôi khuyên bạn nên tập trung vào việc phản hồi khách hàng trong dưới 5 phút, xây dựng kịch bản xử lý từ chối dựa trên giá trị cốt lõi (ROI) và lên lịch theo sát (follow-up) định kỳ để tăng tỷ lệ chốt hợp đồng!"
    });
  }
});

// 2. Lead Scorer & Strategy Engine (Lead Scoring & Strategy Recommendations)
app.post("/api/gemini/lead-scorer", async (req, res) => {
  const { leadName, industry, budget, interactionCount } = req.body || {};
  try {
    const ai = getGeminiClient();

    const prompt = `Hãy phân tích và thực hiện chấm điểm tiềm năng (Lead Scoring) chi tiết cho khách hàng: "${leadName || 'Khách hàng tiềm năng vãng lai'}".
Lĩnh vực hoạt động: "${industry || 'Chưa xác định'}".
Ngân sách dự kiến: "${budget || 'Chưa cấu hình ngân sách'}".
Số lần tương tác tích lũy trên CRM: ${interactionCount || 1} lần.

Yêu cầu thiết lập đánh giá gồm:
- Chấm điểm số tiềm năng trực quan trên thang điểm 100 kèm xếp loại phễu (Hot / Warm / Cold Lead).
- Phân tích ngắn gọn 2-3 cơ hội hoặc rào cản cốt lõi (Pain points / Objections) dựa trên hồ sơ.
- Đề xuất 01 Kịch bản hành động kế tiếp tối ưu nhất (Next-Best-Action) kèm mẫu câu mở lời nhanh cho Sales Rep.

Hãy xuất kết quả bằng Markdown sinh động đẹp mắt, phân cấp rõ ràng bằng các tiêu đề h3, h4, ranh giới kẻ ngang. Trả lời bằng tiếng Việt.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert sales operations analyst and senior CRM architect. You evaluate lead conversion probabilities with extreme accuracy and commercial insight.",
        temperature: 0.5,
      }
    });

    res.json({ content: response.text });
  } catch (error: any) {
    console.error("Lead Scorer error:", error);
    res.status(500).json({ 
      error: error.message || "Something went wrong",
      fallback: `### Đánh Giá Cơ Hội Khách Hàng Mẫu: ${leadName || 'Doanh nghiệp SME'} (Bản dự phòng)\n\n*Hệ thống đang chạy chế độ Offline. Khung quy chuẩn đánh giá chiến lược:*\n\n#### Khối 1: Phân hạng & Chấm điểm\n- **Trạng thái:** Warm Lead (65/100 điểm).\n- **Cơ hội:** Khách hàng có nhu cầu số hóa quy trình tương tác nội bộ.\n\n#### Khối 2: Hành động kế tiếp khuyến nghị\n- **Chiến thuật:** Thiết lập cuộc gọi Demo giải pháp 1-1 trực tiếp, tập trung giải quyết bài toán tối ưu chi phí vận hành.`
    });
  }
});

// 3. Manager Performance & Pipeline Advisor AI (Pipeline Insights & Sales Strategy Recommendations)
app.post("/api/gemini/pipeline-insights", async (req, res) => {
  try {
    const { stats, currentReps, totalLeads } = req.body;
    const ai = getGeminiClient();

    const prompt = `Với tư cách cố vấn chiến lược và Giám đốc Kinh doanh (CCO), phân tích nhanh bộ dữ liệu hiện trạng phễu bán hàng sau để đề xuất 3 giải pháp đột phá giúp tăng tỷ lệ chuyển đổi và doanh thu tài khóa:
- Tổng số Leads hiện có trong hệ thống: ${totalLeads || 500} khách hàng tiềm năng.
- Quy mô lực lượng Sales Rep vận hành: ${currentReps || '12'} nhân sự.
- Tổng giá trị giao dịch kỳ vọng trong phễu (Pipeline Value): ${stats.pipelineValue || '1.5 Tỷ VNĐ'}.
- Tỷ lệ chốt deal trung bình (Win Rate): ${stats.winRate || '8.5%'}.
- Phân khúc sản phẩm chính: Giải pháp phần mềm B2B, Gói dịch vụ số hóa doanh nghiệp, Tư vấn giải pháp tích hợp hệ thống.

Hãy đưa ra bình luận sắc bén và 3 sáng kiến độc quyền ngắn gọn, tập trung sâu sắc vào tăng tốc thời gian phản hồi lead, tối ưu hóa quy trình phân phối cơ hội (Lead routing) tự động và kịch bản bám sát khách hàng cũ để up-sell. Xuất ra markdown rành mạch, ngôn từ thực tế, quyết đoán, bằng tiếng Việt.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Chief Commercial Officer (CCO) and high-growth B2B SaaS business development consultant.",
        temperature: 0.6,
      }
    });

    res.json({ insights: response.text });
  } catch (error: any) {
    console.error("Pipeline Insights AI error:", error);
    res.status(500).json({ 
      error: error.message || "Something went wrong",
      fallback: "### Cố vấn Quản trị Sales - Khuyến nghị Chiến lược Pipeline (Dự phòng):\n\n1. **Chuẩn hóa Lead Routing:** Cài đặt cơ chế phân phối thông minh, đảm bảo lead mới được chuyển giao cho Sales Rep phù hợp trong vòng dưới 3 phút.\n2. **Tối ưu hóa phễu chuyển đổi:** Tổ chức chuỗi Workshop chia sẻ giá trị thực tế để làm nóng lại nhóm 'Lead đóng băng' quá 45 ngày.\n3. **Số hóa báo cáo tự động:** Giảm thiểu 30% thời gian cập nhật dữ liệu thủ công của nhân sự bằng cách tích hợp trực tiếp cổng log cuộc gọi."
    });
  }
});

// 4. API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "MCNA CRM VN backend is live!" });
});

// -------------------------------------------------------------
// VITE OR STATIC SERVING INTEGRATION
// -------------------------------------------------------------
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production assets from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CRM SERVER] Live and listening on URL: http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Critical server bootstrap failure:", err);
});
